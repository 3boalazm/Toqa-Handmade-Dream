import type { IncomingMessage, ServerResponse } from "node:http";

/** Tiny health probe so the Vercel deployment can be checked with one request. */
export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ status: "ok" }));
}
