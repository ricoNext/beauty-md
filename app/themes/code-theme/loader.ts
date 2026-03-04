import { promises as fs } from "node:fs";
import path from "node:path";
import type { CodeThemeId } from "@/lib/code-themes";

let codeThemeCache = new Map<CodeThemeId, string>();

/**
 * Server-side: Load code theme CSS from public directory
 * Used for WeChat export where CSS needs to be inlined
 */
export async function loadCodeThemeCss(
	themeId: CodeThemeId,
): Promise<string | undefined> {
	if (codeThemeCache.has(themeId)) {
		return codeThemeCache.get(themeId);
	}

	if (typeof window !== "undefined") {
		throw new Error("loadCodeThemeCss 仅支持在服务器环境调用");
	}

	const filePath = path.join(
		process.cwd(),
		"public",
		"themes",
		"code-theme",
		`${themeId}.css`,
	);

	try {
		const buf = await fs.readFile(filePath);
		const css = buf.toString("utf8");
		codeThemeCache.set(themeId, css);
		return css;
	} catch {
		return undefined;
	}
}
