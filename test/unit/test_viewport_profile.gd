extends GdUnitTestSuite

var _profile := preload("res://scripts/viewport_profile.gd")


func test_compact_portrait_phone_requires_landscape_rotation() -> void:
	var result: Dictionary = _profile.for_viewport(Vector2(390.0, 844.0))
	assert_bool(result["is_mobile"]).is_true()
	assert_bool(result["is_portrait"]).is_true()
	assert_bool(result["supports_portrait_play"]).is_false()
	assert_bool(result["requires_landscape_rotation"]).is_true()
	assert_bool(result["uses_stacked_mobile_ui"]).is_false()
	assert_float(result["dash_button_size"]).is_greater_equal(96.0)


func test_large_portrait_foldable_supports_stacked_mobile_ui() -> void:
	var result: Dictionary = _profile.for_viewport(Vector2(720.0, 1280.0))
	assert_bool(result["is_mobile"]).is_true()
	assert_bool(result["is_portrait"]).is_true()
	assert_bool(result["supports_portrait_play"]).is_true()
	assert_bool(result["requires_landscape_rotation"]).is_false()
	assert_bool(result["uses_stacked_mobile_ui"]).is_true()


func test_dash_rect_stays_inside_safe_viewport() -> void:
	var viewport := Vector2(390.0, 844.0)
	var dash_rect: Rect2 = _profile.dash_rect(viewport)
	assert_bool(Rect2(Vector2.ZERO, viewport).encloses(dash_rect)).is_true()
	assert_float(dash_rect.end.x).is_less_equal(viewport.x)
	assert_float(dash_rect.end.y).is_less_equal(viewport.y)


func test_center_panel_size_clamps_to_available_space() -> void:
	var size: Vector2 = _profile.center_panel_size(Vector2(390.0, 844.0), Vector2(520.0, 540.0), Vector2(280.0, 320.0))
	assert_float(size.x).is_less_equal(390.0)
	assert_float(size.y).is_less_equal(844.0)
	assert_float(size.x).is_greater_equal(280.0)


func test_portrait_safe_area_override_tracks_top_notch_and_home_indicator() -> void:
	var viewport := Vector2(390.0, 844.0)
	var safe_area := Rect2(0.0, 44.0, 390.0, 766.0)
	var result: Dictionary = _profile.for_viewport(viewport, safe_area)
	assert_float(float(result["safe_top"])).is_equal_approx(44.0, 0.001)
	assert_float(float(result["safe_bottom"])).is_equal_approx(34.0, 0.001)
	assert_bool((result["safe_rect"] as Rect2).has_point(Vector2(195.0, 100.0))).is_true()


func test_dash_rect_respects_safe_bottom_inset_override() -> void:
	var viewport := Vector2(390.0, 844.0)
	var safe_area := Rect2(0.0, 44.0, 390.0, 766.0)
	var dash_rect: Rect2 = _profile.dash_rect(viewport, safe_area)
	assert_float(dash_rect.end.y).is_less_equal(810.0)
	assert_float(dash_rect.position.y).is_greater_equal(44.0)


func test_center_panel_size_clamps_against_landscape_notch_override() -> void:
	var viewport := Vector2(844.0, 390.0)
	var safe_area := Rect2(59.0, 0.0, 726.0, 390.0)
	var size: Vector2 = _profile.center_panel_size(viewport, Vector2(760.0, 340.0), Vector2(280.0, 280.0), safe_area)
	assert_float(size.x).is_less_equal(698.0)
	assert_float(size.y).is_less_equal(358.0)
