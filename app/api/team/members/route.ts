import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { assertCanAddTeamMember, requireOrgRole } from "@/lib/billing/access";

async function context() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const organizationId = (session?.user as any)?.organizationId as string | undefined;
  if (!userId || !organizationId) throw new Error("Unauthorized");
  return { userId, organizationId };
}

export async function GET() {
  try {
    const { organizationId } = await context();
    const result = await pool.query(
      `SELECT m.id, m.user_id AS "userId", u.full_name AS "fullName",
              u.email, m.role, m.status, m.created_at AS "createdAt"
       FROM organization_members m
       JOIN users u ON u.id=m.user_id
       WHERE m.organization_id=$1
       ORDER BY CASE m.role WHEN 'OWNER' THEN 0 WHEN 'ADMIN' THEN 1 ELSE 2 END, m.created_at ASC`,
      [organizationId]
    );
    return NextResponse.json({ success: true, members: result.rows });
  } catch (error: any) {
    return NextResponse.json({ success:false, message:error.message || "Unauthorized" }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, organizationId } = await context();
    await requireOrgRole(organizationId, userId, ["OWNER","ADMIN"]);
    await assertCanAddTeamMember(organizationId);

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "MEMBER").toUpperCase();

    if (!email) return NextResponse.json({ success:false, message:"Email is required." }, { status:400 });
    if (!["ADMIN","MEMBER"].includes(role)) return NextResponse.json({ success:false, message:"Role must be ADMIN or MEMBER." }, { status:400 });

    const user = await pool.query(
      `SELECT id, email, full_name AS "fullName" FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1`,
      [email]
    );
    if (!user.rows.length) {
      return NextResponse.json(
        { success:false, message:"User must create a Dispezo account first. Then you can add them to this organization." },
        { status:404 }
      );
    }

    const member = await pool.query(
      `INSERT INTO organization_members
        (id,organization_id,user_id,role,status,created_at,updated_at)
       VALUES (gen_random_uuid(),$1,$2,$3,'ACTIVE',NOW(),NOW())
       ON CONFLICT (organization_id,user_id) DO UPDATE
       SET role=EXCLUDED.role,status='ACTIVE',updated_at=NOW()
       RETURNING id,user_id AS "userId",role,status,created_at AS "createdAt"`,
      [organizationId, user.rows[0].id, role]
    );

    return NextResponse.json({ success:true, member: { ...member.rows[0], email:user.rows[0].email, fullName:user.rows[0].fullName } }, { status:201 });
  } catch (error:any) {
    return NextResponse.json({ success:false, message:error.message || "Unable to add team member." }, { status:500 });
  }
}
