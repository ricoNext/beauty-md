import { NextResponse } from "next/server";
import { renderWechatHtml } from "@/lib/wechat-render";
import { markdownStyleIds } from "@/app/themes/markdown-style";

const MARKDOWN_STYLE_SET = new Set(markdownStyleIds);

export async function POST(request: Request) {
	let body: { markdown?: string; markdownStyle?: string; codeTheme?: string };
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const markdown = typeof body.markdown === "string" ? body.markdown : "";
	const markdownStyle =
		typeof body.markdownStyle === "string" && MARKDOWN_STYLE_SET.has(body.markdownStyle)
			? body.markdownStyle
			: "default";

	try {
		const html = await renderWechatHtml({
			markdown,
			markdownStyle,
			codeTheme: body.codeTheme,
		});
		return NextResponse.json({ html });
	} catch (e) {
		console.error("copy-wechat render error:", e);
		return NextResponse.json(
			{ error: e instanceof Error ? e.message : "Render failed" },
			{ status: 500 },
		);
	}
}
