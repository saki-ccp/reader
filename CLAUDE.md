# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reader is an open-source ebook reader built with **Next.js 16** (frontend) and **Tauri v2** (native shell). It targets macOS, Windows, Linux, Android, iOS, and Web. Licensed under AGPL-3.0.

## Repository Structure

This is a **pnpm monorepo** (pnpm v10.30.3) with a Cargo workspace:

- `apps/reader-app/` — The main application (Next.js frontend + Tauri Rust backend)
- `packages/foliate-js/` — Forked ebook rendering engine (submodule)
- `packages/simplecc-wasm/` — Chinese character conversion WASM (submodule)
- `packages/tauri/` — Patched Tauri core (submodule, patches `tauri` crate)
- `packages/tauri-plugins/` — Patched Tauri FS plugin (submodule, patches `tauri-plugin-fs`)
- `packages/turso_ext/` — Turso database extension (patches `turso_ext` crate)

**Important:** Git submodules must be initialized: `git submodule update --init --recursive`

## Build & Development Commands

All commands run from the repo root unless noted otherwise.

```bash
# Initial setup
git submodule update --init --recursive
pnpm install
pnpm --filter @reader/reader-app setup-vendors   # copy pdfjs + simplecc to public/

# Development
pnpm tauri dev          # Tauri desktop app with hot reload
pnpm dev-web            # Web-only dev server (no Rust compilation)

# Build
pnpm tauri build        # Production desktop build
pnpm --filter @reader/reader-app build-web   # Production web build

# Verify dependencies
pnpm tauri info
```

## Testing

Tests live in `apps/reader-app/src/__tests__/` and colocated `*.test.ts` files.

```bash
# From apps/reader-app/ (or use pnpm --filter)
pnpm test                    # Unit tests (vitest, jsdom, watch mode)
pnpm test -- --watch=false   # Unit tests, single run
pnpm test:browser            # Browser tests (Playwright + vitest)
pnpm test:tauri              # Tauri integration tests (needs webdriver feature)
pnpm test:all                # All test suites

# Run a single test file
pnpm test -- path/to/file.test.ts
```

Three vitest configs exist:
- `vitest.config.mts` — jsdom unit tests (excludes `*.browser.test.ts`, `*.tauri.test.ts`)
- `vitest.browser.config.mts` — Browser tests via Playwright (includes `*.browser.test.ts`)
- `vitest.tauri.config.mts` — Tauri integration tests (includes `*.tauri.test.ts`)

## Linting & Formatting

```bash
# TypeScript / JS
pnpm --filter @reader/reader-app lint     # ESLint + tsgo type check
pnpm format:check                            # Prettier check (all workspace files)
pnpm format                                  # Prettier auto-fix

# Rust (only when src-tauri/ files changed)
pnpm --filter @reader/reader-app fmt:check      # cargo fmt check
pnpm --filter @reader/reader-app clippy:check   # cargo clippy
```

Pre-commit hooks via Husky + lint-staged auto-format staged files with Prettier.

## Architecture

### Platform Abstraction Layer

The app runs on both Tauri (native desktop/mobile) and Web. Platform detection is in `src/services/environment.ts`:

- `NEXT_PUBLIC_APP_PLATFORM` env var controls the build target: `"tauri"` or `"web"`
- `AppService` interface (`src/types/system.ts`) defines all platform capabilities (filesystem, database, settings, etc.)
- Two implementations:
  - `NativeAppService` (`src/services/nativeAppService.ts`) — uses Tauri APIs for file system, database, etc.
  - `WebAppService` (`src/services/webAppService.ts`) — uses browser APIs, IndexedDB, etc.
- `EnvContext` (React context) provides the resolved `AppService` to the component tree

### Frontend (Next.js + React)

- **Routing:** Next.js App Router in `src/app/` — main pages are `/library` and `/reader`
- **State management:** Zustand stores in `src/store/` (readerStore, libraryStore, themeStore, sidebarStore, etc.)
- **Context providers:** `src/context/` — AuthContext, EnvContext, SyncContext, PHContext (PostHog)
- **Styling:** Tailwind CSS + daisyUI components. Primitive UI components in `src/components/primitives/` (aliased as `@/components/ui/*`)
- **i18n:** i18next with locale files in `public/locales/`
- **Path alias:** `@/*` maps to `src/*` (configured in tsconfig.json)

### Backend (Tauri / Rust)

- Entry: `src-tauri/src/lib.rs` — plugin registration, Tauri command handlers, window setup
- Platform-specific modules: `src-tauri/src/macos/`, `src-tauri/src/windows/`, `src-tauri/src/android/`
- Custom Tauri plugins in `src-tauri/plugins/`:
  - `tauri-plugin-native-bridge` — native UI/OS bridge (screen brightness, safe area, orientation lock, IAP)
  - `tauri-plugin-native-tts` — native text-to-speech
  - `tauri-plugin-turso` — Turso/libSQL database integration

### Key Services (Frontend)

- `src/services/bookService.ts` — Book loading, parsing, content management
- `src/services/commandRegistry.ts` — Command palette and keyboard shortcuts
- `src/services/sync/` — Cross-platform sync via Supabase
- `src/services/tts/` — Text-to-speech engine abstraction
- `src/services/translators/` — Translation service integrations (DeepL, Yandex)
- `src/services/ai/` — AI-powered features (summarization, chat)
- `src/libs/document.ts` — Document parsing and metadata extraction

### Ebook Rendering

The `foliate-js` package (in `packages/foliate-js/`) handles EPUB, MOBI, FB2, CBZ rendering. PDF rendering uses vendored pdfjs in `public/vendor/pdfjs/`.

## TypeScript Conventions

- Strict mode enabled, target ES2022
- Never use `any` — use `unknown`, proper types, or generics
- Unused variables prefixed with `_` are allowed (ESLint configured)

## CI (Pull Request Checks)

Three parallel CI jobs on PRs to main:
1. **rust_lint** — `cargo fmt --check` + `cargo clippy -D warnings`
2. **build_web_app** — Prettier check, unit tests, browser tests, lint, web build + output checks
3. **build_tauri_app** — Tauri integration tests under xvfb

## Verification Checklist

Before marking work complete:
1. `pnpm test` — unit tests pass
2. `pnpm --filter @reader/reader-app lint` — ESLint + type check pass
3. `pnpm fmt:check` — Rust format (only when `src-tauri/` changed)
4. `pnpm clippy:check` — Rust lint (only when `src-tauri/` changed)

## Changelog

### 2026-04-02: Library Background Image Customization

Completed the library background image feature — users can now set a custom image as the library homepage background, and adjust overlay opacity, blur, and size.

**Modified files:**

1. `apps/reader-app/src/app/library/page.tsx`
   - Removed hardcoded `bg-black/30` overlay and inline background-image style on the parent div
   - Added two separate absolutely-positioned layers: a background image div (supports `filter: blur`) and an overlay div (supports dynamic `opacity`)
   - Wired up `libraryBackgroundSize` setting with `backgroundRepeat: 'repeat'` for `auto` mode

2. `apps/reader-app/src/types/settings.ts`
   - Added `libraryBackgroundSize: string` to `SystemSettings`

3. `apps/reader-app/src/components/settings/color/LibraryBackgroundSelector.tsx`
   - Added `backgroundSize` / `onSizeChange` props
   - Added Size dropdown (Cover / Contain / Original) to the settings card

4. `apps/reader-app/src/components/settings/ColorPanel.tsx`
   - Added `libraryBgSize` state and `handleLibraryBgSizeChange` handler
   - Passed new size props to `LibraryBackgroundSelector`

5. `apps/reader-app/src/app/library/components/SettingsMenu.tsx`
   - Removed ~45 行重复的 `handleSetBackgroundImage` 函数（图片导入逻辑与 `LibraryBackgroundSelector` 完全重复）
   - 菜单中移除了 "Set Background Image" 入口（已整合到 Settings Dialog 的 Color 面板），仅保留 "Clear Background Image" 快捷操作

### 2026-04-02: Import Button Transparency Fix

**Modified files:**

1. `apps/reader-app/src/app/library/components/Bookshelf.tsx`
   - 将添加书籍（+）按钮背景从不透明 `bg-base-100` 改为半透明 `bg-base-100/30`，避免设置背景图后白色方块遮挡背景
