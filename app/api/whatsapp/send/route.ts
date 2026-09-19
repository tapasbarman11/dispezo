import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { getConnectionByOrganization } from "@/lib/api/whatsapp/service";
import { metaPOST } from "@/lib/meta/client";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
    const organizationId = (session.user as any).organizationId;
    const account = await getConnectionByOrganization(organizationId);
    if (!account) return NextResponse.json({success:false,message:"WhatsApp account not connected."},{status:400});
    const {phoneNumber,templateName,language="en_US",components=[]} = await req.json();
    if (!phoneNumber || !templateName) return NextResponse.json({success:false,message:"Phone number and template are required."},{status:400});
    const accessToken = decrypt(account.access_token);
    const payload:any = {messaging_product:"whatsapp",recipient_type:"individual",to:phoneNumber,type:"template",template:{name:templateName,language:{code:language}}};
    if (Array.isArray(components) && components.length) payload.template.components=components;
    const response = await metaPOST<any>(`/${account.phone_number_id}/messages`,accessToken,payload);
    const messageId = response?.messages?.[0]?.id ?? null;
    await pool.query(
      `INSERT INTO messages (organization_id,campaign_id,phone,template_name,whatsapp_message_id,status,message_source,sent_at)
       VALUES ($1,NULL,$2,$3,$4,$5,'DIRECT_API',NOW())`,
      [organizationId,phoneNumber,templateName,messageId,messageId?"Sent":"Failed"]
    );
    return NextResponse.json({success:true,messageId});
  } catch (error:any) {
    console.error("Direct WhatsApp send error",error);
    return NextResponse.json({success:false,message:error?.message||"Unable to send message."},{status:500});
  }
}
