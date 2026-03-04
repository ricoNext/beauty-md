import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

/**
 * 为所有 <a> 添加上标索引，并在文末追加「参考链接」列表：
 * - 同一 href 复用同一个索引
 * - 文末按首次出现顺序输出有序列表
 */
interface LinkMeta {
	index: number;
	url: string;
	label: string;
}

function extractText(node: Element): string {
	if (!node.children) return "";
	let out = "";
	for (const child of node.children) {
		if (child.type === "text") {
			out += child.value ?? "";
		} else if (child.type === "element") {
			out += extractText(child as Element);
		}
	}
	return out.trim();
}

export function rehypeLinkFootnotes() {
	return function transformer(tree: Root) {
		const urlToMeta = new Map<string, LinkMeta>();
		const orderedMetas: LinkMeta[] = [];

		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "a") return;

			const href = node.properties?.href;
			if (typeof href !== "string") return;

			const url = href.trim();
			if (!url) return;

			let meta = urlToMeta.get(url);
			if (!meta) {
				const index = urlToMeta.size + 1;
				const label = extractText(node) || url;
				meta = { index, url, label };
				urlToMeta.set(url, meta);
				orderedMetas.push(meta);
			}

			const supNode: Element = {
				type: "element",
				tagName: "sup",
				properties: {
					className: ["md-link-index"],
				},
				children: [
					{
						// 直接显示数字，例如：¹、² 等（这里用阿拉伯数字，便于识别）
						type: "text",
						value: String(meta.index),
					},
				],
			};

			// 将上标追加在链接内部文本之后
			if (!Array.isArray(node.children)) {
				node.children = [];
			}
			node.children.push(supNode);
		});

		if (!orderedMetas.length) {
			return;
		}

		const listItems: Element[] = orderedMetas.map((meta) => ({
			type: "element",
			tagName: "li",
			properties: {},
			children: [
				{
					type: "text",
					// [索引号]:[链接说明]:[链接地址]
					value: `[${meta.index}]:${meta.label}:${meta.url}`,
				},
			],
		}));

		const section: Element = {
			type: "element",
			tagName: "section",
			properties: {
				className: ["md-link-index-section"],
			},
			children: [
				{
					type: "element",
					tagName: "hr",
					properties: {
						className: ["md-link-index-divider"],
					},
					children: [],
				},
				{
					type: "element",
					tagName: "h2",
					properties: {
						className: ["md-link-index-title"],
					},
					children: [
						{
							type: "text",
							value: "参考链接",
						},
					],
				},
				{
					type: "element",
					tagName: "ol",
					properties: {
						className: ["md-link-index-list"],
					},
					children: listItems,
				},
			],
		};

		// 将参考链接区块追加在文末
		if (!Array.isArray(tree.children)) {
			tree.children = [];
		}
		tree.children.push(section);
	};
}

