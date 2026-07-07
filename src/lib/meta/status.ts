import { metaGET } from "./client";

export interface WhatsAppConnectionInfo {
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName: string;
  qualityRating: string;
  messagingLimit: string;
  businessId?: string;
  businessName?: string;
}

interface DebugTokenResponse {
  data: {
    app_id: string;
    is_valid: boolean;
  };
}

interface PhoneResponse {
  data: {
    id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating?: string;
    status?: string;
    whatsapp_business_manager_messaging_limit?: string;
  }[];
}

interface WabaResponse {
  id: string;
  name: string;
}

interface TemplateResponse {
  data: {
    id: string;
    name: string;
    status: string;
    category: string;
    language: string;
    components?: {
      type: string;
      text?: string;
    }[];
  }[];
}

export async function verifyWhatsAppConnection(
  accessToken: string,
  wabaId: string
): Promise<WhatsAppConnectionInfo> {

  console.log("========== VERIFY WHATSAPP ==========");

  // --------------------------------------------------
  // STEP 1 - Validate Token
  // --------------------------------------------------

  console.log("STEP 1 - Debug Token");

  const debug = await metaGET<DebugTokenResponse>(
    "/debug_token?input_token=" + accessToken,
    accessToken
  );

  console.log("STEP 1 SUCCESS");
  console.log(JSON.stringify(debug, null, 2));

  if (!debug.data.is_valid) {
    throw new Error("Invalid or expired WhatsApp access token.");
  }

  if (!debug.data.app_id) {
    throw new Error(
      "Access token is not associated with any Meta application."
    );
  }

  // --------------------------------------------------
  // STEP 2 - Fetch Phone Numbers
  // --------------------------------------------------

  console.log("STEP 2 - Fetch Phone Numbers");

  const phones = await metaGET<PhoneResponse>(
    `/${wabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,status,whatsapp_business_manager_messaging_limit`,
    accessToken
  );

  console.log("STEP 2 SUCCESS");
  console.log(JSON.stringify(phones, null, 2));

  if (!phones.data.length) {
    throw new Error("No phone numbers found.");
  }

  const phone = phones.data[0];

  // --------------------------------------------------
  // STEP 2A - Fetch Business Account
  // --------------------------------------------------

  console.log("STEP 2A - Fetch Business Account");

  const waba = await metaGET<WabaResponse>(
    `/${wabaId}?fields=name`,
    accessToken
  );

  console.log("STEP 2A SUCCESS");
  console.log(JSON.stringify(waba, null, 2));

  // --------------------------------------------------
  // STEP 3 - Verify Template Access
  // --------------------------------------------------

  console.log("STEP 3 - Fetch Templates");

  const templates = await metaGET<TemplateResponse>(
    `/${wabaId}/message_templates?fields=id,name,status,category,language,components`,
    accessToken
  );

  console.log("STEP 3 SUCCESS");
  console.log(JSON.stringify(templates, null, 2));

  if (!templates.data) {
    throw new Error("Unable to access WhatsApp templates.");
  }

  console.log("========== VERIFY SUCCESS ==========");

  return {
    businessId: waba.id,
    businessName: waba.name,
    wabaId,
    phoneNumberId: phone.id,
    displayPhoneNumber: phone.display_phone_number,
    verifiedName: phone.verified_name,
    qualityRating: phone.quality_rating ?? "UNKNOWN",
    messagingLimit:
      phone.whatsapp_business_manager_messaging_limit ?? "",
  };
}