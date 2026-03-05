# Release 文档

## v1.0.0（首个正式版本）

**发布日期**：待定

Beauty MD 首个正式版本，提供基于 CodeMirror 6 的 Markdown 编辑、实时预览，以及一键生成微信公众号可用的 HTML。

---

### 核心功能

#### 编辑与预览

- **左右分栏**：左侧为 Markdown 编辑区，右侧为实时预览区，无标题栏，界面简洁。
- **实时预览**：编辑内容即时渲染为 HTML 预览，与最终复制到公众号的排版一致。
- **编辑器**：基于 CodeMirror 6，支持 `@codemirror/lang-markdown`，占位符为「Markdown 编辑器」。

#### 预览主题

- 提供 **8 种 Markdown 预览主题**：默认、优雅、简洁、Ayu Light、Blueprint、Botanical、Newsprint、Professional。
- 主题在预览区右侧操作栏通过 **Popover** 选择，当前主题会持久化到本地（localStorage）。

#### 代码高亮

- 支持 **3 种代码高亮样式**：Atom One Dark、Default、CodePen Embed。
- 代码样式在预览区右侧操作栏通过 **Popover** 选择，选择结果会持久化到本地。

#### 复制到公众号

- **一键复制**：在预览区右侧操作栏点击「复制到公众号」按钮，将当前 Markdown 转为带内联样式的 HTML 并写入剪贴板。
- **公众号适配**：
  - 使用 juice 将主题 CSS 内联到 HTML，便于在微信公众号编辑器中保持排版。
  - 代码块空白与换行做保护处理，避免公众号折叠空格/换行。
  - 列表/复选框在 HTML 中规范为 ☑/☐ 等文本，兼容公众号展示。

---

### 技术栈

- **框架**：Next.js 16.1.6（App Router）、React 19
- **编辑器**：CodeMirror 6、@codemirror/lang-markdown
- **Markdown**：unified、remark-gfm、rehype-highlight、react-markdown
- **公众号 HTML**：juice（CSS 内联）
- **UI**：Tailwind CSS 4、shadcn/ui（Popover、Tooltip、Button）、lucide-react
- **代码质量**：TypeScript、Biome（lint/format）

---

### 界面说明

- **编辑区**：全高占满左侧，无顶栏标题。
- **预览区**：右侧为预览内容区域；其右侧为固定宽度竖条操作栏，包含：
  - 预览主题（图标 + Popover 列表）
  - 代码样式（图标 + Popover 列表）
  - 复制到公众号（图标按钮，带 Tooltip 与状态：已复制 / 复制失败）

主题与代码样式的选择会通过 localStorage 记住，下次访问自动恢复。

---

### API

- **POST `/api/copy-wechat`**
  - Body：`{ markdown: string, markdownStyle?: string, codeTheme?: string }`
  - 返回：`{ html: string }` 或 `{ error: string }`
  - 用于服务端生成公众号用 HTML，前端复制到剪贴板时调用此接口获取 HTML。

---

### 已知限制

- 当前仅支持「复制到公众号」；复制到小红书、生成封面图等功能未在本版本提供。
- 构建时若仓库内含其他子项目（如 bm.md），可能受其 TypeScript 配置影响，本应用代码已按上述功能实现并可用。

---

### 文件与目录（与本次发布相关）

- `app/page.tsx`：主页面（分栏、右侧操作栏、复制逻辑）
- `app/layout.tsx`：根布局（含 TooltipProvider）
- `app/api/copy-wechat/route.ts`：复制到公众号 API
- `app/themes/markdown-style/`：预览主题 CSS 及加载
- `app/themes/code-theme/`：代码高亮主题
- `components/markdown/`：Markdown 编辑器与预览组件
- `components/ui/`：Popover、Tooltip、Button 等 UI 组件
- `lib/wechat-render.ts`：公众号 HTML 渲染（unified + juice）
- `lib/preview-themes.ts`、`lib/code-themes.ts`：主题配置
