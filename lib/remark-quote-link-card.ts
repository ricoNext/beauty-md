import type { Blockquote, Link, Paragraph, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

type MdastNode = Root | Blockquote | Paragraph | Link | Text | { type: string; children?: MdastNode[]; value?: string };

function isWhitespaceText(node: MdastNode): boolean {
	return (
		node.type === "text" &&
		(typeof (node as Text).value === "string" ? (node as Text).value.trim() === "" : true)
	);
}

function isParagraphWithSingleLink(paragraph: Paragraph): Link | null {
	const children = paragraph.children ?? [];
	const meaningful = children.filter((child) => !isWhitespaceText(child as MdastNode));
	if (meaningful.length !== 1) return null;
	const only = meaningful[0];
	if (only.type !== "link") return null;
	return only as Link;
}

function getLinkLabel(link: Link): string {
	const parts: string[] = [];
	for (const child of link.children ?? []) {
		if (child.type === "text" && typeof child.value === "string") {
			parts.push(child.value);
		}
	}
	const label = parts.join("").trim();
	return label || link.url;
}

export function remarkQuoteLinkCard() {
	return (tree: Root) => {
		visit(tree as MdastNode, "blockquote", (node: Blockquote) => {
			const children = node.children ?? [];
			if (children.length !== 1) return;
			const paragraph = children[0];
			if (paragraph.type !== "paragraph") return;

			const link = isParagraphWithSingleLink(paragraph as Paragraph);
			if (!link) return;

			const url = (link.url ?? "").trim();
			if (!url) return;

			const label = getLinkLabel(link);

			const qrApiBase = "https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=";
			const encodedUrl = encodeURIComponent(url);
			const qrSrc = `${qrApiBase}${encodedUrl}`;

			// 使用 remark-rehype 的 data.hName/hProperties/hChildren 指导生成特定 HAST 结构
			const blockquoteNode = node as Blockquote & {
				data?: {
					hName?: string;
					hProperties?: Record<string, unknown>;
					hChildren?: unknown[];
				};
			};

			blockquoteNode.data = {
				hName: "section",
				hProperties: {
					className: ["md-qr-card"],
					"data-url": url,
					"data-label": label,
				},
				hChildren: [
					{
						type: "element",
						tagName: "div",
						properties: {
							className: ["md-qr-card-left"],
						},
						children: [
							{
								type: "element",
								tagName: "p",
								properties: {
									className: ["md-qr-card-tip"],
								},
								children: [
									{
										type: "text",
										value: "长按识别二维码查看原文",
									},
									{
										type: "element",
										tagName: "br",
										properties: {},
										children: [],
									},
									{
										type: "element",
										tagName: "span",
										properties: {
											className: ["md-qr-card-url"],
										},
										children: [
											{
												type: "text",
												value: url,
											},
										],
									},
								],
							},
						],
					},
					{
						type: "element",
						tagName: "div",
						properties: {
							className: ["md-qr-card-right"],
						},
						children: [
							{
								type: "element",
								tagName: "img",
								properties: {
									className: ["md-qr-card-qrcode"],
									src: qrSrc,
									alt: "原文二维码",
								},
								children: [],
							},
						],
					},
				],
			};
		});
	};
}

