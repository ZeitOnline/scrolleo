# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Commands

```sh
npm run build          # Build library to dist/ (ESM only, via Vite)
npm run dev            # Build in watch mode
npm run demo           # Build, copy to demo/dist/, and open demo in browser
npm run format         # Format with Prettier
npm run format:check   # Check formatting without writing
```

There are no tests. Formatting is the only automated check.

## Architecture

Scrolleo is a pure ESM JavaScript library (no TypeScript source) that uses `IntersectionObserver` to drive scrollytelling step callbacks.

**Entry point:** `index.js` re-exports `src/entry.js`, which Vite bundles into `dist/scrolleo.js`. The public types live in `index.d.ts` (hand-maintained, not generated).

**Core: `src/entry.js`**  
The `scrolleo()` factory creates a single instance and returns a chainable `S` object. All public methods (`setup`, `onStepEnter`, `onStepExit`, `onStepProgress`, `enable`, `disable`, `destroy`, `resize`, `offset`) return `S` for chaining.

Each step element gets two `IntersectionObserver`s attached:
- **step observer** — fires `enter`/`exit` callbacks when the step crosses the offset threshold
- **progress observer** — fires incremental progress updates (only when `progress: true`)

`ResizeObserver` watches step heights and re-creates observers when height changes, batched via `requestAnimationFrame` to avoid layout thrashing.

**`src/scroll.js`** — Scroll direction tracking. Uses a `WeakMap` keyed by scroll container (defaults to `window`) to store direction state. Listeners are passive and reference-counted so multiple instances sharing a container share one listener.

**Key design decisions:**
- `IntersectionObserver` does the heavy lifting; scroll events are only used for direction detection
- Progress callbacks are batched with `requestAnimationFrame` and deduped by step index
- Per-step `data-offset` attributes override the global offset
- `once: true` uses an `exclude[]` array to suppress repeat callbacks

**Supporting modules:**
- `src/parseOffset.js` — normalizes offset to `{value, format}` where format is `'ratio'` or `'pixels'`
- `src/createProgressThreshold.js` — generates an `IntersectionObserver` threshold array based on step height and threshold granularity
- `src/indexSteps.js` / `src/getIndex.js` — attach and retrieve a numeric index on each step DOM node
- `src/debug.js` — injects a visual overlay showing threshold lines (enabled via `debug: true`)

## Release process

Releases are fully automated. Push to `main` triggers a GitHub Actions workflow that runs `release-please` to manage versioning and then publishes to npm under `@zeitonline/scrolleo`. CHANGELOG.md and version bumps are managed by release-please via conventional commits.
