#!/bin/bash
#
# Generates a proper Xcode project for the Reels Blocker Safari Web Extension
# using Apple's safari-web-extension-converter tool.
#
# Usage: ./convert.sh [--output-dir <path>]
#
# Requirements: Xcode 15+ with command line tools installed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESOURCES_DIR="$SCRIPT_DIR/Reels Blocker Extension/Resources"
OUTPUT_DIR="${1:-$SCRIPT_DIR/Xcode}"

if ! command -v xcrun &> /dev/null; then
    echo "Error: Xcode command line tools not found."
    echo "Install with: xcode-select --install"
    exit 1
fi

echo "Converting web extension to Safari Web Extension..."
echo "Source: $RESOURCES_DIR"
echo "Output: $OUTPUT_DIR"

xcrun safari-web-extension-converter \
    "$RESOURCES_DIR" \
    --project-location "$OUTPUT_DIR" \
    --app-name "Reels Blocker" \
    --bundle-identifier "com.reelsblocker.Reels-Blocker" \
    --macos-only \
    --no-open \
    --no-prompt \
    --swift

echo ""
echo "Xcode project created at: $OUTPUT_DIR/Reels Blocker"
echo ""
echo "Next steps:"
echo "  1. Open $OUTPUT_DIR/Reels Blocker/Reels Blocker.xcodeproj"
echo "  2. Select your Development Team in Signing & Capabilities"
echo "  3. Build and Run (Cmd+R)"
echo "  4. Enable the extension in Safari > Settings > Extensions"
