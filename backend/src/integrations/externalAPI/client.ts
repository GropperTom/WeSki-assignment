import type { ExternalAPIRequestBody } from "./types.js";

export const EXTERNAL_API_URL =
  "https://gya7b1xubh.execute-api.eu-west-2.amazonaws.com/default/HotelsSimulator";

export async function fetchExternalAPI(
  body: ExternalAPIRequestBody,
  signal?: AbortSignal,
): Promise<unknown> {
  console.log(
    `[externalAPI] Sending request (group_size=${body.query.group_size})`,
    body,
  );

  const response = await fetch(EXTERNAL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`External API request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(
    `[externalAPI] Received response (group_size=${body.query.group_size})`,
  );

  return data;
}
