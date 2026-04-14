extends GdUnitTestSuite

const TOUCH_DOCTRINE := preload("res://scripts/touch_doctrine.gd")


func test_long_range_single_shot_present_resolves_to_sightline() -> void:
	var cls := ClassResource.new()
	cls.range_val = 24.0
	cls.pierce = 3
	cls.shot_count = 1
	var doctrine: Dictionary = TOUCH_DOCTRINE.resolve(cls)
	assert_str(String(doctrine["id"])).is_equal("sightline")
	assert_str(String(doctrine["dash_label"])).is_equal("STEP")


func test_short_range_high_damage_present_resolves_to_breach() -> void:
	var cls := ClassResource.new()
	cls.damage = 34.0
	cls.range_val = 16.0
	cls.fire_rate = 0.5
	var doctrine: Dictionary = TOUCH_DOCTRINE.resolve(cls)
	assert_str(String(doctrine["id"])).is_equal("breach")
	assert_str(String(doctrine["lock_prefix"])).contains("BREACH")
