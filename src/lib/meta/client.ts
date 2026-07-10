const API_VERSION = "v23.0";

const BASE_URL =
  `https://graph.facebook.com/${API_VERSION}`;

//-----------------------------------------------------
// Meta API Error
//-----------------------------------------------------

export class MetaApiError extends Error {

  status: number;

  constructor(
    message: string,
    status = 500
  ) {

    super(message);

    this.name =
      "MetaApiError";

    this.status =
      status;

  }

}

//-----------------------------------------------------
// Common Request
//-----------------------------------------------------

async function request<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {

  const url =
    `${BASE_URL}${endpoint}`;

  console.log("REQUEST URL");
  console.log(url);

  console.log("REQUEST BODY");
  console.log(options.body);
  console.log("REQUEST HEADERS");
  console.log({
    Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
    "Content-Type": "application/json",
  });
  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {

          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",

          ...(options.headers || {}),

        },

        cache: "no-store",

      }
    );

  const json =
    await response.json();

  if (!response.ok) {

    console.error(
      "Meta URL:",
      url
    );

    console.error(
      "Meta Response:",
      JSON.stringify(
        json,
        null,
        2
      )
    );

    throw new MetaApiError(

      json?.error?.message ??
      "Meta Graph API request failed",

      response.status

    );

  }

  return json as T;

}

//-----------------------------------------------------
// GET
//-----------------------------------------------------

export async function metaGET<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {

  return request<T>(
    endpoint,
    accessToken,
    {
      method: "GET",
    }
  );

}

//-----------------------------------------------------
// POST
//-----------------------------------------------------

export async function metaPOST<T>(
  endpoint: string,
  accessToken: string,
  body: unknown
): Promise<T> {

  return request<T>(
    endpoint,
    accessToken,
    {
      method: "POST",

      body:
        JSON.stringify(body),

    }
  );

}

//-----------------------------------------------------
// DELETE
//-----------------------------------------------------

//-----------------------------------------------------
// Upload Media for Template Header
// Two-step Meta resumable upload:
// 1. Create upload session → get session ID
// 2. Upload bytes to session → get handle
//-----------------------------------------------------

export async function uploadMediaForTemplate(
  accessToken: string,
  appId: string,
  filePath: string,
  mimeType: string,
  fileLength: number
): Promise<string> {

  const fs = await import("fs");

  // Step 1: Create upload session
  const sessionRes = await fetch(
    `${BASE_URL}/${appId}/uploads?file_length=${fileLength}&file_type=${encodeURIComponent(mimeType)}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const sessionJson = await sessionRes.json();

  if (!sessionJson.id) {
    throw new MetaApiError(
      sessionJson?.error?.message ?? "Failed to create upload session",
      sessionRes.status
    );
  }

  // Step 2: Upload file bytes
  const fileBuffer = fs.readFileSync(filePath);

  const uploadRes = await fetch(
    `${BASE_URL}/${sessionJson.id}`,
    {
      method: "POST",
      headers: {
        Authorization: `OAuth ${accessToken}`,
        "Content-Type": mimeType,
        file_offset: "0",
      },
      body: fileBuffer,
    }
  );

  const uploadJson = await uploadRes.json();

  if (!uploadJson.h) {
    throw new MetaApiError(
      uploadJson?.error?.message ?? "Failed to upload media",
      uploadRes.status
    );
  }

  return uploadJson.h;

}

//-----------------------------------------------------
// DELETE
//-----------------------------------------------------

export async function metaDELETE<T>(
  endpoint: string,
  accessToken: string,
  body?: unknown
): Promise<T> {

  return request<T>(
    endpoint,
    accessToken,
    {

      method: "DELETE",

      ...(body && {

        body:
          JSON.stringify(body),

      }),

    }
  );

}