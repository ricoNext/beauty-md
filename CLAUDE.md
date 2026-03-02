# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16.1.6 application bootstrapped with `create-next-app`. It's a Markdown editor/preview tool focused on generating WeChat-compatible HTML output. The application features a split-pane interface with real-time Markdown editing and preview, theme selection, and one-click HTML generation for the WeChat platform.

**Core Purpose**: Convert Markdown to beautifully formatted HTML suitable for WeChat articles with proper CSS inlining.

## Development Commands

```bash
# Development
npm run dev      # Start Next.js dev server (localhost:3000)
bun dev          # Alternative using bun

# Build & Production
npm run build    # Create production build
npm run start    # Start production server

# Code Quality
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

**Note**: This project uses Biome for linting/formatting (not ESLint). Configuration is in `biome.json`.

## Architecture Overview

### Key Directories

- `app/` - Next.js App Router pages and layouts
  - `app/page.tsx` - Main application with editor/preview split view
  - `app/api/copy-wechat/` - API route for WeChat HTML generation
  - `app/themes/` - CSS theme files for preview and code highlighting
- `components/` - React components
  - `components/markdown/` - Core editor and preview components
- `lib/` - Utility functions and core logic
  - `lib/wechat-render.ts` - Core HTML generation for WeChat
  - `lib/codemirror-setup.ts` - CodeMirror 6 configuration
  - `lib/code-themes.ts` / `lib/preview-themes.ts` - Theme definitions
- `mock/` - Mock data and demo content
- `bm.md/` - **Separate project** (TanStack Start + Vite app, more full-featured)

### Core Dependencies

- **Editor**: CodeMirror 6 with `@codemirror/lang-markdown`
- **Markdown Processing**: `react-markdown` with `remark-gfm`, `rehype-highlight`
- **CSS Inlining**: `juice` for WeChat HTML generation
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **Icons**: `lucide-react`
- **Build**: Next.js 16.1.6 with React 19 and React Compiler enabled

### Theme System

The application has two independent theme systems:

1. **Markdown Preview Themes** (7 styles): `default`, `simple`, `modern`, `terminal`, `sketch`, `retro90s`, `ayu-lapis`
   - Located in `app/themes/markdown-style/`
   - CSS files imported in `app/globals.css`

2. **Code Highlighting Themes** (3 styles): `atom-one-dark`, `default`, `codepen-embed`
   - Defined in `lib/code-themes.ts`
   - Applied via `rehype-highlight`

Themes are persisted in localStorage with keys `beauty-md-preview-theme` and `beauty-md-code-theme`.

### WeChat HTML Generation

The core feature is generating WeChat-compatible HTML via the `/api/copy-wechat` endpoint:

1. **Input**: Markdown content + theme selections
2. **Processing**:
   - Markdown → HTML via unified/remark/rehype pipeline
   - CSS inlining using `juice` (required for WeChat)
   - Space preservation outside HTML tags
3. **Output**: Self-contained HTML suitable for pasting into WeChat editor

Key file: `lib/wechat-render.ts` contains the main rendering logic.

### State Management

- React `useState` for local component state
- LocalStorage persistence for theme preferences
- No global state management library

### Styling Approach

- Tailwind CSS v4 with utility classes
- shadcn/ui component library
- CSS custom properties for theming
- Theme switching via data attributes

## Important Notes

### Separate bm.md Project

There's a **separate, more full-featured version** in the `bm.md/` directory:
- Uses TanStack Start (React 19 + TanStack Router) instead of Next.js
- Vite 7 build system
- More comprehensive features (14 themes, image export, REST API, MCP protocol)
- This appears to be the "source" project, while the current directory is a simplified Next.js version

### Code Quality

- TypeScript with strict configuration
- Path aliases (`@/*`) configured in `tsconfig.json`
- Biome for linting/formatting (not ESLint)
- React Compiler enabled in `next.config.ts`

### Development Workflow

1. **Adding dependencies**: Use `npm install` (or `bun add`)
2. **Adding shadcn/ui components**: Use `npx shadcn add <component>`
3. **Testing**: No test framework configured in this simplified version
4. **Formatting**: Always run `npm run format` before committing

### Key Files for Understanding

1. `app/page.tsx` - Main application logic and state management
2. `lib/wechat-render.ts` - Core WeChat HTML generation
3. `components/markdown/markdown-editor.tsx` - CodeMirror editor implementation
4. `components/markdown/markdown-preview.tsx` - React-Markdown preview with custom components
5. `app/themes/markdown-style/index.ts` - Theme definitions and loading logic