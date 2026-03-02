"use client";

import type { Components } from "react-markdown";
import { forwardRef } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { remarkTrimCodeBlocks } from "@/lib/remark-trim-code-blocks";
import { cn } from "@/lib/utils";
import type { CodeThemeId } from "@/lib/code-themes";
import type { PreviewThemeId } from "@/lib/preview-themes";

export interface MarkdownPreviewProps {
	content: string;
	theme?: PreviewThemeId;
	codeTheme?: CodeThemeId;
	className?: string;
}

const previewComponents: Components = {
	h1: ({ className, ...props }) => (
		<h1 className="mb-4 mt-6 border-b border-border pb-2 text-2xl font-semibold text-foreground" {...props} />
	),
	h2: ({ className, ...props }) => (
		<h2 className="mb-3 mt-5 text-xl font-semibold text-foreground" {...props} />
	),
	h3: ({ className, ...props }) => (
		<h3 className="mb-2 mt-4 text-lg font-semibold text-foreground" {...props} />
	),
	h4: ({ className, ...props }) => (
		<h4 className="mb-2 mt-3 text-base font-semibold text-foreground" {...props} />
	),
	h5: ({ className, ...props }) => (
		<h5 className="mb-1 mt-2 text-sm font-semibold text-foreground" {...props} />
	),
	h6: ({ className, ...props }) => (
		<h6 className="mb-1 mt-2 text-sm font-medium text-muted-foreground" {...props} />
	),
	p: ({ className, ...props }) => (
		<p className="mb-3 leading-7 text-foreground" {...props} />
	),
	ul: ({ className, ...props }) => (
		<ul className="mb-3 ml-6 list-disc space-y-1 text-foreground" {...props} />
	),
	ol: ({ className, ...props }) => (
		<ol className="mb-3 ml-6 list-decimal space-y-1 text-foreground" {...props} />
	),
	li: ({ className, ...props }) => (
		<li className="leading-7" {...props} />
	),
	blockquote: ({ className, ...props }) => (
		<blockquote
			className="border-l-4 border-primary pl-4 italic text-muted-foreground"
			{...props}
		/>
	),
	code: ({ className, children, ...props }) => {
		// 代码块带 language-* 类名（react-markdown 可能传数组如 ['hljs','language-bash']），行内代码无此类名
		const classStr = Array.isArray(className) ? className.join(" ") : String(className ?? "");
		const isInline = !/language-/.test(classStr);
		// 兜底：若仍为首尾换行的字符串，修剪后渲染，避免首行空行/缩进
		const blockChildren =
			!isInline && typeof children === "string"
				? children.replace(/^\n+|\n+$/g, "")
				: children;
		return isInline ? (
			<code
				className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
				{...props}
			>
				{children}
			</code>
		) : (
			<code className={cn("block", classStr)} {...props}>
				{blockChildren}
			</code>
		);
	},
	pre: ({ className, ...props }) => (
		<pre
			className="mb-3 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm text-foreground"
			{...props}
		/>
	),
	a: ({ className, ...props }) => (
		<a
			className="font-medium text-primary underline underline-offset-4 hover:no-underline"
			{...props}
		/>
	),
	table: ({ className, ...props }) => (
		<div className="mb-3 overflow-x-auto">
			<table className="w-full border-collapse border border-border text-sm" {...props} />
		</div>
	),
	th: ({ className, ...props }) => (
		<th
			className="border border-border bg-muted px-3 py-2 text-left font-semibold text-foreground"
			{...props}
		/>
	),
	td: ({ className, ...props }) => (
		<td className="border border-border px-3 py-2 text-foreground" {...props} />
	),
};

export const MarkdownPreview = forwardRef<HTMLDivElement, MarkdownPreviewProps>(
	function MarkdownPreview(
		{ content, theme = "default", codeTheme = "atom-one-dark", className },
		ref,
	) {
		return (
			<div
				ref={ref}
				className={cn("markdown-preview max-w-none overflow-auto", className)}
				data-theme={theme}
				data-code-theme={codeTheme}
			>
				{content.trim() ? (
					<Markdown
						remarkPlugins={[remarkTrimCodeBlocks, remarkGfm]}
						rehypePlugins={[rehypeHighlight]}
						components={previewComponents}
					>
						{content}
					</Markdown>
				) : (
					<p className="text-muted-foreground">在此输入 Markdown，右侧将实时预览。</p>
				)}
			</div>
		);
	},
);
