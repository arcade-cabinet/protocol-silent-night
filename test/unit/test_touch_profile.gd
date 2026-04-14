extends GdUnitTestSuite

const TOUCH_PROFILE := preload("res://scripts/touch_profile.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


class SaveDouble extends Node:
	var prefs: Dictionary = {}

	func get_preference(key: String, default_value = null):
		return prefs.get(key, default_value)

	func set_preference(key: String, value) -> void:
		prefs[key] = value


func test_left_handed_profile_moves_dash_zone_to_safe_left() -> void:
	var save: SaveDouble = auto_free(SaveDouble.new())
	save.set_preference("touch_handedness", "left")
	var viewport_size := Vector2(390.0, 844.0)
	var base: Dictionary = VIEWPORT_PROFILE.for_viewport(viewport_size)
	var profile: Dictionary = TOUCH_PROFILE.resolve(viewport_size, save)
	var dash_rect: Rect2 = profile["dash_rect"]
	assert_float(dash_rect.position.x).is_equal(float(base["safe_left"]) + float(base["action_inset"]))


func test_scale_preferences_expand_touch_geometry() -> void:
	var save: SaveDouble = auto_free(SaveDouble.new())
	save.set_preference("touch_joystick_scale", 1.25)
	save.set_preference("touch_dash_scale", 1.2)
	var viewport_size := Vector2(390.0, 844.0)
	var base: Dictionary = VIEWPORT_PROFILE.for_viewport(viewport_size)
	var profile: Dictionary = TOUCH_PROFILE.resolve(viewport_size, save)
	assert_float(float(profile["joystick_drag_radius"])).is_greater(float(base["joystick_drag_radius"]))
	assert_float((profile["dash_rect"] as Rect2).size.x).is_greater(float(base["dash_button_size"]))


func test_breach_doctrine_expands_dash_and_updates_label() -> void:
	var cls := ClassResource.new()
	cls.damage = 34.0
	cls.range_val = 16.0
	cls.fire_rate = 0.5
	var viewport_size := Vector2(390.0, 844.0)
	var profile: Dictionary = TOUCH_PROFILE.resolve(viewport_size, null, cls)
	assert_str(String(profile["doctrine_id"])).is_equal("breach")
	assert_str(String(profile["dash_label"])).is_equal("BREACH")
	assert_float(float(profile["dash_scale"])).is_greater(1.0)
