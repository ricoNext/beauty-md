export interface MarkdownStyle {
  id: string;
  name: string;
}

export const markdownStyles: MarkdownStyle[] = [
  { id: "default", name: "默认" },
  { id: "ayu-light", name: "Ayu Light" },
  { id: "bauhaus", name: "Bauhaus" },
  { id: "blueprint", name: "Blueprint" },
  { id: "botanical", name: "Botanical" },
  { id: "green-simple", name: "Green Simple" },
  { id: "maximalism", name: "Maximalism" },
  { id: "neo-brutalism", name: "Neo-Brutalism" },
  { id: "newsprint", name: "Newsprint" },
  { id: "organic", name: "Organic" },
  { id: "playful-geometric", name: "Playful Geometric" },
  { id: "professional", name: "Professional" },
  { id: "retro", name: "Retro" },
  { id: "sketch", name: "Sketch" },
  { id: "terminal", name: "Terminal" },
];

export type MarkdownStyleId = (typeof markdownStyles)[number]["id"];

export const markdownStyleIds = markdownStyles.map((s) => s.id);

