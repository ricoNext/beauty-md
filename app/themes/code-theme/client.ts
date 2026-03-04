import type { CodeThemeId } from "@/lib/code-themes";

/**
 * Client-side: Dynamically inject code theme stylesheet
 * Client-side only: loads CSS from public/themes/code-theme/
 */
export async function injectCodeTheme(themeId: CodeThemeId): Promise<void> {
	if (typeof window === "undefined") {
		throw new Error("injectCodeTheme 仅支持在客户端环境调用");
	}

	// Skip if already injected
	const existingLink = document.getElementById(`code-theme-${themeId}`);
	if (existingLink) {
		return;
	}

	// Create and inject link element
	const link = document.createElement("link");
	link.id = `code-theme-${themeId}`;
	link.rel = "stylesheet";
	link.href = `/themes/code-theme/${themeId}.css`;
	document.head.appendChild(link);
}
