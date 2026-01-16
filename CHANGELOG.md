# Changelog

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
