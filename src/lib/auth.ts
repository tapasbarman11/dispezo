
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
        maxAge: 30 * 60, // 30 mins
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

            // Load DB user once
            if (token.email) {
                console.log("JWT email:", token.email);
                try {
                    const result = await pool.query(
                        `
  SELECT
      u.id,
      o.id AS organization_id
  FROM users u

  LEFT JOIN organizations o
      ON o.owner_user_id = u.id

  WHERE u.email = $1

  LIMIT 1
  `,
                        [token.email]
                    );

                    console.log("DB user:", result.rows);

                    if (result.rows.length) {
                        token.userId = result.rows[0].id;
                        token.organizationId = result.rows[0].organization_id;
                    }
                } catch (err) {
                    console.error("JWT DB Error:", err);
                    throw err;
                }
            }

            return token;
        },

        async session({ session, token }) {

            if (session.user) {

                (session.user as any).googleId =
                    token.googleId;

                (session.user as any).picture =
                    token.picture;

                (session.user as any).id =
                    token.userId;

                (session.user as any).organizationId =
                    token.organizationId;

            }

            return session;

        }
    },
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: false, // allow HTTP for now (no SSL yet)
            },
        },
    },
};

