#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"

"$GODOT_BIN" --path "$ROOT" -s res://test/e2e/capture_mobile_screenshots.gd
"$GODOT_BIN" --headless --path "$ROOT" -s res://test/e2e/assert_mobile_screenshot_baselines.gd
