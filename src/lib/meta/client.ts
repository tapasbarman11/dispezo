const API_VERSION = "v23.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export class MetaApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "MetaApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
  console.log("Meta URL:", url);
  console.log("Meta Response:", JSON.stringify(json, null, 2));

  throw new MetaApiError(
    json?.error?.message || "Meta Graph API request failed",
    response.status
  );
}

  return json as T;
}

export async function metaGET<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  return request<T>(endpoint, accessToken, {
    method: "GET",
  });
}

export async function metaPOST<T>(
  endpoint: string,
  accessToken: string,
  body: unknown
): Promise<T> {
  return request<T>(endpoint, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function metaDELETE<T>(
  endpoint: string,
  accessToken: string
): Promise<T> {
  return request<T>(endpoint, accessToken, {
    method: "DELETE",
  });
}