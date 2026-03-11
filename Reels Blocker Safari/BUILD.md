# Reels Blocker - Safari Web Extension

A Safari Web Extension that blocks Instagram Reels and Facebook Reels to reduce doomscrolling.

## Requirements

- macOS 13.0 or later
- Xcode 15.0 or later (with command line tools)
- Safari 17.0 or later

## Build & Install

### Step 1: Generate the Xcode Project

Run the converter script to create a proper Xcode project from the web extension source:

```bash
cd "Reels Blocker Safari"
./convert.sh
```

This uses Apple's `safari-web-extension-converter` to generate a complete Xcode project at `Xcode/Reels Blocker/`.

### Step 2: Build in Xcode

1. Open `Xcode/Reels Blocker/Reels Blocker.xcodeproj`
2. Set your **Development Team** in both targets' Signing & Capabilities
3. Click **Product > Run** (Cmd+R)

### Step 3: Enable in Safari

1. Open **Safari > Settings > Extensions**
2. Check the box next to **Reels Blocker**
3. Grant permissions for instagram.com and facebook.com when prompted

## Development

To test changes during development:

1. In Safari, enable **Develop > Allow Unsigned Extensions**
2. Edit files in `Reels Blocker Extension/Resources/`
3. Re-run `./convert.sh` to regenerate the Xcode project
4. Build and run from Xcode

## How It Works

The extension uses content scripts to:
- Hide Reels navigation tabs and feed sections on Instagram and Facebook
- Redirect `/reels/` and `/reel/` URLs back to the home page
- Monitor for dynamically loaded content via MutationObserver

Toggle blocking per-platform using the extension popup in Safari's toolbar.

## Source Structure

```
Reels Blocker Extension/Resources/   # Web extension source (edit these)
  manifest.json                      # Extension manifest (MV3)
  popup/                             # Popup UI (HTML/CSS/JS)
  content/                           # Content scripts
    instagram.js                     # Instagram Reels blocker
    facebook.js                      # Facebook Reels blocker
  icons/                             # Extension icons

convert.sh                          # Generates Xcode project from source
```
