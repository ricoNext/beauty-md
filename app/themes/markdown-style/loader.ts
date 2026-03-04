import { promises as fs } from "node:fs";
import path from "node:path";
import type { MarkdownStyleId } from "./index";

const cache = new Map<MarkdownStyleId, string>();
let resetCssCache: string | null = null;

const fileMap: Record<MarkdownStyleId, string> = {
	"ayu-light": "ayu-light.css",
	bauhaus: "bauhaus.css",
	blueprint: "blueprint.css",
	botanical: "botanical.css",
	"green-simple": "green-simple.css",
	maximalism: "maximalism.css",
	"neo-brutalism": "neo-brutalism.css",
	newsprint: "newsprint.css",
	organic: "organic.css",
	"playful-geometric": "playful-geometric.css",
	professional: "professional.css",
	retro: "retro.css",
	sketch: "sketch.css",
	terminal: "terminal.css",
};

function resolveCssPath(id: MarkdownStyleId): string | undefined {
  const file = fileMap[id];
  if (!file) return undefined;
  return path.join(process.cwd(), "app", "themes", "markdown-style", file);
}

export async function loadMarkdownStyleCss(
  id: MarkdownStyleId,
): Promise<string | undefined> {
  if (cache.has(id)) {
    return cache.get(id);
  }

  if (typeof window !== "undefined") {
    throw new Error("loadMarkdownStyleCss 仅支持在服务器环境调用");
  }

  const filePath = resolveCssPath(id);
  if (!filePath) return undefined;

  try {
    const buf = await fs.readFile(filePath);
    const css = buf.toString("utf8");
    cache.set(id, css);
    return css;
  } catch {
    return undefined;
  }
}

export async function loadMarkdownResetCss(): Promise<string | undefined> {
  if (resetCssCache !== null) return resetCssCache;
  if (typeof window !== "undefined") {
    throw new Error("loadMarkdownResetCss 仅支持在服务器环境调用");
  }
  const filePath = path.join(process.cwd(), "app", "themes", "markdown-style", "reset.css");
  try {
    const buf = await fs.readFile(filePath);
    resetCssCache = buf.toString("utf8");
    return resetCssCache;
  } catch {
    return undefined;
  }
}

