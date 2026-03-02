import { promises as fs } from "node:fs";
import path from "node:path";

let previewCssCache: string | null = null;

export async function loadCodeThemePreviewCss(): Promise<string | undefined> {
  if (previewCssCache !== null) return previewCssCache;

  if (typeof window !== "undefined") {
    throw new Error("loadCodeThemePreviewCss 仅支持在服务器环境调用");
  }

  const filePath = path.join(
    process.cwd(),
    "app",
    "themes",
    "code-theme",
    "preview.css",
  );

  try {
    const buf = await fs.readFile(filePath);
    previewCssCache = buf.toString("utf8");
    return previewCssCache;
  } catch {
    return undefined;
  }
}

