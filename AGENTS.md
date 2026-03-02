# AGENTS.md — cognitive-map-tool

## Project Overview

React 18 + TypeScript SPA for scientific knowledge management based on the "Incremental Map Model."
Local-only app using IndexedDB (Dexie.js) for persistence. No backend. Chinese-language UI.

## Tech Stack

- **Runtime**: Vite 5 dev server (port 3000) + ES modules
- **Framework**: React 18, react-router-dom v6 (BrowserRouter)
- **Language**: TypeScript 5 (strict mode, ES2020 target)
- **Styling**: Tailwind CSS 3 with custom theme + PostCSS + Autoprefixer
- **Database**: Dexie.js (IndexedDB wrapper) + dexie-react-hooks
- **Visualization**: @xyflow/react (graph), recharts (charts)
- **Icons**: lucide-react
- **Dates**: date-fns
- **Package Manager**: pnpm

## Build / Dev Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server at http://localhost:3000 (auto-opens browser)
pnpm build            # Type-check (tsc -b) then Vite production build
pnpm preview          # Preview production build
```

There is **no linter**, **no formatter**, and **no test framework** configured.
No eslint, prettier, vitest, or jest in devDependencies. No test scripts.

## Project Structure

```
src/
├── main.tsx              # Entry point (StrictMode, renders App)
├── App.tsx               # Root component with BrowserRouter + Routes
├── index.css             # Tailwind directives + custom component classes
├── components/           # Shared UI components
│   ├── Layout.tsx        # App shell (sidebar nav + main content area)
│   ├── Modal.tsx         # Modal dialog + useConfirm hook
│   ├── PointCard.tsx     # Point map card display
│   ├── LineCard.tsx      # Line map card display
│   └── ErrorBadge.tsx    # Error level badge
├── pages/                # Route page components
│   ├── DashboardPage.tsx
│   ├── PointMapPage.tsx
│   ├── LineMapPage.tsx
│   ├── GraphPage.tsx
│   ├── ArchivePage.tsx
│   ├── ErrorAnalysisPage.tsx
│   └── EvaluationPage.tsx
├── hooks/                # Custom React hooks (data access layer)
│   ├── usePointMaps.ts
│   ├── useLineMaps.ts
│   ├── useConnections.ts
│   └── useErrorAnalysis.ts
├── db/
│   └── index.ts          # Dexie database definition, ID generation, seed data
└── types/
    └── index.ts          # All TypeScript interfaces and type definitions
```

## Code Style Guidelines

### TypeScript

- **Strict mode** enabled; do NOT loosen with `as any`, `@ts-ignore`, or `@ts-expect-error`
- `noUnusedLocals` and `noUnusedParameters` are **disabled** — unused vars are tolerated
- Use `type` keyword for type-only imports: `import type { PointMap } from '../types'`
- Prefer `interface` for object shapes, `type` for unions/aliases
- Use `Omit<T, 'field'>` and `Partial<T>` utility types for function parameters
- IDs are `string` type, generated via `generateId()` from `src/db`

### Components

- **Named exports** for all components: `export function ComponentName() {}`
- Only exception: `App.tsx` uses `export default function App()`
- Functional components only — no class components
- Props interfaces named with `Props` suffix: `interface PointCardProps {}`
- Props destructured in function signature: `function Modal({ isOpen, onClose, title }: ModalProps)`
- Use `React.ReactNode` for children prop type
- Default prop values via destructuring: `compact = false`

### Hooks

- Custom hooks prefixed with `use`: `usePointMaps`, `useLineMaps`
- Hooks return object (not array): `return { points, addPoint, updatePoint }`
- Data fetching via `useLiveQuery` from dexie-react-hooks (reactive IndexedDB queries)
- Async operations as arrow functions inside hook: `const addPoint = async (data) => {}`

### File & Naming Conventions

- **PascalCase** files: Components (`PointCard.tsx`), Pages (`DashboardPage.tsx`)
- **camelCase** files: Hooks (`usePointMaps.ts`), utilities
- Pages suffixed with `Page`: `DashboardPage`, `GraphPage`
- Components have no suffix
- One component per file

### Formatting

- **2-space** indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line expressions
- Arrow functions for callbacks and inline handlers
- Template literals for dynamic strings

### Styling (Tailwind CSS)

- All styling via Tailwind utility classes — no CSS modules, no styled-components
- Custom reusable classes defined in `src/index.css` under `@layer components` (e.g., `.card`, `.btn-primary`, `.input`, `.badge`)
- Custom theme colors in `tailwind.config.js`: `point-*` (blue), `line-*` (purple), `error.*` (semantic)
- Use custom component classes (`.card-point`, `.btn-primary`, `.sidebar-link`) before raw utilities
- Responsive: `md:` and `lg:` breakpoint prefixes for grid layouts
- Use `className` string concatenation or ternary for conditional classes — no `clsx`/`classnames` library

### Database (Dexie.js)

- Single DB instance exported as `db` from `src/db/index.ts`
- Three tables: `points`, `lines`, `connections`
- All mutations go through custom hooks (usePointMaps, useLineMaps, etc.)
- Use `db.transaction('rw', [...tables], async () => {})` for multi-table operations
- IDs generated via `generateId()`: `${Date.now()}-${random}`
- Timestamps as ISO 8601 strings (`new Date().toISOString()`)

### Imports Order

1. React (`import React from 'react'`)
2. Third-party libraries (react-router-dom, lucide-react, dexie-react-hooks, date-fns)
3. Local modules — db, hooks, components
4. Type-only imports (`import type { ... }`)

### Comments & Language

- JSDoc comments (`/** ... */`) for interfaces, functions, and type definitions
- Comments in **Chinese** — this is a Chinese-language project
- Section references to the academic paper in comments (e.g., `Section 4.2.1`)
- Inline comments for clarification, not for obvious code

### Error Handling

- Early return pattern: `if (!point) return;`
- No try/catch blocks in current codebase — errors propagate to React error boundaries
- Null coalescing for query results: `points ?? []`
- Loading states: conditional render with simple div placeholder

## Domain Concepts

The app implements the "Incremental Map Model" framework:

- **Point Map (点图)**: Experimental records — objective, probability=1 verified results
- **Line Map (线图)**: Theoretical conjectures — scientist's independent hypotheses
- **Connection**: Links between points and lines (supports/contradicts/inspires/verifies)
- **Error levels**: perceptual, tool, abstraction, transmission, cognitive
- **Overlay updates**: Additive history — never overwrite, always append

Key principle: Point maps are immutable truth; line maps are mutable conjecture.
Line maps CANNOT modify point maps.
