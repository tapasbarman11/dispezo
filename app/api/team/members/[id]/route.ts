import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { requireOrgRole } from "@/lib/billing/access";

async function context() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  const organizationId = (session?.user as any)?.organizationId as string | undefined;
  if (!userId || !organizationId) throw new Error("Unauthorized");
  return { userId, organizationId };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, organizationId } = await context();
    await requireOrgRole(organizationId, userId, ["OWNER","ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const role = String(body.role || "").toUpperCase();
    const status = String(body.status || "").toUpperCase();

    if (role && !["ADMIN","MEMBER"].includes(role)) return NextResponse.json({success:false,message:"Role must be ADMIN or MEMBER."},{status:400});
    if (status && !["ACTIVE","SUSPENDED"].includes(status)) return NextResponse.json({success:false,message:"Invalid member status."},{status:400});

    const result = await pool.query(
      `UPDATE organization_members
       SET role=COALESCE(NULLIF($3,''),role),
           status=COALESCE(NULLIF($4,''),status),
           updated_at=NOW()
       WHERE id=$1 AND organization_id=$2 AND role <> 'OWNER'
       RETURNING id,user_id AS "userId",role,status,updated_at AS "updatedAt"`,
      [id, organizationId, role, status]
    );
    if (!result.rows.length) return NextResponse.json({success:false,message:"Member not found or cannot modify owner."},{status:404});
    return NextResponse.json({success:true,member:result.rows[0]});
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message || "Unable to update member."},{status:500});
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId, organizationId } = await context();
    await requireOrgRole(organizationId, userId, ["OWNER","ADMIN"]);
    const { id } = await params;
    const result = await pool.query(
      `DELETE FROM organization_members
       WHERE id=$1 AND organization_id=$2 AND role <> 'OWNER'
       RETURNING id`,
      [id,organizationId]
    );
    if (!result.rows.length) return NextResponse.json({success:false,message:"Member not found or cannot remove owner."},{status:404});
    return NextResponse.json({success:true});
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message || "Unable to remove member."},{status:500});
  }
}
