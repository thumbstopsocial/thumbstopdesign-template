import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Reads a CSS variable from styles/tokens.css. Used by the generated OG image and icon. */
export function token(name: string, fallback: string): string {
  try {
    const css = readFileSync(join(process.cwd(), "styles/tokens.css"), "utf8");
    const match = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
    return match ? match[1].trim() : fallback;
  } catch {
    return fallback;
  }
}

/** The site's mark as a data URI: design/assets/favicon.svg, then logo.svg, then favicon.png. */
export function markDataUri(): string | null {
  const dir = join(process.cwd(), "design/assets");
  for (const [file, type] of [
    ["favicon.svg", "image/svg+xml"],
    ["logo.svg", "image/svg+xml"],
    ["favicon.png", "image/png"],
  ] as const) {
    const path = join(dir, file);
    if (existsSync(path)) return `data:${type};base64,${readFileSync(path).toString("base64")}`;
  }
  return null;
}
