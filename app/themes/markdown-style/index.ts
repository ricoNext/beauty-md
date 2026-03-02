export interface MarkdownStyle {
  id: string;
  name: string;
}

export const markdownStyles: MarkdownStyle[] = [
  { id: "default", name: "默认" },
  { id: "simple", name: "简洁" },
  { id: "modern", name: "现代" },
  { id: "elegant", name: "优雅" },
];

export type MarkdownStyleId = (typeof markdownStyles)[number]["id"];

export const markdownStyleIds = markdownStyles.map((s) => s.id);

