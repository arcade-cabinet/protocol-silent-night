extends SceneTree

const IMAGE_COMPARE := preload("res://scripts/image_compare.gd")
const DEFAULT_BASELINE_DIR := "res://test/baselines/mobile"
const DEFAULT_ACTUAL_DIR := "res://.artifacts/screenshots"
const FILES := [
	"menu_mobile.png",
	"present_select_mobile.png",
	"difficulty_mobile.png",
	"settings_mobile.png",
	"gameplay_mobile.png",
	"target_hint_mobile.png",
	"level_up_mobile.png",
	"boss_mobile.png",
	"victory_mobile.png",
]
const CHANNEL_TOLERANCE := 0.02
const DIFF_RATIO_LIMIT := 0.0003


func _initialize() -> void:
	var baseline_dir := OS.get_environment("MOBILE_BASELINE_DIR")
	if baseline_dir.is_empty():
		baseline_dir = DEFAULT_BASELINE_DIR
	var actual_dir := OS.get_environment("MOBILE_ACTUAL_DIR")
	if actual_dir.is_empty():
		actual_dir = DEFAULT_ACTUAL_DIR
	var channel_tolerance := _env_float("MOBILE_CHANNEL_TOLERANCE", CHANNEL_TOLERANCE)
	var diff_ratio_limit := _env_float("MOBILE_DIFF_RATIO_LIMIT", DIFF_RATIO_LIMIT)
	var failures: Array[String] = []
	for file_name in FILES:
		var baseline_path := "%s/%s" % [baseline_dir, file_name]
		var actual_path := "%s/%s" % [actual_dir, file_name]
		if not FileAccess.file_exists(baseline_path):
			failures.append("%s :: missing baseline" % file_name)
			continue
		if not FileAccess.file_exists(actual_path):
			failures.append("%s :: missing artifact" % file_name)
			continue
		var result: Dictionary = IMAGE_COMPARE.compare_files(baseline_path, actual_path, channel_tolerance)
		var reason := String(result.get("reason", ""))
		if reason in ["load_failed", "missing_image", "size_mismatch"] or float(result.get("diff_ratio", 1.0)) > diff_ratio_limit:
			failures.append("%s :: %s" % [file_name, _format_result(result)])
	if failures.is_empty():
		print("Mobile screenshot baselines match.")
		quit(0)
		return
	push_error("Mobile screenshot baseline mismatch:\n%s" % "\n".join(failures))
	quit(1)


func _format_result(result: Dictionary) -> String:
	if String(result.get("reason", "")) == "size_mismatch":
		return "size mismatch %s vs %s" % [result.get("expected_size"), result.get("actual_size")]
	if String(result.get("reason", "")) == "load_failed":
		return "load failed"
	return "diff_pixels=%d diff_ratio=%.6f max_delta=%.6f" % [
		int(result.get("diff_pixels", -1)),
		float(result.get("diff_ratio", 1.0)),
		float(result.get("max_delta", 1.0)),
	]


func _env_float(key: String, fallback: float) -> float:
	var raw := OS.get_environment(key)
	return fallback if raw.is_empty() else raw.to_float()
