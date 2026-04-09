extends RefCounted

const UI_SCREENS := preload("res://scripts/ui_screens.gd")
const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build_start_screen(root: Control) -> Dictionary:
	var start_screen := PanelContainer.new()
	start_screen.name = "StartScreen"
	start_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	start_screen.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	root.add_child(start_screen)

	var start_margin := MarginContainer.new()
	start_margin.add_theme_constant_override("margin_left", 60)
	start_margin.add_theme_constant_override("margin_top", 48)
	start_margin.add_theme_constant_override("margin_right", 60)
	start_margin.add_theme_constant_override("margin_bottom", 48)
	start_screen.add_child(start_margin)

	var start_vbox := VBoxContainer.new()
	start_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	start_vbox.add_theme_constant_override("separation", 22)
	start_margin.add_child(start_vbox)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 48)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 6)
	start_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// ENDLESS VIGIL //"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 20)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	start_vbox.add_child(subtitle)

	var classes_box := GridContainer.new()
	classes_box.name = "ClassCards"
	classes_box.columns = 5
	classes_box.add_theme_constant_override("h_separation", 14)
	classes_box.add_theme_constant_override("v_separation", 14)
	start_vbox.add_child(classes_box)

	var instruction := Label.new()
	instruction.text = "Desktop: WASD or arrows to move, Shift to dash. Mobile: drag anywhere and use the dash button."
	instruction.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instruction.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	instruction.custom_minimum_size = Vector2(740, 0)
	instruction.modulate = Color("dceefb")
	start_vbox.add_child(instruction)

	return {"screen": start_screen, "classes_box": classes_box}


static func build_hud(root: Control) -> Dictionary:
	var hud_root := VBoxContainer.new()
	hud_root.name = "HudMargin"
	hud_root.set_anchors_preset(Control.PRESET_TOP_WIDE)
	hud_root.add_theme_constant_override("separation", 2)
	hud_root.visible = false
	root.add_child(hud_root)
	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 8)
	hud_root.add_child(top_bar)
	var hp_bar := ProgressBar.new()
	hp_bar.max_value = 100
	hp_bar.value = 100
	hp_bar.custom_minimum_size = Vector2(300, 18)
	hp_bar.show_percentage = false
	hp_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	THEME.apply_to_progress_bar(hp_bar, Color("ff617e"))
	top_bar.add_child(hp_bar)
	var hp_label := Label.new()
	hp_label.text = "100/100"
	hp_label.add_theme_font_size_override("font_size", 14)
	hp_label.add_theme_color_override("font_color", Color("ff617e"))
	top_bar.add_child(hp_label)
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer)
	var wave_label := Label.new()
	wave_label.text = "LEVEL 1"
	wave_label.add_theme_font_size_override("font_size", 16)
	wave_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	top_bar.add_child(wave_label)
	var timer_label := Label.new()
	timer_label.text = "120"
	timer_label.add_theme_font_size_override("font_size", 22)
	timer_label.add_theme_color_override("font_color", THEME.NEON_WHITE)
	top_bar.add_child(timer_label)
	var spacer2 := Control.new()
	spacer2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer2)
	var kills_label := Label.new()
	kills_label.text = "0"
	kills_label.add_theme_font_size_override("font_size", 14)
	kills_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	top_bar.add_child(kills_label)
	var level_label := Label.new()
	level_label.text = "LV 1"
	level_label.add_theme_font_size_override("font_size", 14)
	level_label.add_theme_color_override("font_color", THEME.NEON_CYAN)
	top_bar.add_child(level_label)
	var xp_bar := ProgressBar.new()
	xp_bar.max_value = 5
	xp_bar.value = 0
	xp_bar.custom_minimum_size = Vector2(0, 8)
	xp_bar.show_percentage = false
	THEME.apply_to_progress_bar(xp_bar, Color("69d6ff"))
	hud_root.add_child(xp_bar)
	return {
		"hud_root": hud_root,
		"level_label": level_label, "xp_bar": xp_bar,
		"hp_bar": hp_bar, "hp_label": hp_label,
		"wave_label": wave_label, "timer_label": timer_label,
		"kills_label": kills_label
	}


static func build_boss_panel(root: Control) -> Dictionary:
	var boss_panel := VBoxContainer.new()
	boss_panel.name = "BossPanel"
	boss_panel.set_anchors_preset(Control.PRESET_TOP_WIDE)
	boss_panel.offset_top = 110
	boss_panel.offset_left = 260
	boss_panel.offset_right = -260
	boss_panel.visible = false
	root.add_child(boss_panel)
	var boss_title := Label.new()
	boss_title.text = "// KRAMPUS-PRIME //"
	boss_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_title.add_theme_color_override("font_color", THEME.NEON_RED)
	boss_title.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
	boss_title.add_theme_constant_override("outline_size", 4)
	boss_title.add_theme_font_size_override("font_size", 24)
	boss_panel.add_child(boss_title)
	var boss_bar := ProgressBar.new()
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_bar.custom_minimum_size = Vector2(0, 22)
	boss_bar.show_percentage = false
	THEME.apply_to_progress_bar(boss_bar, THEME.NEON_RED)
	boss_panel.add_child(boss_bar)
	return {"boss_panel": boss_panel, "boss_bar": boss_bar}


static func build_level_screen(root: Control) -> Dictionary:
	return UI_SCREENS.build_level_screen(root)


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	return UI_SCREENS.build_end_screen(root, on_menu_return)


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	return UI_SCREENS.build_overlays_and_controls(root, on_dash_down, on_dash_up)


static func _make_hud_panel(label_text: String, accent: String) -> Dictionary:
	var accent_color := Color(accent)
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(220, 92)
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(accent_color))
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 6)
	margin.add_child(box)
	var label := Label.new()
	label.text = label_text
	label.add_theme_color_override("font_color", accent_color)
	label.add_theme_font_size_override("font_size", 13)
	box.add_child(label)
	var value := Label.new()
	value.text = "0"
	value.add_theme_font_size_override("font_size", 24)
	value.add_theme_color_override("font_color", THEME.NEON_WHITE)
	value.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.8))
	value.add_theme_constant_override("outline_size", 3)
	box.add_child(value)
	var bar := ProgressBar.new()
	bar.max_value = 100
	bar.value = 100
	bar.custom_minimum_size = Vector2(0, 14)
	bar.show_percentage = false
	THEME.apply_to_progress_bar(bar, accent_color)
	box.add_child(bar)
	return {"node": panel, "label": label, "value": value, "bar": bar}
