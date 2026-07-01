import { encrypt } from "@/lib/crypto";
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
  const connection = await getConnection(
    organizationId
  );

  if (!connection) {
    throw new Error(
      "WhatsApp account not found."
    );
  }

  await updateConnection(
    organizationId,
    {
      quality_rating: connection.quality_rating,
      messaging_limit: connection.messaging_limit,
      status: "connected",
      webhook_status: "active",
      last_synced_at: new Date(),
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