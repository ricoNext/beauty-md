import juice from "juice";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import type { MarkdownStyleId } from "@/app/themes/markdown-style";
import { loadMarkdownResetCss, loadMarkdownStyleCss } from "@/app/themes/markdown-style/loader";
import { loadCodeThemePreviewCss } from "@/app/themes/code-theme/loader";
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
	return html.replace(/<pre([^>]*)>([\s\S]*?)<\/pre>/gi, (_, attrs, inner) => {
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
			? attrs.replace(/style\s*=\s*["']([^"']*)["']/i, (_m, inner) => `style="${inner};${criticalPreStyle}"`)
			: `${attrs} style="${criticalPreStyle}"`;

		// 内层 code 不收缩宽度，避免长行被挤换行（display:table + min-width:max-content）
		const criticalCodeStyle = "white-space:pre;display:table;min-width:max-content";
		s = s.replace(/<code[^>]*>/i, (tag) => {
			if (/style\s*=/i.test(tag)) {
				return tag.replace(/style\s*=\s*["']([^"']*)["']/i, (_m2, inner) => `style="${inner};${criticalCodeStyle}"`);
			}
			return tag.replace(/>$/, ` style="${criticalCodeStyle}">`);
		});

		return `<pre${attrsOut}>${s}</pre>`;
	});
}

/** 公众号粘贴用：代码块不换行，超出宽度显示横向滚动条（!important 对抗公众号覆盖） */
const WECHAT_CODE_BLOCK_CSS = `
.markdown-preview pre {
  white-space: pre !important;
  overflow-x: auto !important;
  overflow-wrap: normal !important;
  word-break: normal !important;
}
.markdown-preview pre code {
  white-space: pre !important;
  overflow-x: auto !important;
  display: table !important;
  min-width: max-content !important;
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
	const codeTheme = options.codeTheme ?? "atom-one-dark";

	const processor = unified()
		.use(remarkParse)
		.use(remarkTrimCodeBlocks)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeHighlight)
		.use(rehypeStringify, { allowDangerousHtml: true });

	const vfile = await processor.process(markdown);
	let html = String(vfile);

	html = protectCodeWhitespaceInHtml(html);
	html = normalizeWechatListsInHtml(html);
	html = `<section class="markdown-preview" data-theme="${markdownStyle}" data-code-theme="${codeTheme}">${html}</section>`;

	// 始终内联 default.css 作为基础主题，再叠加当前 markdownStyle 的覆盖，
	// 这样与前端预览「default 作为基底 + 主题覆盖」的行为一致。
	const [resetCss, baseCss, themeCss, codeCss] = await Promise.all([
		loadMarkdownResetCss(),
		loadMarkdownStyleCss("default"),
		markdownStyle === "default" ? Promise.resolve<string | undefined>("") : loadMarkdownStyleCss(markdownStyle),
		loadCodeThemePreviewCss(),
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
