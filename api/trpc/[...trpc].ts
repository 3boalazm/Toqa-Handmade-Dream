import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "../../server/_core/context";
import { appRouter } from "../../server/routers";

/**
 * Vercel serverless entry for the tRPC API.
 *
 * `api/trpc/[...trpc].ts` receives every `/api/trpc/*` request (unlock, list and
 * add on the hidden wishes page, plus auth state). Runtime environment
 * variables such as `WISHES_CODE` are read from the Vercel project settings.
 */
const app = express();
app.use(express.json({ limit: "50mb" }));

// Vercel hands the function the full request path, but stay lenient in case a
// router ever passes only the wildcard tail.
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith("/api/trpc")) {
    req.url = `/api/trpc${req.url === "/" ? "" : req.url}`;
  }
  next();
});

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

export default app;
