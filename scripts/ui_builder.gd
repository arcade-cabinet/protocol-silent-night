extends RefCounted

const UI_SCREENS := preload("res://scripts/ui_screens.gd")


static func build_start_screen(root: Control) -> Dictionary:
	var start_screen := PanelContainer.new()
	start_screen.name = "StartScreen"
	start_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	start_screen.self_modulate = Color(0.02, 0.04, 0.06, 0.94)
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
	title.text = "Protocol: Silent Night"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.modulate = Color("edf7ff")
	start_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "10 waves to salvation"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 18)
	subtitle.modulate = Color("69d6ff")
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
	var hud_root := MarginContainer.new()
	hud_root.name = "HudMargin"
	hud_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud_root.add_theme_constant_override("margin_left", 18)
	hud_root.add_theme_constant_override("margin_top", 18)
	hud_root.add_theme_constant_override("margin_right", 18)
	hud_root.add_theme_constant_override("margin_bottom", 18)
	hud_root.visible = false
	root.add_child(hud_root)

	var hud_grid := GridContainer.new()
	hud_grid.columns = 4
	hud_grid.add_theme_constant_override("h_separation", 14)
	hud_grid.add_theme_constant_override("v_separation", 14)
	hud_root.add_child(hud_grid)

	var xp_panel := _make_hud_panel("LEVEL 1", "69d6ff")
	hud_grid.add_child(xp_panel["node"])
	var hp_panel := _make_hud_panel("INTEGRITY", "ff617e")
	hud_grid.add_child(hp_panel["node"])
	var timer_panel := _make_hud_panel("WAVE 1/10", "ffe07a")
	timer_panel["value"].add_theme_font_size_override("font_size", 28)
	hud_grid.add_child(timer_panel["node"])
	var kills_panel := _make_hud_panel("PURGED", "ffd85a")
	hud_grid.add_child(kills_panel["node"])

	return {
		"hud_root": hud_root,
		"level_label": xp_panel["label"], "xp_bar": xp_panel["bar"],
		"hp_bar": hp_panel["bar"], "hp_label": hp_panel["value"],
		"wave_label": timer_panel["label"], "timer_label": timer_panel["value"],
		"kills_label": kills_panel["value"]
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
	boss_title.text = "KRAMPUS-PRIME"
	boss_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_title.modulate = Color("ff4466")
	boss_title.add_theme_font_size_override("font_size", 22)
	boss_panel.add_child(boss_title)
	var boss_bar := ProgressBar.new()
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_bar.custom_minimum_size = Vector2(0, 22)
	boss_panel.add_child(boss_bar)
	return {"boss_panel": boss_panel, "boss_bar": boss_bar}


static func build_level_screen(root: Control) -> Dictionary:
	return UI_SCREENS.build_level_screen(root)


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	return UI_SCREENS.build_end_screen(root, on_menu_return)


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	return UI_SCREENS.build_overlays_and_controls(root, on_dash_down, on_dash_up)


static func _make_hud_panel(label_text: String, accent: String) -> Dictionary:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(220, 92)
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
	label.modulate = Color(accent)
	box.add_child(label)
	var value := Label.new()
	value.text = "0"
	value.add_theme_font_size_override("font_size", 22)
	value.modulate = Color("edf7ff")
	box.add_child(value)
	var bar := ProgressBar.new()
	bar.max_value = 100
	bar.value = 100
	bar.custom_minimum_size = Vector2(0, 14)
	box.add_child(bar)
	return {"node": panel, "label": label, "value": value, "bar": bar}
