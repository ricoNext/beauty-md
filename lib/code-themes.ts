export type CodeThemeId =
	| "atom-one-dark"
	| "dark"
	| "github"
	| "vscode";

export const CODE_THEMES: { id: CodeThemeId; label: string }[] = [
	{ id: "atom-one-dark", label: "Atom One Dark" },
	{ id: "dark", label: "Dark" },
	{ id: "github", label: "GitHub" },
	{ id: "vscode", label: "VS Code" },
];
