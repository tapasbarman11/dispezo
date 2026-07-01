import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { verifyConnection } from "@/lib/api/whatsapp/service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Access Token is required.",
        },
        {
          status: 400,
        }
      );
    }

    const meta = await verifyConnection(accessToken);

    return NextResponse.json({
      success: true,

      businessId: meta.businessId,

      businessName: meta.businessName,

      wabaId: meta.wabaId,

      phoneNumberId: meta.phoneNumberId,

      displayPhoneNumber: meta.displayPhoneNumber,

      verifiedName: meta.verifiedName,

      qualityRating: meta.qualityRating,

      messagingLimit: meta.messagingLimit,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to verify WhatsApp connection.",
      },
      {
        status: 500,
      }
    );
  }
}