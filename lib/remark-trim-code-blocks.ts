/**
 * Remark 插件：去掉围栏代码块 value 的首尾换行，避免预览中代码块首行出现空行/缩进。
 * 在 mdast 阶段处理，不依赖 hast 结构。
 */
import type { Code } from "mdast";
import type { Root } from "mdast";

type MdastNode = Root | { type: string; value?: string; children?: MdastNode[] };

function walk(node: MdastNode | null | undefined): void {
	if (node == null || typeof node !== "object") return;
	if (node.type === "code" && typeof (node as Code).value === "string") {
		(node as Code).value = (node as Code).value.replace(/^\n+|\n+$/g, "");
	}
	if (Array.isArray(node.children)) {
		for (const child of node.children) {
			if (child != null) walk(child);
		}
	}
}

export function remarkTrimCodeBlocks() {
	return (tree: Root) => {
		walk(tree);
	};
}
