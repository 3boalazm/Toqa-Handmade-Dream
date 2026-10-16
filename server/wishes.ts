import { createHash, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { wishes } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Wishes left on the hidden wishes page.
 *
 * Storage is layered: the managed MySQL database is used when it is configured
 * and reachable, otherwise the wishes fall back to a small JSON file so the
 * feature still works on a plain `pnpm dev` without a database.
 */

/** Public shape of a single wish. */
export type Wish = {
  id: string;
  message: string;
  name: string | null;
  createdAt: Date;
};

/** Code that unlocks the page. Override it with the WISHES_CODE env var. */
const DEFAULT_WISHES_CODE = "toqa";

/** Newest wishes are kept; older ones are trimmed to keep the page light. */
const MAX_WISHES = 200;

export function getWishesCode(): string {
  return process.env.WISHES_CODE?.trim() || DEFAULT_WISHES_CODE;
}

/**
 * Constant-time comparison, so the shared code cannot be guessed by measuring
 * how long a rejection takes.
 */
export function verifyWishesCode(candidate: string | null | undefined): boolean {
  const expected = createHash("sha256").update(getWishesCode()).digest();
  const actual = createHash("sha256").update(candidate ?? "").digest();
  return timingSafeEqual(expected, actual);
}

function wishesFilePath(): string {
  const custom = process.env.WISHES_FILE?.trim();
  if (custom) return custom;
  // Serverless platforms (Vercel) only allow writes to the temp directory.
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "toqa-wishes.json");
  }
  return path.join(process.cwd(), "data", "wishes.json");
}

function toWish(row: typeof wishes.$inferSelect): Wish {
  return {
    id: String(row.id),
    message: row.message,
    name: row.name ?? null,
    createdAt: row.createdAt,
  };
}

function normalizeWish(raw: unknown): Wish | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (!message) return null;
  const createdAt = record.createdAt ? new Date(String(record.createdAt)) : new Date();
  return {
    id: record.id ? String(record.id) : nanoid(10),
    message,
    name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : null,
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
  };
}

async function readFileWishes(): Promise<Wish[]> {
  try {
    const raw = await fs.readFile(wishesFilePath(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeWish).filter((wish): wish is Wish => wish !== null);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("[Wishes] Failed to read the wish file:", error);
    }
    return [];
  }
}

async function writeFileWishes(list: Wish[]): Promise<void> {
  const filePath = wishesFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(list, null, 2)}\n`, "utf8");
}

/** Serialises file writes so two parallel submissions cannot clobber each other. */
let fileQueue: Promise<unknown> = Promise.resolve();

function withFileLock<T>(task: () => Promise<T>): Promise<T> {
  const run = fileQueue.then(task, task);
  fileQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** Every wish, newest first. */
export async function listWishes(): Promise<Wish[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(wishes).orderBy(desc(wishes.createdAt)).limit(MAX_WISHES);
      return rows.map(toWish);
    } catch (error) {
      console.error("[Wishes] Database read failed, using the file store instead:", error);
    }
  }

  const list = await readFileWishes();
  return list
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, MAX_WISHES);
}

/** Stores a new wish and returns it as it was saved. */
export async function addWish(input: { message: string; name?: string | null }): Promise<Wish> {
  const message = input.message.trim();
  const name = input.name?.trim() ? input.name.trim() : null;
  const createdAt = new Date();

  const db = await getDb();
  if (db) {
    try {
      const result = await db.insert(wishes).values({ message, name, createdAt });
      const header = Array.isArray(result) ? result[0] : undefined;
      const insertId = Number(header?.insertId ?? 0);
      return {
        id: insertId ? String(insertId) : nanoid(10),
        message,
        name,
        createdAt,
      };
    } catch (error) {
      console.error("[Wishes] Database insert failed, using the file store instead:", error);
    }
  }

  const wish: Wish = { id: nanoid(10), message, name, createdAt };
  await withFileLock(async () => {
    const list = await readFileWishes();
    list.push(wish);
    await writeFileWishes(list.slice(-MAX_WISHES));
  });
  return wish;
}
