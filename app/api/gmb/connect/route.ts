import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

//-----------------------------------------------------
// GET — redirect to Google's OAuth consent screen,
// requesting the Business Profile management scope.
// This is separate from NextAuth's login flow, which
// only requests basic profile/email scopes.
//-----------------------------------------------------

export async function GET() {

    const session = await getServerSession(authOptions);

    const organizationId = (session?.user as any)?.organizationId;

    if (!organizationId) {

        return NextResponse.redirect(
            new URL("/login", process.env.NEXTAUTH_URL)
        );

    }

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/gmb/callback`,
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
        scope: "https://www.googleapis.com/auth/business.manage",
        // Carry the organizationId through the OAuth round trip so
        // the callback knows which org this connection belongs to.
        state: organizationId,
    });

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );

}
