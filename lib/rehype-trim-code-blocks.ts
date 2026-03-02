/**
 * Rehype 插件：去掉围栏代码块内容的首尾换行，避免预览中代码块首行出现空行/缩进感。
 * 应在 rehype-highlight 之前运行。
 */
import type { Root } from "hast";

type HastNode = Root | { type: string; tagName?: string; children?: HastNode[]; value?: string };

function walk(node: HastNode | null | undefined): void {
	if (node == null || typeof node !== "object" || !("type" in node)) return;
	if (node.type === "element" && node.tagName === "pre" && Array.isArray(node.children)) {
		const code = node.children.find(
			(c): c is { type: "element"; tagName: string; children?: HastNode[] } =>
				c.type === "element" && (c as { tagName?: string }).tagName === "code",
		);
		if (code?.children?.length) {
			const first = code.children[0];
			const last =
				code.children.length > 1 ? code.children[code.children.length - 1] : first;
			if (first?.type === "text" && typeof first.value === "string") {
				first.value = first.value.replace(/^\n+/, "");
			}
			if (
				last &&
				last.type === "text" &&
				typeof last.value === "string" &&
				last !== first
			) {
				last.value = last.value.replace(/\n+$/, "");
			}
			if (
				first?.type === "text" &&
				first === last &&
				typeof first.value === "string"
			) {
				first.value = first.value.replace(/\n+$/, "");
			}
		}
	}
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			if (child != null) walk(child);
		}
	}
}

export function rehypeTrimCodeBlocks() {
	return (tree: Root) => {
		walk(tree);
	};
}
