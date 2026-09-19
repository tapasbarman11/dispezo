import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAudiences } from "@/lib/api/contacts/service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ success: true, audiences: await getAudiences(organizationId) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to load audiences." }, { status: 500 });
  }
}
