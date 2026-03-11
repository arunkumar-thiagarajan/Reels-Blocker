# Reels & Shorts Blocker

A Chrome extension that blocks short-form video content across major platforms to help you reduce doomscrolling.

## Supported Platforms

- **YouTube Shorts** — Hides Shorts shelves, tabs, and redirects `/shorts/` URLs to the regular player
- **Instagram Reels** — Hides the Reels tab and redirects `/reels/` URLs
- **Facebook Reels** — Hides Reels sections and redirects `/reel/` URLs
- **TikTok** — Blocks the entire site with a friendly message

## Features

- Per-platform toggle controls via the popup
- Enable/Disable All with one click
- Settings sync across Chrome devices
- Lightweight — no background service worker needed

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `Reels-Blocker` folder
5. The extension icon will appear in your toolbar

## Usage

Click the extension icon to open the popup. Toggle individual platforms on or off. Changes take effect immediately — no page reload needed (except for TikTok unblock).
