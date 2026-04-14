extends GdUnitTestSuite

const MOBILE_FEEDBACK := preload("res://scripts/mobile_feedback.gd")


class SaveDouble extends Node:
	var prefs: Dictionary = {}

	func get_preference(key: String, default_value = null):
		return prefs.get(key, default_value)

	func set_preference(key: String, value) -> void:
		prefs[key] = value


func test_mobile_feedback_enabled_by_default_on_landscape_phone_layout() -> void:
	assert_bool(MOBILE_FEEDBACK.enabled_for_viewport(Vector2(844.0, 390.0))).is_true()


func test_mobile_feedback_respects_saved_toggle() -> void:
	var save: SaveDouble = auto_free(SaveDouble.new())
	save.set_preference("mobile_haptics", false)
	assert_bool(MOBILE_FEEDBACK.enabled_for_viewport(Vector2(844.0, 390.0), save)).is_false()


func test_mobile_feedback_note_text_reports_disabled_state() -> void:
	var save: SaveDouble = auto_free(SaveDouble.new())
	save.set_preference("mobile_haptics", false)
	assert_str(MOBILE_FEEDBACK.note_text(Vector2(844.0, 390.0), save)).is_equal("Haptics OFF")
