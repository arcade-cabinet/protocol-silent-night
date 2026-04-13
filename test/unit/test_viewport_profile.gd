extends GdUnitTestSuite

var _profile := preload("res://scripts/viewport_profile.gd")


func test_portrait_viewport_uses_mobile_profile() -> void:
	var result: Dictionary = _profile.for_viewport(Vector2(390.0, 844.0))
	assert_bool(result["is_mobile"]).is_true()
	assert_bool(result["is_portrait"]).is_true()
	assert_float(result["dash_button_size"]).is_greater_equal(96.0)


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
