#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GODOT_BIN="${GODOT_BIN:-/Applications/Godot.app/Contents/MacOS/Godot}"
GODOT_CAPTURE_BIN="${GODOT_CAPTURE_BIN:-$GODOT_BIN}"
CAPTURE_ARGS=()
read -r -a CAPTURE_ARGS <<< "${GODOT_CAPTURE_ARGS:-}"

"$ROOT/scripts/run_mobile_visual_guard.sh"

if ((${#CAPTURE_ARGS[@]} > 0)); then
	"$GODOT_CAPTURE_BIN" "${CAPTURE_ARGS[@]}" --path "$ROOT" -s res://test/e2e/capture_present_test.gd
	"$GODOT_CAPTURE_BIN" "${CAPTURE_ARGS[@]}" --path "$ROOT" -s res://test/e2e/capture_present_gameplay.gd
else
	"$GODOT_CAPTURE_BIN" --path "$ROOT" -s res://test/e2e/capture_present_test.gd
	"$GODOT_CAPTURE_BIN" --path "$ROOT" -s res://test/e2e/capture_present_gameplay.gd
fi

for shot in present_test.png present_gameplay.png; do
	if [[ ! -f "$ROOT/.artifacts/screenshots/$shot" ]]; then
		echo "Missing production audit screenshot: $shot" >&2
		exit 1
	fi
done
