extends RefCounted

const UI_BUILDER := preload("res://scripts/ui_builder.gd")
const DIFFICULTY_SELECT := preload("res://scripts/difficulty_select.gd")

var hud_root: Container
var start_screen: PanelContainer
var level_screen: PanelContainer
var end_screen: PanelContainer
var message_overlay: Label
var achievement_overlay: Label
var boss_panel: VBoxContainer
var boss_bar: ProgressBar
var hp_bar: ProgressBar
var xp_bar: ProgressBar
var hp_label: Label
var level_label: Label
var timer_label: Label
var wave_label: Label
var kills_label: Label
var end_title: Label
var end_message: Label
var end_waves: Label
var dash_button: Button
var joystick_base: ColorRect
var joystick_knob: ColorRect
var start_classes_box: Container
var upgrade_box: HBoxContainer
var difficulty_panel: PanelContainer

var message_timer: float = 0.0
var achievement_timer: float = 0.0


func build_ui(parent: Node, on_menu_return: Callable, on_dash_down: Callable, on_dash_up: Callable, on_difficulty_selected: Callable = Callable()) -> CanvasLayer:
	var ui := CanvasLayer.new()
	ui.name = "UI"
	parent.add_child(ui)
	var root := Control.new()
	root.name = "Root"
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(root)

	var start := UI_BUILDER.build_start_screen(root)
	start_screen = start["screen"]
	start_classes_box = start["classes_box"]

	var hud := UI_BUILDER.build_hud(root)
	hud_root = hud["hud_root"]
	level_label = hud["level_label"]
	xp_bar = hud["xp_bar"]
	hp_bar = hud["hp_bar"]
	hp_label = hud["hp_label"]
	wave_label = hud["wave_label"]
	timer_label = hud["timer_label"]
	kills_label = hud["kills_label"]

	var boss := UI_BUILDER.build_boss_panel(root)
	boss_panel = boss["boss_panel"]
	boss_bar = boss["boss_bar"]

	var lvl := UI_BUILDER.build_level_screen(root)
	level_screen = lvl["level_screen"]
	upgrade_box = lvl["upgrade_box"]

	var end := UI_BUILDER.build_end_screen(root, on_menu_return)
	end_screen = end["end_screen"]
	end_title = end["end_title"]
	end_message = end["end_message"]
	end_waves = end["end_waves"]

	var overlays := UI_BUILDER.build_overlays_and_controls(root, on_dash_down, on_dash_up)
	message_overlay = overlays["message_overlay"]
	achievement_overlay = overlays["achievement_overlay"]
	dash_button = overlays["dash_button"]
	joystick_base = overlays["joystick_base"]
	joystick_knob = overlays["joystick_knob"]

	if on_difficulty_selected.is_valid():
		var diff := DIFFICULTY_SELECT.build(root, on_difficulty_selected)
		difficulty_panel = diff["panel"]

	return ui


func refresh_start_screen(class_defs: Dictionary, save_manager: Node, on_class_pressed: Callable, present_defs: Dictionary = {}) -> void:
	for child in start_classes_box.get_children():
		child.queue_free()
	if not present_defs.is_empty():
		_build_present_buttons(present_defs, save_manager, on_class_pressed)
	else:
		for class_id in ["elf", "santa", "bumble"]:
			var def: Dictionary = class_defs[class_id]
			var button := Button.new()
			button.text = "%s\n%s" % [def["name"], def["weapon_name"]]
			button.custom_minimum_size = Vector2(220, 180)
			button.disabled = save_manager != null and not save_manager.is_unlocked(class_id)
			if button.disabled:
				button.text += "\nLOCKED"
			button.set_meta("class_id", class_id)
			button.pressed.connect(on_class_pressed.bind(button))
			start_classes_box.add_child(button)


func _build_present_buttons(present_defs: Dictionary, save_manager: Node, on_class_pressed: Callable) -> void:
	var best_wave := 0
	if save_manager != null:
		best_wave = int(save_manager.state.get("best_wave", 0))
	var theme_script := load("res://scripts/holidaypunk_theme.gd")
	for present_id in present_defs.keys():
		var def: Dictionary = present_defs[present_id]
		var button := Button.new()
		var unlocked := _is_present_unlocked(def, best_wave, save_manager)
		var label: String = "%s\n%s" % [def.get("name", present_id), def.get("tagline", "")]
		if not unlocked:
			label += "\n[%s]" % _unlock_label(def.get("unlock", ""))
		button.text = label
		button.custom_minimum_size = Vector2(210, 130)
		button.clip_text = true
		button.disabled = not unlocked
		button.add_theme_font_size_override("font_size", 12)
		var accent_hex: String = def.get("bow_color", "#55f7ff")
		theme_script.apply_to_button(button, Color(accent_hex))
		button.set_meta("class_id", present_id)
		button.pressed.connect(on_class_pressed.bind(button))
		start_classes_box.add_child(button)


func _is_present_unlocked(def: Dictionary, best_wave: int, save_manager: Node = null) -> bool:
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


func _unlock_label(req: String) -> String:
	if req.begins_with("reach_wave_"):
		return "Reach wave %s" % req.trim_prefix("reach_wave_")
	if req.begins_with("kill_"):
		return "Kill %s enemies" % req.trim_prefix("kill_").trim_suffix("_enemies")
	return req


func show_message(text: String, duration: float, color: Color = Color.WHITE) -> void:
	message_overlay.text = text
	message_overlay.modulate = color
	message_timer = duration


func show_achievement(text: String, duration: float = 3.0) -> void:
	achievement_overlay.text = text
	achievement_timer = duration


func update_transient_overlays(delta: float) -> void:
	if message_timer > 0.0:
		message_timer -= delta
		message_overlay.visible = true
		message_overlay.modulate.a = clampf(message_timer / 0.3 if message_timer < 0.3 else 1.0, 0.0, 1.0)
	else:
		message_overlay.visible = false
	if achievement_timer > 0.0:
		achievement_timer -= delta
		achievement_overlay.visible = true
		achievement_overlay.modulate.a = clampf(achievement_timer / 0.3 if achievement_timer < 0.3 else 1.0, 0.0, 1.0)
	else:
		achievement_overlay.visible = false


func show_joystick(base_pos: Vector2, knob_pos: Vector2) -> void:
	joystick_base.visible = true
	joystick_knob.visible = true
	joystick_base.position = base_pos - joystick_base.custom_minimum_size * 0.5
	joystick_knob.position = knob_pos - joystick_knob.custom_minimum_size * 0.5


func hide_joystick() -> void:
	joystick_base.visible = false
	joystick_knob.visible = false


func update_hud(player_state: Dictionary, xp_needed: int, xp: int, level: int, kills: int) -> void:
	if hp_bar != null:
		hp_bar.max_value = player_state.get("max_hp", 100.0)
		hp_bar.value = player_state.get("hp", 100.0)
	if hp_label != null:
		hp_label.text = "%d / %d" % [int(round(player_state.get("hp", 100.0))), int(round(player_state.get("max_hp", 100.0)))]
	if xp_bar != null:
		xp_bar.max_value = xp_needed
		xp_bar.value = xp
	if level_label != null:
		level_label.text = "LEVEL %d" % level
	if kills_label != null:
		kills_label.text = str(kills)
