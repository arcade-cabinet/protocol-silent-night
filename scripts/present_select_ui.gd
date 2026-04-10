extends RefCounted

## Builds present character select button cards.
## Extracted from ui_manager.gd for LOC compliance.
## Hover-driven radar chart updates via stat_radar_chart.gd API.

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const RADAR := preload("res://scripts/stat_radar_chart.gd")
const PREVIEW_VP := preload("res://scripts/present_preview_viewport.gd")

## Tracks the present ID currently previewed (for testability).
static var _current_preview_id: String = ""
static var _preview_viewport: SubViewport = null


static func init_preview(parent: Control) -> void:
	if _preview_viewport != null:
		return
	_preview_viewport = PREVIEW_VP.build(parent)


static func build_present_buttons(classes_box: Container, present_defs: Dictionary,
		save_manager: Node, on_class_pressed: Callable,
		radar_canvas: Control = null) -> void:
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
		if radar_canvas != null:
			var captured_id: String = present_id
			var captured_def: Dictionary = def
			var captured_canvas: Control = radar_canvas
			button.mouse_entered.connect(
				func() -> void:
					_update_preview(captured_id, captured_def, captured_canvas)
			)
		classes_box.add_child(button)
	# Pre-select the last-used present so gamepad/keyboard nav starts there.
	var last_id: String = ""
	if save_manager != null:
		last_id = String(save_manager.get_preference("last_present", ""))
	if not last_id.is_empty():
		for child in classes_box.get_children():
			if child is Button and String(child.get_meta("class_id", "")) == last_id and not child.disabled:
				child.grab_focus()
				if radar_canvas != null:
					_update_preview(last_id, present_defs.get(last_id, {}), radar_canvas)
				break


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


## Updates the radar chart, 3D viewport preview, and records the hovered present ID.
static func _update_preview(present_id: String, def: Dictionary,
		radar_canvas: Control) -> void:
	_current_preview_id = present_id
	RADAR.update(radar_canvas, def)
	PREVIEW_VP.update_present(_preview_viewport, def)
