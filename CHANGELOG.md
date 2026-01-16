# Changelog

## [1.0.2](https://github.com/ZeitOnline/scrolleo/compare/v1.0.1...v1.0.2) (2026-01-16)


### 📝 Other Changes

* add bootstrap-sha to prevent release-please from backfilling old commits ([ae258bf](https://github.com/ZeitOnline/scrolleo/commit/ae258bf888fed17b09f0e6fbb328475baa1a75b6))
* disable npm provenance for self-hosted runners ([84a3dbf](https://github.com/ZeitOnline/scrolleo/commit/84a3dbf7731dfae9f384a2bb68465d79bd2ddbdf))
* trigger publish workflow on tag push instead of release creation ([dae8f12](https://github.com/ZeitOnline/scrolleo/commit/dae8f122c12ff3e69d8b2e37ea3765748b58ae0a))
* update bootstrap-sha to full SHA for release-please ([776562e](https://github.com/ZeitOnline/scrolleo/commit/776562e5caba2916bbde0d2b6fbe0756bee30b9a))
* update CHANGELOG for v1.0.1 with actual changes ([269c450](https://github.com/ZeitOnline/scrolleo/commit/269c4505de9ceaaa31fb2de0840bc0f6147011a2))
* update release-please configuration to not include component in tag ([160ebb1](https://github.com/ZeitOnline/scrolleo/commit/160ebb141dcf61be6b32e2b217e909c48bdcc7c9))

## [1.0.1](https://github.com/ZeitOnline/scrolleo/compare/v1.0.0...v1.0.1) (2026-01-16)

### 🐛 Bug Fixes

* add release-please manifest file ([ac8b05e](https://github.com/ZeitOnline/scrolleo/commit/ac8b05e15ebfc9a9234ada7b70eb57196f07e0d0))

### 📝 Other Changes

* add changelog generation and initial v1.0.0 changelog ([5817286](https://github.com/ZeitOnline/scrolleo/commit/5817286decd78689f8448cb4e93b5321a4f400b3))
* correct table formatting in README ([26c9d8d](https://github.com/ZeitOnline/scrolleo/commit/26c9d8d209b109f5f667cb0443a4fa8876805fa7))
* remove irrelevant files ([515a0c5](https://github.com/ZeitOnline/scrolleo/commit/515a0c513eb62975daee6f73a2bbb4b9d60661b1))
* replace TODO comments with proper documentation and examples ([d47ac4e](https://github.com/ZeitOnline/scrolleo/commit/d47ac4e147cb63f86a734898ee06bdcb5827878c))
* update .nvmrc to use Node.js 24 LTS ([483528b](https://github.com/ZeitOnline/scrolleo/commit/483528ba0ad47db509ecdc63ac94c972f4d439da))

## [1.0.0] - 2025-01-16

This is a rebrand of the original `scrollama` library that includes a number of performance improvements, bug fixes and modernizations while keeping the same API (for now). It also improves support for multiple instances on the same page.

### 🚀 Features

- **Modern ESM-only build**: Migrated from CommonJS/UMD to pure ES modules for better tree-shaking and modern JavaScript support
- **Performance optimizations**:
  - Batched progress callbacks using `requestAnimationFrame` to reduce callback overhead during rapid scrolling
  - Optimized `ResizeObserver` to use a single observer per instance (instead of one per step) for better performance
  - Batched resize observer updates with `requestAnimationFrame` to prevent layout thrashing
  - Batched layout reads during setup to minimize reflows
- **Enhanced scroll direction tracking**: Per-container scroll direction state
- **Memory leak fixes**: Proper cleanup of steps array and observers on destroy
- **Debug overlay optimization**: Single reusable element for debug overlays instead of creating new elements (work-in-progress)
- **Improved TypeScript definitions**

### 📝 Other Changes

- **Rebranding**: Renamed from `scrollama` to `scrolleo` with new branding and mascot
- **Build system modernization**: 
  - Migrated from Rollup to Vite
  - Added source maps for better debugging
  - ESM-only output format
- **Code quality**:
  - Added Prettier for consistent code formatting
  - Improved code organization and structure
- **Demo gallery**: Complete rewrite of demo examples, removed d3 dependency, updated the style
- **CI/CD setup**:
  - Added release-please for automated version management and changelog generation
  - Added GitHub Actions workflow for automated npm publishing
- **Documentation**: Updated README with more comprehensive examples
