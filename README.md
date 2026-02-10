# Marquee

A desktop app for managing streaming overlays in OBS. Create and control lower thirds, title cards, topic bars, tickers, and more — all from a drag-and-drop control panel that syncs live to your OBS Browser Source.

## Features

- Scene-based overlay management with draft/live workflow
- Drag-and-drop layer reordering
- Real-time WebSocket sync between control panel and overlay
- Templates: Lower Third, Title Card, BRB, Topic Bar, Ticker
- Quick Tweet display from X/Twitter URLs
- System tray for background operation (macOS)

## Requirements

- [Bun](https://bun.sh) v1.1+
- [OBS Studio](https://obsproject.com) with Browser Source

## Quick Start

### Standalone Mode (no Electron)

```bash
bun install
bun run dev
```

Open `http://localhost:3010/control` in your browser.

### Electron App

```bash
bun install
bun run dev:electron
```

## OBS Setup

1. Start the app (standalone or Electron)
2. In OBS, add a **Browser Source**
3. Set the URL to `http://localhost:3010/overlay` (or `?scene=<id>` for a specific scene)
4. Set width/height to match your canvas (e.g., 1920x1080)
5. Layers synced as "Live" in the control panel will appear in OBS

## Building

### Package for Distribution

```bash
# macOS
bun run dist:mac

# Linux
bun run dist:linux

# Windows
bun run dist:win
```

Built packages are output to the `release/` directory.

## Development

```bash
# Run all tests
bun test

# Build Electron TypeScript
bun run build:electron

# Build CSS
bun run build:css
```

## License

MIT
