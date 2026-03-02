import type { MarkdownStyleId } from "@/app/themes/markdown-style";

export type PreviewThemeId = MarkdownStyleId;

export const PREVIEW_THEMES: { id: PreviewThemeId; label: string }[] = [
	{ id: "default", label: "默认" },
	{ id: "simple", label: "简洁" },
	{ id: "modern", label: "现代" },
	{ id: "elegant", label: "优雅" },
];

