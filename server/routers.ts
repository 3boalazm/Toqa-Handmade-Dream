import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { addWish, listWishes, verifyWishesCode } from "./wishes";

const WISHES_CODE_ERROR = "الكود مش مظبوط، جرّب تاني.";
const WISHES_CODE_INPUT = z.object({ code: z.string().min(1).max(120) });

/**
 * Wishes on the hidden page. The page is not linked anywhere and every call
 * needs the shared code, so only people who know it can read or write.
 */
const wishesRouter = router({
  /** Checks the code without writing anything. */
  unlock: publicProcedure.input(WISHES_CODE_INPUT).mutation(({ input }) => {
    if (!verifyWishesCode(input.code)) {
      throw new TRPCError({ code: "FORBIDDEN", message: WISHES_CODE_ERROR });
    }
    return { unlocked: true };
  }),

  /** All wishes, newest first. */
  list: publicProcedure.input(WISHES_CODE_INPUT).query(async ({ input }) => {
    if (!verifyWishesCode(input.code)) {
      throw new TRPCError({ code: "FORBIDDEN", message: WISHES_CODE_ERROR });
    }
    return listWishes();
  }),

  /** Saves a new wish and returns it as it was stored. */
  add: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(120),
        message: z.string().trim().min(3, "اكتب أمنيتك الأول").max(500, "الأمنية طويلة شوية"),
        name: z.string().trim().max(80).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!verifyWishesCode(input.code)) {
        throw new TRPCError({ code: "FORBIDDEN", message: WISHES_CODE_ERROR });
      }
      return addWish({ message: input.message, name: input.name ?? null });
    }),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  wishes: wishesRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
