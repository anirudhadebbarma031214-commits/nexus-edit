# NEXUS EDIT

A dark, desktop-first video editing application starter built with Electron, React and Vite.

## Features in this starter
- Borderless fullscreen desktop shell with custom title bar
- Media import dialog and media bin
- Video preview panel
- Multi-track timeline UI with selectable clips and playhead
- Inspector panel and keyboard shortcuts
- Windows/macOS packaging configuration

## Requirements
- Node.js 20 or newer
- npm

## Run locally
```bash
npm install
npm run dev
```

## Package the desktop app
```bash
npm run dist
```

Build artifacts are written to `release/`. FFmpeg-powered rendering/export, codec support, and full editing operations are planned follow-up work; this repository is an interactive starter, not yet a production-grade NLE.

## Security
The renderer uses a preload bridge, context isolation, and disabled Node integration. Do not load untrusted remote content in the Electron window.
