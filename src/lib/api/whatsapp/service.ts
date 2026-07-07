import { encrypt, decrypt, } from "@/lib/crypto";
import { verifyWhatsAppConnection } from "@/lib/meta/status";

import {
  getConnection,
  saveConnection as saveConnectionRepository,
  updateConnection,
  deleteConnection,
} from "./repository";

export async function verifyConnection(
  accessToken: string,
  wabaId: string
) {
  return verifyWhatsAppConnection(
    accessToken,
    wabaId
  );
}

export async function saveConnection(
  accessToken: string,
  wabaId: string,
  organizationId: string,
  userId: string
) {
  const meta = await verifyWhatsAppConnection(
    accessToken,
    wabaId
  );
console.log("SERVICE META");
console.log(meta);
  const encryptedToken = encrypt(accessToken);

  const connection = await saveConnectionRepository({
    organizationId,
    createdByUserId: userId,

    businessId: meta.businessId ?? "",
    businessName: meta.businessName ?? "",

    wabaId,

    phoneNumberId: meta.phoneNumberId,
    displayPhoneNumber: meta.displayPhoneNumber,

    verifiedName: meta.verifiedName,

    accessToken: encryptedToken,

    qualityRating: meta.qualityRating,
    messagingLimit: meta.messagingLimit,

    appId: "",
    tokenType: "PERMANENT",
  });

  return {
    connection,
    meta,
  };
}

export async function getConnectionByOrganization(
  organizationId: string
) {
  return getConnection(organizationId);
}

export async function refreshConnection(
  organizationId: string
) {
  const connection =
    await getConnection(
      organizationId
    );

  if (!connection) {

    throw new Error(
      "WhatsApp account not found."
    );

  }

  const accessToken =
    decrypt(connection.access_token);

  const meta =
    await verifyWhatsAppConnection(
      accessToken,
      connection.waba_id
    );

  await updateConnection(
    organizationId,
    {
      meta_business_name:
        meta.businessName,

      display_name:
        meta.verifiedName,

      phone_number:
        meta.displayPhoneNumber,

      quality_rating:
        meta.qualityRating,

      messaging_limit:
        meta.messagingLimit,

      status: "connected",

      webhook_status: "active",

      last_synced_at:
        new Date(),
    }
  );

  return getConnection(
    organizationId
  );
}

export async function disconnect(
  organizationId: string
) {
  return deleteConnection(
    organizationId
  );
}