extends RefCounted

const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

const HANDEDNESS_ORDER: Array = ["right", "left"]
const HANDEDNESS_LABELS: Dictionary = {
	"right": "Move left / Dash right",
	"left": "Move right / Dash left",
}


static func handedness_ids() -> Array:
	return HANDEDNESS_ORDER.duplicate()


static func handedness_label(handedness: String) -> String:
	return String(HANDEDNESS_LABELS.get(_normalize_handedness(handedness), HANDEDNESS_LABELS["right"]))


static func resolve(viewport_size: Vector2, save_manager: Node = null) -> Dictionary:
	var base: Dictionary = VIEWPORT_PROFILE.for_viewport(viewport_size)
	var safe_rect: Rect2 = base["safe_rect"]
	var inset := float(base["action_inset"])
	var handedness := _normalize_handedness(_pref_string(save_manager, "touch_handedness", "right"))
	var joystick_scale := clampf(_pref_float(save_manager, "touch_joystick_scale", 1.0), 0.8, 1.35)
	var dash_scale := clampf(_pref_float(save_manager, "touch_dash_scale", 1.0), 0.8, 1.35)
	var dash_size := float(base["dash_button_size"]) * dash_scale
	var dash_x := safe_rect.position.x + inset if handedness == "left" else safe_rect.end.x - inset - dash_size
	return {
		"handedness": handedness,
		"dash_rect": Rect2(Vector2(dash_x, safe_rect.end.y - inset - dash_size), Vector2.ONE * dash_size),
		"dash_button_size": dash_size,
		"joystick_base_size": float(base["joystick_base_size"]) * joystick_scale,
		"joystick_knob_size": float(base["joystick_knob_size"]) * joystick_scale,
		"joystick_drag_radius": float(base["joystick_drag_radius"]) * joystick_scale,
		"joystick_visual_radius": float(base["joystick_visual_radius"]) * joystick_scale,
		"joystick_scale": joystick_scale,
		"dash_scale": dash_scale,
	}


static func apply_to_main(main: Node, save_manager: Node = null) -> Dictionary:
	if main == null or main.ui_mgr == null or main.get_viewport() == null:
		return {}
	var profile: Dictionary = resolve(main.get_viewport().get_visible_rect().size, save_manager)
	var ui: RefCounted = main.ui_mgr
	var dash_rect: Rect2 = profile["dash_rect"]
	if ui.dash_button != null:
		ui.dash_button.set_anchors_preset(Control.PRESET_TOP_LEFT)
		ui.dash_button.custom_minimum_size = dash_rect.size
		ui.dash_button.offset_left = dash_rect.position.x
		ui.dash_button.offset_top = dash_rect.position.y
		ui.dash_button.offset_right = dash_rect.end.x
		ui.dash_button.offset_bottom = dash_rect.end.y
	if ui.joystick_base != null:
		ui.joystick_base.custom_minimum_size = Vector2.ONE * float(profile["joystick_base_size"])
	if ui.joystick_knob != null:
		ui.joystick_knob.custom_minimum_size = Vector2.ONE * float(profile["joystick_knob_size"])
	return profile


static func _pref_float(save_manager: Node, key: String, default_value: float) -> float:
	if save_manager != null and save_manager.has_method("get_preference"):
		return float(save_manager.get_preference(key, default_value))
	return default_value


static func _pref_string(save_manager: Node, key: String, default_value: String) -> String:
	if save_manager != null and save_manager.has_method("get_preference"):
		return String(save_manager.get_preference(key, default_value))
	return default_value


static func _normalize_handedness(value: String) -> String:
	var normalized := value.strip_edges().to_lower()
	return normalized if HANDEDNESS_LABELS.has(normalized) else "right"
