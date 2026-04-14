extends RefCounted


static func compare_files(expected_path: String, actual_path: String, channel_tolerance: float = 0.0) -> Dictionary:
	var expected := Image.load_from_file(expected_path)
	var actual := Image.load_from_file(actual_path)
	if expected == null or actual == null:
		return {
			"ok": false,
			"reason": "load_failed",
			"expected_path": expected_path,
			"actual_path": actual_path,
		}
	return compare_images(expected, actual, channel_tolerance)


static func compare_images(expected: Image, actual: Image, channel_tolerance: float = 0.0) -> Dictionary:
	if expected == null or actual == null:
		return {"ok": false, "reason": "missing_image"}
	if expected.get_width() != actual.get_width() or expected.get_height() != actual.get_height():
		return {
			"ok": false,
			"reason": "size_mismatch",
			"expected_size": Vector2i(expected.get_width(), expected.get_height()),
			"actual_size": Vector2i(actual.get_width(), actual.get_height()),
		}
	var diff_pixels := 0
	var max_delta := 0.0
	var total_delta := 0.0
	var pixel_count := expected.get_width() * expected.get_height()
	for y in range(expected.get_height()):
		for x in range(expected.get_width()):
			var delta := _pixel_delta(expected.get_pixel(x, y), actual.get_pixel(x, y))
			total_delta += delta
			max_delta = maxf(max_delta, delta)
			if delta > channel_tolerance:
				diff_pixels += 1
	return {
		"ok": diff_pixels == 0,
		"reason": "pixel_diff" if diff_pixels > 0 else "",
		"pixel_count": pixel_count,
		"diff_pixels": diff_pixels,
		"diff_ratio": float(diff_pixels) / maxf(1.0, float(pixel_count)),
		"max_delta": max_delta,
		"mean_delta": total_delta / maxf(1.0, float(pixel_count)),
	}


static func _pixel_delta(a: Color, b: Color) -> float:
	var rgb_delta := maxf(absf(a.r - b.r), absf(a.g - b.g))
	var alpha_delta := maxf(absf(a.b - b.b), absf(a.a - b.a))
	return maxf(rgb_delta, alpha_delta)
