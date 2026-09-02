import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import pool from "@/lib/db";

const META_API_VERSION =
  process.env.META_API_VERSION || "v23.0";

const META_GRAPH_URL =
  `https://graph.facebook.com/${META_API_VERSION}`;

interface EmbeddedSignupBody {
  code?: string;
  event?: string;
  wabaId?: string | null;
  phoneNumberId?: string | null;
  businessId?: string | null;
}

async function metaGet(
  path: string,
  accessToken: string
) {
  const response = await fetch(
    `${META_GRAPH_URL}${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Meta API request failed."
    );
  }

  return data;
}

async function metaPost(
  path: string,
  accessToken: string,
  body: Record<string, unknown>
) {
  const response = await fetch(
    `${META_GRAPH_URL}${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Meta API request failed."
    );
  }

  return data;
}

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const organizationId =
      (session.user as any).organizationId;

    const userId =
      (session.user as any).id;

    if (!organizationId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Organization or user information is missing from the session.",
        },
        { status: 400 }
      );
    }

    const body =
      (await req.json()) as EmbeddedSignupBody;

    const code =
      body.code?.trim();

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Meta authorization code is required.",
        },
        { status: 400 }
      );
    }

    const appId =
      process.env.META_APP_ID;

    const appSecret =
      process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
      throw new Error(
        "META_APP_ID or META_APP_SECRET is missing."
      );
    }

    /*
     * --------------------------------------------------
     * 1. Exchange Embedded Signup code for access token
     * --------------------------------------------------
     */

    const tokenUrl =
      `${META_GRAPH_URL}/oauth/access_token` +
      `?client_id=${encodeURIComponent(appId)}` +
      `&client_secret=${encodeURIComponent(appSecret)}` +
      `&code=${encodeURIComponent(code)}`;

    const tokenResponse =
      await fetch(tokenUrl, {
        method: "GET",
        cache: "no-store",
      });

    const tokenData =
      await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error(
        "Meta token exchange failed:",
        tokenData
      );

      throw new Error(
        tokenData?.error?.message ||
          "Unable to exchange Meta authorization code."
      );
    }

    const accessToken =
      tokenData.access_token;

    if (!accessToken) {
      throw new Error(
        "Meta did not return an access token."
      );
    }

    /*
     * --------------------------------------------------
     * 2. Get WABA ID
     * --------------------------------------------------
     */

    const wabaId =
      body.wabaId?.trim();

    if (!wabaId) {
      throw new Error(
        "Meta did not return a WABA ID."
      );
    }

    /*
     * --------------------------------------------------
     * 3. Read WABA
     * --------------------------------------------------
     */

    const waba =
      await metaGet(
        `/${wabaId}?fields=id,name`,
        accessToken
      );

    /*
     * --------------------------------------------------
     * 4. Get phone numbers belonging to WABA
     * --------------------------------------------------
     */

    const phoneNumbers =
      await metaGet(
        `/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,messaging_limit`,
        accessToken
      );

    const numbers =
      phoneNumbers?.data || [];

    /*
     * For Coexistence the browser event can omit
     * phone_number_id, so discover it from WABA.
     *
     * If Meta did return phone_number_id, prefer it.
     */

    let phoneNumber =
      body.phoneNumberId
        ? numbers.find(
            (item: any) =>
              item.id ===
              body.phoneNumberId
          )
        : null;

    if (!phoneNumber) {
      if (numbers.length === 1) {
        phoneNumber = numbers[0];
      }
    }

    if (!phoneNumber) {
      throw new Error(
        "Unable to determine the WhatsApp phone number connected during Embedded Signup."
      );
    }

    const phoneNumberId =
      phoneNumber.id;

    /*
     * --------------------------------------------------
     * 5. Determine business ID
     * --------------------------------------------------
     */

    let businessId =
      body.businessId?.trim() ||
      null;

    /*
     * Try WABA business ownership information.
     */

    if (!businessId) {
      try {
        const businessInfo =
          await metaGet(
            `/${wabaId}?fields=owner_business_info`,
            accessToken
          );

        businessId =
          businessInfo?.owner_business_info?.id ||
          null;
      } catch (error) {
        console.warn(
          "Unable to resolve business ID:",
          error
        );
      }
    }

    /*
     * --------------------------------------------------
     * 6. Determine whether this is Coexistence
     * --------------------------------------------------
     */

    const isCoexistence =
      body.event ===
      "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING";

    /*
     * --------------------------------------------------
     * 7. Subscribe app to WABA
     * --------------------------------------------------
     */

    try {
      await metaPost(
        `/${wabaId}/subscribed_apps`,
        accessToken,
        {}
      );
    } catch (error) {
      console.error(
        "Unable to subscribe WABA to app:",
        error
      );

      throw new Error(
        "WhatsApp account was connected, but Meta webhook subscription failed."
      );
    }

    /*
     * --------------------------------------------------
     * 8. Coexistence setup
     *
     * Do NOT register the phone number again.
     * It is already registered for WhatsApp Business App.
     *
     * Meta expects the sync requests through:
     *
     * POST /{phone_number_id}/smb_app_data
     * --------------------------------------------------
     */

    if (isCoexistence) {
      console.log(
        "Coexistence onboarding detected."
      );

      try {
        await metaPost(
          `/${phoneNumberId}/smb_app_data`,
          accessToken,
          {
            messaging_product:
              "whatsapp",
            sync_type:
              "smb_app_state_sync",
          }
        );

        console.log(
          "Coexistence contact sync requested."
        );
      } catch (error) {
        console.error(
          "Contact sync request failed:",
          error
        );
      }

      try {
        await metaPost(
          `/${phoneNumberId}/smb_app_data`,
          accessToken,
          {
            messaging_product:
              "whatsapp",
            sync_type:
              "history",
          }
        );

        console.log(
          "Coexistence history sync requested."
        );
      } catch (error) {
        console.error(
          "History sync request failed:",
          error
        );
      }
    }

    /*
     * --------------------------------------------------
     * 9. Encrypt token before DB storage
     * --------------------------------------------------
     */

    const encryptedToken =
      encrypt(accessToken);

    /*
     * --------------------------------------------------
     * 10. Save connection
     * --------------------------------------------------
     */

    const result =
      await pool.query(
        `
        INSERT INTO whatsapp_accounts
        (
          organization_id,
          created_by_user_id,
          business_manager_id,
          business_id,
          meta_business_name,
          waba_id,
          phone_number_id,
          access_token,
          phone_number,
          display_name,
          verified_name,
          quality_rating,
          messaging_limit,
          app_id,
          token_type,
          status,
          webhook_status,
          webhook_verified,
          webhook_subscribed,
          coexistence_enabled,
          is_coexistence,
          connected_at,
          last_synced_at,
          updated_at
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          'EMBEDDED_SIGNUP',
          'connected',
          'active',
          false,
          true,
          $15,
          $15,
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (organization_id)
        DO UPDATE SET
          created_by_user_id =
            EXCLUDED.created_by_user_id,

          business_manager_id =
            EXCLUDED.business_manager_id,

          business_id =
            EXCLUDED.business_id,

          meta_business_name =
            EXCLUDED.meta_business_name,

          waba_id =
            EXCLUDED.waba_id,

          phone_number_id =
            EXCLUDED.phone_number_id,

          access_token =
            EXCLUDED.access_token,

          phone_number =
            EXCLUDED.phone_number,

          display_name =
            EXCLUDED.display_name,

          verified_name =
            EXCLUDED.verified_name,

          quality_rating =
            EXCLUDED.quality_rating,

          messaging_limit =
            EXCLUDED.messaging_limit,

          app_id =
            EXCLUDED.app_id,

          token_type =
            EXCLUDED.token_type,

          status =
            'connected',

          webhook_status =
            'active',

          webhook_subscribed =
            true,

          coexistence_enabled =
            EXCLUDED.coexistence_enabled,

          is_coexistence =
            EXCLUDED.is_coexistence,

          connected_at =
            NOW(),

          last_synced_at =
            NOW(),

          updated_at =
            NOW()

        RETURNING *
        `,
        [
          organizationId,
          userId,

          businessId,

          businessId,

          waba?.name || null,

          wabaId,

          phoneNumberId,

          encryptedToken,

          phoneNumber.display_phone_number ||
            null,

          phoneNumber.verified_name ||
            null,

          phoneNumber.verified_name ||
            null,

          phoneNumber.quality_rating ||
            null,

          phoneNumber.messaging_limit ||
            null,

          appId,

          isCoexistence,
        ]
      );

    return NextResponse.json({
      success: true,

      whatsappConnected: true,

      connection: {
        id: result.rows[0].id,
        wabaId,
        phoneNumberId,
        businessId,
        isCoexistence,
        phoneNumber:
          phoneNumber.display_phone_number,
        verifiedName:
          phoneNumber.verified_name,
      },
    });
  } catch (error: any) {
    console.error(
      "Embedded Signup error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to complete Embedded Signup.",
      },
      {
        status: 500,
      }
    );
  }
}