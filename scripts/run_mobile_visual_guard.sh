#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"
GODOT_CAPTURE_BIN="${GODOT_CAPTURE_BIN:-$GODOT_BIN}"
GODOT_ASSERT_BIN="${GODOT_ASSERT_BIN:-$GODOT_BIN}"
CAPTURE_ARGS=()
ASSERT_ARGS=()
read -r -a CAPTURE_ARGS <<< "${GODOT_CAPTURE_ARGS:-}"
read -r -a ASSERT_ARGS <<< "${GODOT_ASSERT_ARGS:---headless}"

if ((${#CAPTURE_ARGS[@]} > 0)); then
	"$GODOT_CAPTURE_BIN" "${CAPTURE_ARGS[@]}" --path "$ROOT" -s res://test/e2e/capture_mobile_screenshots.gd
	"$GODOT_CAPTURE_BIN" "${CAPTURE_ARGS[@]}" --path "$ROOT" -s res://test/e2e/capture_mobile_victory_overlay.gd
	"$GODOT_CAPTURE_BIN" "${CAPTURE_ARGS[@]}" --path "$ROOT" -s res://test/e2e/capture_mobile_meta_screens.gd
else
	"$GODOT_CAPTURE_BIN" --path "$ROOT" -s res://test/e2e/capture_mobile_screenshots.gd
	"$GODOT_CAPTURE_BIN" --path "$ROOT" -s res://test/e2e/capture_mobile_victory_overlay.gd
	"$GODOT_CAPTURE_BIN" --path "$ROOT" -s res://test/e2e/capture_mobile_meta_screens.gd
fi

if ((${#ASSERT_ARGS[@]} > 0)); then
	"$GODOT_ASSERT_BIN" "${ASSERT_ARGS[@]}" --path "$ROOT" -s res://test/e2e/assert_mobile_screenshot_baselines.gd
else
	"$GODOT_ASSERT_BIN" --path "$ROOT" -s res://test/e2e/assert_mobile_screenshot_baselines.gd
fi
