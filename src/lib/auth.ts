import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 30 * 60,
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.googleId = account.providerAccountId;

        if (profile) {
          token.picture =
            (profile as { picture?: string }).picture || null;
        }
      }

      if (token.email) {
        console.log("JWT email:", token.email);

        try {
          const result = await pool.query(
            `
            SELECT
              u.id,
              COALESCE(m.organization_id, o.id) AS organization_id,
              COALESCE(m.role, 'OWNER') AS role,
              COALESCE(org.plan_code, 'FREE') AS plan_code
            FROM users u
            LEFT JOIN organizations o ON o.owner_user_id=u.id AND o.is_default=true
            LEFT JOIN LATERAL (
              SELECT om.organization_id, om.role
              FROM organization_members om
              JOIN organizations mo ON mo.id=om.organization_id
              WHERE om.user_id=u.id AND om.status='ACTIVE'
              ORDER BY CASE WHEN om.role='OWNER' THEN 0 ELSE 1 END, mo.is_default DESC, om.created_at ASC
              LIMIT 1
            ) m ON true
            LEFT JOIN organizations org ON org.id=COALESCE(m.organization_id,o.id)
            WHERE u.email=$1
            LIMIT 1
            `,
            [token.email]
          );

          console.log("DB user:", result.rows);

          if (result.rows.length > 0) {
            token.userId = result.rows[0].id;
            token.organizationId = result.rows[0].organization_id;
            token.role = result.rows[0].role;
            token.planCode = result.rows[0].plan_code;
          } else {
            token.userId = undefined;
            token.organizationId = undefined;
          }
        } catch (err) {
          console.error("JWT DB Error:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).googleId = token.googleId;
        (session.user as any).picture = token.picture;
        (session.user as any).id = token.userId;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).role = token.role;
        (session.user as any).planCode = token.planCode;

        // Re-resolve the current organization on every server session read.
        // This is important immediately after onboarding creates the user's
        // organization: the existing JWT can predate that organization.
        // It also makes older sessions resilient to membership changes.
        if (session.user.email) {
          try {
            const result = await pool.query(
              `
              SELECT
                u.id,
                COALESCE(m.organization_id, o.id) AS organization_id,
                COALESCE(m.role, 'OWNER') AS role,
                COALESCE(org.plan_code, 'FREE') AS plan_code
              FROM users u
              LEFT JOIN organizations o
                ON o.owner_user_id = u.id
               AND o.is_default = true
              LEFT JOIN LATERAL (
                SELECT om.organization_id, om.role
                FROM organization_members om
                JOIN organizations mo ON mo.id = om.organization_id
                WHERE om.user_id = u.id
                  AND om.status = 'ACTIVE'
                ORDER BY
                  CASE WHEN om.role = 'OWNER' THEN 0 ELSE 1 END,
                  mo.is_default DESC,
                  om.created_at ASC
                LIMIT 1
              ) m ON true
              LEFT JOIN organizations org
                ON org.id = COALESCE(m.organization_id, o.id)
              WHERE u.email = $1
              LIMIT 1
              `,
              [session.user.email]
            );

            if (result.rows.length > 0) {
              const row = result.rows[0];
              (session.user as any).id = row.id;
              (session.user as any).organizationId = row.organization_id;
              (session.user as any).role = row.role;
              (session.user as any).planCode = row.plan_code;
            }
          } catch (err) {
            // Keep the JWT-derived values if the refresh lookup fails.
            console.error("Session organization refresh failed:", err);
          }
        }
      }

      return session;
    },
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",

      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
