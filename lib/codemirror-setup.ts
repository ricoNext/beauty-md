import type { Extension } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";

/**
 * 默认 CodeMirror 扩展：基础编辑能力 + Markdown 语法高亮。
 * 便于后续增加主题、快捷键、折叠、lint 等。
 */
export function getDefaultMarkdownExtensions(): Extension[] {
	return [basicSetup, markdown()];
}
