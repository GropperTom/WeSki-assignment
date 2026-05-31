import type { Request, Response } from "express";
import {
  hotelSearchProviders,
  type HotelSearchProvider,
} from "../integrations/index.js";
import type { HotelSearchQuery } from "../schemas/hotelSearchSchema.js";
import type { HotelSearchStreamEvent } from "../schemas/hotelSearchStreamSchema.js";

function writeStreamEvent(
  res: Response,
  event: HotelSearchStreamEvent,
  signal: AbortSignal,
) {
  if (signal.aborted || res.writableEnded) {
    return;
  }

  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

async function searchProvider(
  provider: HotelSearchProvider,
  query: HotelSearchQuery,
  res: Response,
  signal: AbortSignal,
) {
  if (signal.aborted) {
    return;
  }

  console.log(`[hotel-search] Calling provider: ${provider.name}`, query);

  try {
    const result = await provider.search(query);

    if (signal.aborted) {
      console.log(
        `[hotel-search] Provider ${provider.name} finished after client disconnect`,
      );
      return;
    }

    console.log(
      `[hotel-search] Provider ${provider.name} returned ${result.hotels.length} hotels`,
    );

    writeStreamEvent(
      res,
      {
        type: "provider_result",
        provider: provider.name,
        hotels: result.hotels,
      },
      signal,
    );
  } catch (error) {
    if (signal.aborted) {
      return;
    }

    const message =
      error instanceof Error ? error.message : "Provider search failed";

    console.error(`[hotel-search] Provider ${provider.name} failed:`, message);

    writeStreamEvent(
      res,
      {
        type: "provider_error",
        provider: provider.name,
        message,
      },
      signal,
    );
  }
}

export async function streamHotelSearch(
  query: HotelSearchQuery,
  res: Response,
  req: Request,
) {
  const providers = Object.values(hotelSearchProviders);
  const abortController = new AbortController();

  const onClientDisconnect = () => {
    console.log("[hotel-search] Client disconnected, aborting stream");
    abortController.abort();
  };

  req.on("close", onClientDisconnect);

  // Send 200 immediately so the client can start reading the stream
  // without waiting for provider calls to finish.
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // SSE comment so the client receives bytes immediately after HTTP 200.
  res.write(": connected\n\n");

  console.log(
    `[hotel-search] Stream opened (${providers.length} provider(s))`,
    query,
  );

  try {
    await Promise.allSettled(
      providers.map((provider) =>
        searchProvider(provider, query, res, abortController.signal),
      ),
    );

    if (!abortController.signal.aborted && !res.writableEnded) {
      console.log("[hotel-search] All providers finished, sending done");
      writeStreamEvent(res, { type: "done" }, abortController.signal);
      res.end();
    }
  } finally {
    req.off("close", onClientDisconnect);
  }
}
