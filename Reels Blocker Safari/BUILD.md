# Reels Blocker - Safari Web Extension

A Safari Web Extension that blocks Instagram Reels and Facebook Reels to reduce doomscrolling.

## Requirements

- macOS 13.0 or later
- Xcode 15.0 or later
- Safari 17.0 or later

## Build & Install

1. Open `Reels Blocker.xcodeproj` in Xcode
2. Select the **Reels Blocker** scheme
3. Click **Product > Build** (Cmd+B)
4. Click **Product > Run** (Cmd+R) to launch the host app
5. The host app will prompt you to enable the extension in Safari

## Enable the Extension in Safari

1. Open **Safari > Settings > Extensions**
2. Check the box next to **Reels Blocker**
3. Grant permissions for instagram.com and facebook.com when prompted

## Development

To test changes during development:

1. In Safari, enable **Develop > Allow Unsigned Extensions**
2. Build and run from Xcode
3. The extension reloads automatically when you rebuild

## How It Works

The extension uses content scripts to:
- Hide Reels navigation tabs and feed sections on Instagram and Facebook
- Redirect `/reels/` and `/reel/` URLs back to the home page
- Monitor for dynamically loaded content via MutationObserver

Toggle blocking per-platform using the extension popup in Safari's toolbar.

## Project Structure

```
Reels Blocker/              # macOS host application
  AppDelegate.swift         # App lifecycle
  ViewController.swift      # Main window with extension status
  Main.storyboard           # UI layout

Reels Blocker Extension/    # Safari Web Extension
  SafariWebExtensionHandler.swift  # Native message handler
  Resources/
    manifest.json           # Web extension manifest (MV3)
    popup/                  # Extension popup UI
    content/                # Content scripts (instagram.js, facebook.js)
    icons/                  # Extension icons
```

## Signing

For distribution, you'll need to:
1. Set your Development Team in both targets' Signing & Capabilities
2. Update the bundle identifiers if needed
3. The extension bundle ID must be a child of the app bundle ID
