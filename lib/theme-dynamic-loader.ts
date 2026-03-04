/**
 * Client-side dynamic theme stylesheet injector
 *
 * Dynamically injects theme stylesheets when first accessed,
 * avoiding loading all themes upfront while keeping instant switching
 * after the first load.
 */

const loadedThemes = new Set<string>();

/**
 * Dynamically inject theme stylesheet if not already loaded.
 * This function is client-side only and should be called when switching themes.
 *
 * @param themeId - The theme ID to inject (e.g., "ayu-light", "bauhaus")
 * @returns Promise that resolves when the stylesheet is loaded
 */
export async function injectThemeIfNeeded(themeId: string): Promise<void> {
	// Skip if already loaded
	if (loadedThemes.has(themeId)) {
		return;
	}

	// Skip default theme as it's loaded in globals.css
	if (themeId === "default") {
		loadedThemes.add("default");
		return;
	}

	// Create and inject the stylesheet
	return new Promise((resolve, reject) => {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = `/themes/markdown-style/${themeId}.css`;
		link.onload = () => {
			loadedThemes.add(themeId);
			resolve();
		};
		link.onerror = () => {
			reject(new Error(`Failed to load theme: ${themeId}`));
		};
		document.head.appendChild(link);
	});
}

/**
 * Check if a theme has been loaded
 */
export function isThemeLoaded(themeId: string): boolean {
	return loadedThemes.has(themeId);
}

/**
 * Get list of loaded themes
 */
export function getLoadedThemes(): string[] {
	return Array.from(loadedThemes);
}

/**
 * Preload multiple themes (optional optimization)
 */
export async function preloadThemes(themeIds: string[]): Promise<void> {
	await Promise.all(themeIds.map((id) => injectThemeIfNeeded(id)));
}
