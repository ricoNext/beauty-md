# Beauty MD

基于 CodeMirror 6 的 Markdown 编辑与实时预览工具，支持多主题排版与**一键复制到微信公众号**，生成带内联样式的 HTML，便于在公众号编辑器中保持排版效果。

## 功能概览

- **左右分栏**：左侧 Markdown 编辑（CodeMirror 6），右侧实时预览，界面简洁无标题栏
- **预览主题**：8 种排版主题（默认、优雅、简洁、Ayu Light、Blueprint、Botanical、Newsprint、Professional），在预览区右侧通过 Popover 切换，选择结果持久化到本地
- **代码高亮**：3 种代码样式（Atom One Dark、Default、CodePen Embed），同样在右侧操作栏通过 Popover 选择并持久化
- **复制到公众号**：一键将当前内容转为带内联样式的 HTML 并写入剪贴板，适配公众号编辑器（代码块空白保护、列表/复选框规范化等）

## 快速开始

### 安装依赖

```bash
npm install
# 或
bun install
```

### 启动开发服务

```bash
npm run dev
# 或
bun dev
```

在浏览器打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建与生产

```bash
npm run build
npm run start
```

### 代码质量

```bash
npm run lint    # Biome 检查
npm run format  # Biome 格式化
```

## 技术栈

- **框架**：Next.js 16（App Router）、React 19
- **编辑器**：CodeMirror 6、@codemirror/lang-markdown
- **Markdown**：unified、remark-gfm、rehype-highlight、react-markdown
- **公众号 HTML**：juice（CSS 内联）
- **UI**：Tailwind CSS 4、shadcn/ui、lucide-react
- **代码规范**：TypeScript、Biome

## 项目结构（简要）

| 路径 | 说明 |
|------|------|
| `app/page.tsx` | 主页面：分栏布局、右侧操作栏、复制逻辑 |
| `app/api/copy-wechat/` | 复制到公众号 API（POST，返回内联 HTML） |
| `app/themes/markdown-style/` | 预览主题 CSS 及加载 |
| `app/themes/code-theme/` | 代码高亮主题 |
| `components/markdown/` | Markdown 编辑器与预览组件 |
| `components/ui/` | Popover、Tooltip、Button 等 UI 组件 |
| `lib/wechat-render.ts` | 公众号 HTML 渲染（unified + juice） |

更详细的版本与功能说明见 [RELEASE.md](./RELEASE.md)。

## License

Private.
