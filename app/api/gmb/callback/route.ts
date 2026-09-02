import { NextRequest, NextResponse } from "next/server";
import { upsertGoogleAccount } from "@/lib/api/gmb/repository";
import { encrypt } from "@/lib/crypto";

//-----------------------------------------------------
// GET — Google redirects here after the business grants
// consent. Exchange the code for tokens, resolve their
// first Business Profile account + location automatically
// (v1 simplification — multi-location picker can follow),
// and store the connection.
//-----------------------------------------------------

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);

    const code = searchParams.get("code");
    const organizationId = searchParams.get("state");
    const error = searchParams.get("error");

    const redirectBase = process.env.NEXTAUTH_URL;

    if (error || !code || !organizationId) {

        return NextResponse.redirect(
            `${redirectBase}/google-reviews?error=connect_failed`
        );

    }

    try {

        // 1. Exchange authorization code for tokens.
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${redirectBase}/api/gmb/callback`,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenRes.json();

        if (!tokens.access_token) {

            console.error("GMB token exchange failed:", tokens);

            return NextResponse.redirect(
                `${redirectBase}/google-reviews?error=token_exchange_failed`
            );

        }

        // 2. Fetch the business's Google Business Profile accounts.
        const accountsRes = await fetch(
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );

        const accountsData = await accountsRes.json();

        const firstAccount = accountsData.accounts?.[0];

        if (!firstAccount) {

            return NextResponse.redirect(
                `${redirectBase}/google-reviews?error=no_business_account`
            );

        }

        const googleAccountId = firstAccount.name.split("/").pop();

        // 3. Fetch that account's first location.
        const locationsRes = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${firstAccount.name}/locations?readMask=title,phoneNumbers,storefrontAddress`,
            { headers: { Authorization: `Bearer ${tokens.access_token}` } }
        );

        const locationsData = await locationsRes.json();

        const firstLocation = locationsData.locations?.[0];

        if (!firstLocation) {

            return NextResponse.redirect(
                `${redirectBase}/google-reviews?error=no_location_found`
            );

        }

        const locationId = firstLocation.name.split("/").pop();

        // 4. Store the connection (tokens encrypted).
        await upsertGoogleAccount({
            organizationId,
            googleAccountId,
            locationId,
            locationName: firstLocation.title,
            businessName: firstLocation.title,
            address: firstLocation.storefrontAddress
                ? [
                    ...(firstLocation.storefrontAddress.addressLines || []),
                    firstLocation.storefrontAddress.locality,
                    firstLocation.storefrontAddress.administrativeArea,
                ].filter(Boolean).join(", ")
                : undefined,
            accessToken: encrypt(tokens.access_token),
            refreshToken: encrypt(tokens.refresh_token || ""),
        });

        return NextResponse.redirect(
            `${redirectBase}/google-reviews?connected=true`
        );

    } catch (err) {

        console.error("GMB callback error:", err);

        return NextResponse.redirect(
            `${redirectBase}/google-reviews?error=unexpected_error`
        );

    }

}
