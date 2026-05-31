import type { ExternalAPIRequestBody } from "./types.js";

export const EXTERNAL_API_URL =
  "https://gya7b1xubh.execute-api.eu-west-2.amazonaws.com/default/HotelsSimulator";

export async function fetchExternalAPI(
  body: ExternalAPIRequestBody,
): Promise<unknown> {
  console.log("[externalAPI] Sending request", body);

  const response = await fetch(EXTERNAL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`External API request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log("[externalAPI] Received response");

  return data;
}
