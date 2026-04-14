extends RefCounted

## Builds present character select button cards.
## Extracted from ui_manager.gd for LOC compliance.
## Hover-driven preview updates with optional radar/detail sidecar state.

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const RADAR := preload("res://scripts/stat_radar_chart.gd")
const PREVIEW_VP := preload("res://scripts/present_preview_viewport.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

## Tracks the present ID currently previewed (for testability).
static var _current_preview_id: String = ""
static var _preview_viewport: SubViewport = null


static func init_preview(parent: Control) -> void:
	if _preview_viewport != null and is_instance_valid(_preview_viewport):
		return
	_preview_viewport = PREVIEW_VP.build(parent)


static func build_present_buttons(classes_box: Container, present_defs: Dictionary,
		save_manager: Node, on_class_pressed: Callable,
		radar_canvas: Control = null, audio_mgr: RefCounted = null,
		detail_state: Dictionary = {}) -> void:
	var best_wave := 0
	var layout := VIEWPORT_PROFILE.for_viewport(classes_box.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var stacked_mobile := bool(layout["uses_stacked_mobile_ui"])
	if save_manager != null:
		best_wave = int(save_manager.state.get("best_wave", 0))
	for present_id in present_defs.keys():
		var def: Dictionary = present_defs[present_id]
		var button := Button.new()
		var unlocked := is_present_unlocked(def, best_wave, save_manager)
		button.text = _button_label(def, unlocked)
		button.custom_minimum_size = Vector2(maxf(220.0, float(layout["safe_rect"].size.x) - float(layout["edge_pad"]) * 2.0), 108.0) if stacked_mobile else Vector2(240, 320)
		button.clip_text = true
		button.add_theme_font_size_override("font_size", 12 if is_mobile else 13)
		var accent_hex: String = def.get("bow_color", "#55f7ff") if unlocked else "#404040"
		THEME.apply_to_button(button, Color(accent_hex))
		button.set_meta("class_id", present_id)
		button.set_meta("unlocked", unlocked)
		var captured_id: String = present_id
		var captured_def: Dictionary = def
		var captured_canvas: Control = radar_canvas
		var captured_detail: Dictionary = detail_state
		button.pressed.connect(
			func() -> void:
				if audio_mgr != null: audio_mgr.play_menu_click()
				_update_preview(captured_id, captured_def, captured_canvas, captured_detail, unlocked)
				for child in classes_box.get_children():
					if child is Button:
						child.remove_theme_stylebox_override("normal")
						THEME.apply_to_button(child, Color(child.get_meta("accent_hex", "#55f7ff")))
				button.add_theme_stylebox_override("normal", THEME.make_panel_style(Color(accent_hex), Color(0.1, 0.1, 0.1, 0.9)))
				on_class_pressed.call(button)
		)
		button.set_meta("accent_hex", accent_hex)
		if audio_mgr != null:
			button.mouse_entered.connect(func() -> void: audio_mgr.play_menu_click())
		if radar_canvas != null:
			button.mouse_entered.connect(
				func() -> void:
					_update_preview(captured_id, captured_def, captured_canvas, captured_detail, unlocked)
			)
		classes_box.add_child(button)
	# Pre-select the last-used present so gamepad/keyboard nav starts there.
	var last_id: String = ""
	if save_manager != null:
		last_id = String(save_manager.get_preference("last_present", ""))
	
	var selected_node = null
	if not last_id.is_empty():
		for child in classes_box.get_children():
			if child is Button and String(child.get_meta("class_id", "")) == last_id and child.get_meta("unlocked", false):
				selected_node = child
				break
	if selected_node == null:
		for child in classes_box.get_children():
			if child is Button and child.get_meta("unlocked", false):
				selected_node = child
				break
	
	if selected_node != null:
		selected_node.grab_focus()
		var sid: String = selected_node.get_meta("class_id", "")
		_update_preview(sid, present_defs.get(sid, {}), radar_canvas, detail_state, bool(selected_node.get_meta("unlocked", false)))


static func is_present_unlocked(def: Dictionary, best_wave: int, save_manager: Node = null) -> bool:
	var id: String = def.get("id", "")
	if save_manager != null and save_manager.is_unlocked(id):
		return true
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
		radar_canvas: Control = null, detail_state: Dictionary = {},
		unlocked: bool = true) -> void:
	_current_preview_id = present_id
	if radar_canvas != null:
		RADAR.update(radar_canvas, def)
	_update_details(detail_state, def, unlocked)
	if _preview_viewport == null or not is_instance_valid(_preview_viewport):
		return
	PREVIEW_VP.update_present(_preview_viewport, def)


static func _update_details(detail_state: Dictionary, def: Dictionary, unlocked: bool) -> void:
	if detail_state.is_empty():
		return
	var name_label: Label = detail_state.get("name_label")
	var tagline_label: Label = detail_state.get("tagline_label")
	var stats_label: Label = detail_state.get("stats_label")
	var unlock_label_node: Label = detail_state.get("unlock_label")
	if name_label != null:
		name_label.text = String(def.get("name", "Unknown Present")).to_upper()
	if tagline_label != null:
		tagline_label.text = "%s · %s · %s" % [_pretty_token(String(def.get("expression", "manic"))), _pretty_token(String(def.get("topper", "none"))), _pretty_token(String(def.get("accessory", "none")))]
	if stats_label != null:
		stats_label.text = _stat_summary(def)
	if unlock_label_node != null:
		unlock_label_node.text = "READY FOR DEPLOYMENT" if unlocked else "LOCKED · %s" % unlock_label(String(def.get("unlock", ""))).to_upper()


static func _button_label(def: Dictionary, unlocked: bool) -> String:
	var status := String(def.get("tagline", "Ready for deployment"))
	if not unlocked:
		status = "LOCKED · %s" % unlock_label(String(def.get("unlock", ""))).to_upper()
	return "%s\n%s\n%s" % [String(def.get("name", "Unknown Present")).to_upper(), _compact_stats(def), status]


static func _compact_stats(def: Dictionary) -> String:
	return "DMG %d  RATE %.1f  RNG %d" % [int(round(float(def.get("damage", 0.0)))), 1.0 / maxf(float(def.get("fire_rate", 1.0)), 0.01), int(round(float(def.get("range", 0.0))))]


static func _stat_summary(def: Dictionary) -> String:
	return "DMG %d  RATE %.1f/S  RANGE %d  PIERCE %d" % [int(round(float(def.get("damage", 0.0)))), 1.0 / maxf(float(def.get("fire_rate", 1.0)), 0.01), int(round(float(def.get("range", 0.0)))), int(def.get("pierce", 1))]


static func _pretty_token(value: String) -> String:
	if value.is_empty() or value == "none":
		return "No Flair"
	return value.replace("_", " ").capitalize()
