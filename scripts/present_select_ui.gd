extends RefCounted

## Builds present character select button cards.
## Extracted from ui_manager.gd for LOC compliance.

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build_present_buttons(classes_box: Container, present_defs: Dictionary,
		save_manager: Node, on_class_pressed: Callable) -> void:
	var best_wave := 0
	if save_manager != null:
		best_wave = int(save_manager.state.get("best_wave", 0))
	for present_id in present_defs.keys():
		var def: Dictionary = present_defs[present_id]
		var button := Button.new()
		var unlocked := is_present_unlocked(def, best_wave, save_manager)
		var label: String = "%s\n%s" % [def.get("name", present_id), def.get("tagline", "")]
		if not unlocked:
			label += "\n[%s]" % unlock_label(def.get("unlock", ""))
		button.text = label
		button.custom_minimum_size = Vector2(210, 130)
		button.clip_text = true
		button.disabled = not unlocked
		button.add_theme_font_size_override("font_size", 12)
		var accent_hex: String = def.get("bow_color", "#55f7ff")
		THEME.apply_to_button(button, Color(accent_hex))
		button.set_meta("class_id", present_id)
		button.pressed.connect(on_class_pressed.bind(button))
		classes_box.add_child(button)


static func is_present_unlocked(def: Dictionary, best_wave: int, save_manager: Node = null) -> bool:
	var req: String = def.get("unlock", "default")
	if req == "default":
		return true
	if req.begins_with("reach_wave_"):
		return best_wave >= int(req.trim_prefix("reach_wave_"))
	if req.begins_with("kill_"):
		if save_manager == null:
			return false
		var target := int(req.trim_prefix("kill_").trim_suffix("_enemies"))
		return save_manager.get_achievement("total_kills") >= target
	return false


static func unlock_label(req: String) -> String:
	if req.begins_with("reach_wave_"):
		return "Reach wave %s" % req.trim_prefix("reach_wave_")
	if req.begins_with("kill_"):
		return "Kill %s enemies" % req.trim_prefix("kill_").trim_suffix("_enemies")
	return req
