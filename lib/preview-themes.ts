import type { MarkdownStyleId } from "@/app/themes/markdown-style";

export type PreviewThemeId = MarkdownStyleId;

export const PREVIEW_THEMES: { id: PreviewThemeId; label: string }[] = [
	{ id: "ayu-light", label: "Ayu Light" },
	{ id: "blueprint", label: "Blueprint" },
	{ id: "botanical", label: "Botanical" },
	{ id: "newsprint", label: "Newsprint" },
	{ id: "professional", label: "Professional" },
];

