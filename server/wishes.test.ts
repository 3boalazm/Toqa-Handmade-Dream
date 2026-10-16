import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

const CODE = "toqa-secret";
const WISH_TEXT = "\u0639\u0627\u064a\u0632\u0629 \u0633\u0648\u0627\u0631 \u0628\u0646\u0633\u0641\u062c\u064a";
const WISH_NAME = "\u0645\u0646\u0649";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("wishes", () => {
  beforeEach(async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "toqa-wishes-"));
    // No DATABASE_URL here on purpose: the file store keeps the test hermetic.
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("WISHES_FILE", path.join(dir, "wishes.json"));
    vi.stubEnv("WISHES_CODE", CODE);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps the page behind the code", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.wishes.list({ code: "wrong-code" })).rejects.toThrow();
    await expect(caller.wishes.add({ code: "wrong-code", message: WISH_TEXT })).rejects.toThrow();
    await expect(caller.wishes.unlock({ code: "wrong-code" })).rejects.toThrow();
    await expect(caller.wishes.unlock({ code: CODE })).resolves.toEqual({ unlocked: true });
    await expect(caller.wishes.list({ code: CODE })).resolves.toEqual([]);
  });

  it("stores a wish and reads it back", async () => {
    const caller = appRouter.createCaller(createContext());

    const created = await caller.wishes.add({ code: CODE, message: WISH_TEXT, name: WISH_NAME });
    expect(created).toMatchObject({ message: WISH_TEXT, name: WISH_NAME });

    const list = await caller.wishes.list({ code: CODE });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ message: WISH_TEXT, name: WISH_NAME });
    expect(list[0]?.createdAt).toBeInstanceOf(Date);
  });

  it("keeps a wish without a name", async () => {
    const caller = appRouter.createCaller(createContext());

    const created = await caller.wishes.add({ code: CODE, message: WISH_TEXT });
    expect(created.name).toBeNull();
  });

  it("rejects an empty or too short wish", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.wishes.add({ code: CODE, message: "  " })).rejects.toThrow();
    await expect(caller.wishes.add({ code: CODE, message: "a" })).rejects.toThrow();
  });
});
