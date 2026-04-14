extends GdUnitTestSuite

const IMAGE_COMPARE := preload("res://scripts/image_compare.gd")


func test_identical_images_compare_cleanly() -> void:
	var expected := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	expected.fill(Color("55f7ff"))
	var actual := expected.duplicate()
	var result: Dictionary = IMAGE_COMPARE.compare_images(expected, actual)
	assert_bool(bool(result["ok"])).is_true()
	assert_int(int(result["diff_pixels"])).is_equal(0)


func test_single_pixel_difference_is_reported() -> void:
	var expected := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	expected.fill(Color.BLACK)
	var actual := expected.duplicate()
	actual.set_pixel(1, 1, Color.WHITE)
	var result: Dictionary = IMAGE_COMPARE.compare_images(expected, actual)
	assert_bool(bool(result["ok"])).is_false()
	assert_int(int(result["diff_pixels"])).is_equal(1)
	assert_float(float(result["max_delta"])).is_greater(0.9)


func test_channel_tolerance_can_absorb_small_deltas() -> void:
	var expected := Image.create(2, 2, false, Image.FORMAT_RGBA8)
	expected.fill(Color(0.5, 0.5, 0.5, 1.0))
	var actual := expected.duplicate()
	actual.set_pixel(0, 0, Color(0.505, 0.5, 0.5, 1.0))
	var result: Dictionary = IMAGE_COMPARE.compare_images(expected, actual, 0.01)
	assert_bool(bool(result["ok"])).is_true()
