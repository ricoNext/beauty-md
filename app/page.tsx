"use client";

import { Code, Palette, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	CODE_THEMES,
	type CodeThemeId,
} from "@/lib/code-themes";
import {
	PREVIEW_THEMES,
	type PreviewThemeId,
} from "@/lib/preview-themes";
import { injectCodeTheme } from "@/app/themes/code-theme/client";
import { injectThemeIfNeeded } from "@/lib/theme-dynamic-loader";
import { cn } from "@/lib/utils";

const initialMarkdown = `# 欢迎使用 Beauty MD

这是一个 Markdown 编辑器，支持多种预览主题和代码样式。你可以在左侧输入 Markdown 内容，右侧实时预览效果。

## 功能

- 实时预览：输入 Markdown 内容，右侧即时显示渲染效果。
- 主题选择：点击调色板图标选择预览主题，点击代码图标选择代码样式。
- 复制到公众号：点击分享图标将内容复制为适合微信公众号的格式。

## 使用说明

1. 在左侧编辑区输入你的 Markdown 内容。
2. 使用右侧工具栏选择喜欢的预览主题和代码样式。
3. 点击分享图标将内容复制到剪贴板，可以直接粘贴到微信公众号编辑器中。

祝你使用愉快！

`;

const PREVIEW_STORAGE_KEY = "beauty-md-preview-theme";
const CODE_STORAGE_KEY = "beauty-md-code-theme";
const CONTENT_STORAGE_KEY = "beauty-md-content";

export default function Home() {
	const [content, setContent] = useState("");
	const [previewTheme, setPreviewTheme] = useState<PreviewThemeId>("ayu-light");
	const [codeTheme, setCodeTheme] = useState<CodeThemeId>("atom-one-dark");
	const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");
	const [themePopoverOpen, setThemePopoverOpen] = useState(false);
	const [codePopoverOpen, setCodePopoverOpen] = useState(false);
	const previewRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Load content from localStorage
		const savedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
		setContent(savedContent || initialMarkdown)

		// Load preview theme from localStorage
		const p = localStorage.getItem(PREVIEW_STORAGE_KEY);
		if (p && PREVIEW_THEMES.some((t) => t.id === p)) {
			const themeId = p as PreviewThemeId;
			setPreviewTheme(themeId);
			// Inject theme stylesheet
			injectThemeIfNeeded(themeId);
		}

		// Load code theme from localStorage
		const c = localStorage.getItem(CODE_STORAGE_KEY);
		if (c && CODE_THEMES.some((t) => t.id === c)) {
			const codeThemeId = c as CodeThemeId;
			setCodeTheme(codeThemeId);
			// Inject code theme stylesheet
			injectCodeTheme(codeThemeId);
		} else {
			// Inject default code theme stylesheet
			injectCodeTheme("atom-one-dark");
		}
	}, []);

	// Save content to localStorage whenever it changes
	useEffect(() => {
		try {
			localStorage.setItem(CONTENT_STORAGE_KEY, content);
		} catch {
			// ignore
		}
	}, [content]);

	async function handleThemeChange(id: PreviewThemeId) {
		// Dynamically inject theme stylesheet if not already loaded
		await injectThemeIfNeeded(id);
		setPreviewTheme(id);
		try {
			localStorage.setItem(PREVIEW_STORAGE_KEY, id);
		} catch {
			// ignore
		}
		setThemePopoverOpen(false);
	}

	async function handleCodeThemeChange(id: CodeThemeId) {
		// Dynamically inject code theme stylesheet if not already loaded
		await injectCodeTheme(id);
		setCodeTheme(id);
		try {
			localStorage.setItem(CODE_STORAGE_KEY, id);
		} catch {
			// ignore
		}
		setCodePopoverOpen(false);
	}

	async function handleCopyToWechat() {
		try {
			const res = await fetch("/api/copy-wechat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					markdown: content,
					markdownStyle: previewTheme,
					codeTheme,
				}),
			});
			if (!res.ok) {
				setCopyStatus("fail");
				setTimeout(() => setCopyStatus("idle"), 2000);
				return;
			}
			const { html } = (await res.json()) as { html?: string };
			if (!html) {
				setCopyStatus("fail");
				setTimeout(() => setCopyStatus("idle"), 2000);
				return;
			}
			await navigator.clipboard.write([
				new ClipboardItem({
					"text/html": new Blob([html], { type: "text/html" }),
					"text/plain": new Blob([content], { type: "text/plain" }),
				}),
			]);
			setCopyStatus("ok");
			setTimeout(() => setCopyStatus("idle"), 2000);
		} catch {
			setCopyStatus("fail");
			setTimeout(() => setCopyStatus("idle"), 2000);
		}
	}

	const previewThemeLabel =
		PREVIEW_THEMES.find((t) => t.id === previewTheme)?.label ?? previewTheme;
	const codeThemeLabel =
		CODE_THEMES.find((t) => t.id === codeTheme)?.label ?? codeTheme;

	return (
		<div className="flex h-screen flex-col font-sans">
			<main className="flex min-h-0 flex-1">
				<section className="flex min-w-0 flex-1 flex-col border-r border-border">
					<div className="min-h-0 flex-1 p-3">
						<MarkdownEditor
							value={content}
							onChange={setContent}
							placeholder="Markdown 编辑器"
							className="h-full rounded-md border border-border bg-background"
						/>
					</div>
				</section>
				<section className="flex min-w-0 flex-1 flex-col bg-muted/30">
					<div className="flex min-h-0 flex-1">
						<div className="min-h-0 flex-1 overflow-auto p-6">
							<MarkdownPreview
								ref={previewRef}
								content={content}
								theme={previewTheme}
								codeTheme={codeTheme}
								className="prose"
							/>
						</div>
						<aside
							className="flex w-12 shrink-0 flex-col items-center gap-2 border-l border-border bg-background/80 py-3"
							aria-label="预览操作"
						>
							<Popover
								open={themePopoverOpen}
								onOpenChange={setThemePopoverOpen}
							>
								<Tooltip>
									<PopoverTrigger asChild>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="预览主题"
											>
												<Palette className="size-4" />
											</Button>
										</TooltipTrigger>
									</PopoverTrigger>
									<TooltipContent side="left">
										预览主题：{previewThemeLabel}
									</TooltipContent>
								</Tooltip>
								<PopoverContent side="left" className="w-56 p-2">
									<div className="mb-2 text-xs font-medium text-muted-foreground">
										预览主题
									</div>
									<div className="flex flex-col gap-0.5">
										{PREVIEW_THEMES.map(({ id, label }) => (
											<button
												key={id}
												type="button"
												onClick={() =>
													handleThemeChange(id)
												}
												className={cn(
													"rounded-md px-2 py-1.5 text-left text-sm transition-colors",
													previewTheme === id
														? "bg-primary text-primary-foreground"
														: "hover:bg-muted",
												)}
											>
												{label}
											</button>
										))}
									</div>
								</PopoverContent>
							</Popover>

							<Popover
								open={codePopoverOpen}
								onOpenChange={setCodePopoverOpen}
							>
								<Tooltip>
									<PopoverTrigger asChild>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon-sm"
												aria-label="代码样式"
											>
												<Code className="size-4" />
											</Button>
										</TooltipTrigger>
									</PopoverTrigger>
									<TooltipContent side="left">
										代码样式：{codeThemeLabel}
									</TooltipContent>
								</Tooltip>
								<PopoverContent side="left" className="w-56 p-2">
									<div className="mb-2 text-xs font-medium text-muted-foreground">
										代码样式
									</div>
									<div className="flex flex-col gap-0.5">
										{CODE_THEMES.map(({ id, label }) => (
											<button
												key={id}
												type="button"
												onClick={() =>
													handleCodeThemeChange(id)
												}
												className={cn(
													"rounded-md px-2 py-1.5 text-left text-sm transition-colors",
													codeTheme === id
														? "bg-primary text-primary-foreground"
														: "hover:bg-muted",
												)}
											>
												{label}
											</button>
										))}
									</div>
								</PopoverContent>
							</Popover>

							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={handleCopyToWechat}
										className={cn(
											copyStatus === "ok" &&
												"bg-green-600 text-white hover:bg-green-600 hover:text-white",
											copyStatus === "fail" &&
												"bg-destructive/90 text-destructive-foreground hover:bg-destructive/90",
										)}
										aria-label="复制到公众号"
									>
										<Share2 className="size-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="left">
									{copyStatus === "ok"
										? "已复制"
										: copyStatus === "fail"
											? "复制失败"
											: "复制到公众号"}
								</TooltipContent>
							</Tooltip>

							{/* 预留：复制到小红书 */}
						</aside>
					</div>
				</section>
			</main>
		</div>
	);
}
