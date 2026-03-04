import juice from "juice";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import type { MarkdownStyleId } from "@/app/themes/markdown-style";
import type { CodeThemeId } from "@/lib/code-themes";
import { loadMarkdownResetCss, loadMarkdownStyleCss } from "@/app/themes/markdown-style/loader";
import { loadCodeThemeCss } from "@/app/themes/code-theme/loader";
import { rehypeLinkFootnotes } from "@/lib/rehype-link-footnotes";
import { remarkQuoteLinkCard } from "@/lib/remark-quote-link-card";
import { remarkTrimCodeBlocks } from "@/lib/remark-trim-code-blocks";

export interface WechatRenderOptions {
	markdown: string;
	markdownStyle: MarkdownStyleId;
	codeTheme?: string;
}

/**
 * 将片段中「标签外」的空格替换为不换行空格，避免破坏标签结构。
 */
function replaceSpacesOutsideTags(fragment: string): string {
	let result = "";
	let inTag = false;

	for (let i = 0; i < fragment.length; i++) {
		const ch = fragment[i];
		if (ch === "<") {
			inTag = true;
			result += ch;
		} else if (ch === ">") {
			inTag = false;
			result += ch;
		} else if (!inTag && ch === " ") {
			result += "&#160;";
		} else {
			result += ch;
		}
	}

	return result;
}

/**
 * 在 HTML 字符串中保护代码块空白（公众号会折叠空格/换行），并与预览一致：
 * - 先去掉 pre 内首尾的格式化换行/空白，避免多出首尾空行
 * - \r\n/\n → <br>，\t → &#160;&#160;
 * - 标签外的空格 → &#160;（含行首与行内），避免公众号粘贴时折叠空格
 */
function protectCodeWhitespaceInHtml(html: string): string {
	return html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (_: string, attrs: string, inner: string) => {
		const trimmed = inner.trim();
		let s = trimmed
			.replace(/\r\n|\r|\n/g, "<br>")
			.replace(/\t/g, "&#160;&#160;");

		// 仅替换标签外文本中的空格，避免破坏 <code> / <span> 等标签结构
		s = replaceSpacesOutsideTags(s);

		// 去掉首尾因格式化产生的 <br>，与预览首尾无空行一致
		s = s.replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "");

		// 在 pre 上强制内联不换行+横向滚动，避免公众号覆盖导致换行
		const criticalPreStyle = "white-space:pre;overflow-x:auto";
		const styleMatch = attrs.match(/style\s*=\s*["']([^"']*)["']/i);
		const attrsOut = styleMatch
			? attrs.replace(/style\s*=\s*["']([^"']*)["']/i, (_m: string, styleInner: string) => `style="${styleInner};${criticalPreStyle}"`)
			: `${attrs} style="${criticalPreStyle}"`;

		// 内层 code 不收缩宽度，避免长行被挤换行（display:table + min-width:max-content）
		const criticalCodeStyle = "white-space:pre;display:table;min-width:max-content";
		s = s.replace(/<code[^>]*>/i, (tag: string) => {
			if (/style\s*=/i.test(tag)) {
				return tag.replace(/style\s*=\s*["']([^"']*)["']/i, (_m2: string, styleInner: string) => `style="${styleInner};${criticalCodeStyle}"`);
			}
			return tag.replace(/>$/, ` style="${criticalCodeStyle}">`);
		});

		return `<pre${attrsOut}>${s}</pre>`;
	});
}

/** 公众号粘贴用：关键排版修正（代码块 + 链接二维码卡片） */
const WECHAT_CODE_BLOCK_CSS = `
/* 代码块固定样式 - 与预览一致 */
.markdown-preview pre {
  margin: 1em 0 !important;
  overflow-x: auto !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  padding: 16px !important;
  background-color: #f8f9fa !important;
  font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
  white-space: pre !important;
}

.markdown-preview pre code {
  background-color: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  font-size: inherit !important;
  line-height: inherit !important;
  white-space: pre !important;
  display: table !important;
  min-width: max-content !important;
}

.markdown-preview code:not(pre code) {
  font-family: 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace !important;
  font-size: 0.875em !important;
  background-color: #f3f4f6 !important;
  color: #e11d48 !important;
  padding: 0.15em 0.45em !important;
  border-radius: 4px !important;
}

/* 独占引用链接二维码卡片：在公众号中也保持左右分栏卡片布局 */
.markdown-preview .md-qr-card {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 16px !important;
  margin: 20px 0 !important;
  border-radius: 12px !important;
  background-color: #f5f5f5 !important;
  border: 1px solid #e5e5e5 !important;
}

.markdown-preview .md-qr-card-left {
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  margin-right: 12px !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
}

.markdown-preview .md-qr-card-tip {
  margin: 0 !important;
  font-size: 13px !important;
  color: #666666 !important;
}

.markdown-preview .md-qr-card-url {
  margin: 0 !important;
  font-size: 13px !important;
  color: #333333 !important;
  overflow-wrap: break-word !important;
  word-break: break-all !important;
}

.markdown-preview .md-qr-card-right {
  flex-shrink: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 0 !important;
  padding: 0 !important;
}

.markdown-preview .md-qr-card-qrcode {
  display: block !important;
  width: 88px !important;
  height: 88px !important;
  border-radius: 8px !important;
  background-color: transparent !important;
  object-fit: contain !important;
}
`;

/**
 * 微信公众号列表/复选框规范化：checkbox → ☑/☐ 文本
 */
function normalizeWechatListsInHtml(html: string): string {
	let out = html;
	out = out.replace(/<input[^>]*type\s*=\s*["']checkbox["'][^>]*checked[^>]*>/gi, "☑ ");
	out = out.replace(/<input[^>]*type\s*=\s*["']checkbox["'][^>]*>/gi, "☐ ");
	return out;
}

/**
 * 服务端：markdown → HTML（unified + rehype-highlight）→ 公众号适配 → 主题 CSS 内联。
 * 供 API 路由调用，返回的 HTML 可直接写入剪贴板用于粘贴到公众号。
 */
export async function renderWechatHtml(options: WechatRenderOptions): Promise<string> {
	const { markdown, markdownStyle } = options;
	const codeTheme = options.codeTheme ?? "kimbie-light";

	const processor = unified()
		.use(remarkParse)
		.use(remarkTrimCodeBlocks)
		.use(remarkGfm)
		.use(remarkQuoteLinkCard)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeHighlight)
		.use(rehypeLinkFootnotes)
		.use(rehypeStringify, { allowDangerousHtml: true });

	const vfile = await processor.process(markdown);
	let html = String(vfile);

	html = protectCodeWhitespaceInHtml(html);
	html = normalizeWechatListsInHtml(html);
	html = `<section class="markdown-preview" data-theme="${markdownStyle}" data-code-theme="${codeTheme}">${html}</section>`;

	// 始终内联 reset.css、ayu-light.css 作为基础主题，再叠加当前 markdownStyle 的覆盖，
	// 这样与前端预览「ayu-light 作为基底 + 主题覆盖」的行为一致。
	const [resetCss, baseCss, themeCss, codeCss] = await Promise.all([
		loadMarkdownResetCss(),
		loadMarkdownStyleCss("ayu-light"),
		markdownStyle === "ayu-light" ? Promise.resolve<string | undefined>("") : loadMarkdownStyleCss(markdownStyle),
		loadCodeThemeCss(codeTheme as CodeThemeId),
	]);
	const css = [resetCss ?? "", baseCss ?? "", themeCss ?? "", codeCss ?? "", WECHAT_CODE_BLOCK_CSS]
		.filter(Boolean)
		.join("\n");
	if (css) {
		html = juice.inlineContent(html, css, {
			inlinePseudoElements: true,
			preserveImportant: true,
		});
	}

	return html;
}
