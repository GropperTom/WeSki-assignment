import { Router } from "express";
import { ZodError } from "zod";
import { parseHotelSearchQuery } from "../schemas/hotelSearchSchema.js";
import { streamHotelSearch } from "../services/streamHotelSearch.js";

export const hotelsRouter = Router();

hotelsRouter.get("/search/stream", async (req, res) => {
  try {
    const query = parseHotelSearchQuery(req.query);
    console.log("[hotel-search] Search request validated", query);
    await streamHotelSearch(query, res, req);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: error.issues[0]?.message ?? "Invalid search query",
      });
      return;
    }

    if (error instanceof Error) {
      res.status(502).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Internal server error" });
  }
});
