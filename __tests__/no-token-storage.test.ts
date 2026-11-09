import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..");
const SKIP = new Set(["node_modules", ".next", "__tests__", "public", ".git"]);

const sources = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts") ? [path] : [];
  });

describe("sessão sem token no navegador", () => {
  it("nenhum código do web usa localStorage ou sessionStorage", () => {
    const offenders = sources(ROOT).filter((f) =>
      /\b(localStorage|sessionStorage)\b/.test(readFileSync(f, "utf8"))
    );
    expect(offenders).toEqual([]);
  });

  it("nenhum código do web monta Authorization: Bearer", () => {
    const offenders = sources(ROOT).filter((f) =>
      /Bearer|Authorization/.test(readFileSync(f, "utf8"))
    );
    expect(offenders).toEqual([]);
  });
});
