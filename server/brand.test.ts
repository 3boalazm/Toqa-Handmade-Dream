import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(import.meta.dirname, "..");

const BRAND_FILES = [
  "client/index.html",
  "client/src/pages/Home.tsx",
  "client/src/pages/Wishes.tsx",
  "client/public/manus-routes.json",
  "README.md",
  "SOURCE-README.md",
];

function read(file: string): string {
  return readFileSync(path.join(ROOT, file), "utf8");
}

describe("the Toqa brand name", () => {
  it("never shows the old name anymore", () => {
    for (const file of BRAND_FILES) {
      expect(read(file), file).not.toContain("\u0623\u062b\u0631");
    }
  });

  it("shows the Arabic name and the English name", () => {
    const home = read("client/src/pages/Home.tsx");
    expect(home).toContain("\u062a\u0642\u0649");
    expect(home).toContain("Toqa");
    expect(read("client/index.html")).toContain("<title>\u062a\u0642\u0649 |");
  });
});
