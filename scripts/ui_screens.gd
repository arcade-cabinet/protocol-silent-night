extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build_hud(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var hud_root := VBoxContainer.new()
	hud_root.name = "HudMargin"
	hud_root.set_anchors_preset(Control.PRESET_TOP_WIDE)
	hud_root.offset_left = float(layout["safe_left"]) + float(layout["edge_pad"])
	hud_root.offset_top = float(layout["safe_top"]) + float(layout["edge_pad"])
	hud_root.offset_right = -(float(layout["safe_right"]) + float(layout["edge_pad"]))
	hud_root.add_theme_constant_override("separation", 4 if is_mobile else 2)
	hud_root.visible = false
	root.add_child(hud_root)

	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 8 if is_mobile else 10)
	hud_root.add_child(top_bar)
	var hp_bar := ProgressBar.new()
	hp_bar.max_value = 100
	hp_bar.value = 100
	hp_bar.custom_minimum_size = Vector2(96, 18) if is_mobile else Vector2(120, 18)
	hp_bar.show_percentage = false
	hp_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	THEME.apply_to_progress_bar(hp_bar, Color("ff617e"))
	top_bar.add_child(hp_bar)

	var hp_label := Label.new()
	hp_label.text = "100/100"
	hp_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
	hp_label.add_theme_color_override("font_color", Color("ff617e"))
	top_bar.add_child(hp_label)
	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer)

	var wave_label := Label.new()
	wave_label.text = "LEVEL 1"
	wave_label.add_theme_font_size_override("font_size", 13 if is_mobile else 16)
	wave_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	top_bar.add_child(wave_label)
	var timer_label := Label.new()
	timer_label.text = "120"
	timer_label.add_theme_font_size_override("font_size", 18 if is_mobile else 22)
	timer_label.add_theme_color_override("font_color", THEME.NEON_WHITE)
	top_bar.add_child(timer_label)
	var spacer2 := Control.new()
	spacer2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(spacer2)

	var kills_label := Label.new()
	kills_label.text = "0"
	kills_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
	kills_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	top_bar.add_child(kills_label)
	var cookie_label := Label.new()
	cookie_label.text = "0 C"
	cookie_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
	cookie_label.add_theme_color_override("font_color", Color("ffd700"))
	top_bar.add_child(cookie_label)
	var level_label := Label.new()
	level_label.text = "LV 1"
	level_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
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
		"kills_label": kills_label, "cookie_label": cookie_label
	}


static func build_boss_panel(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var boss_panel := VBoxContainer.new()
	boss_panel.name = "BossPanel"
	boss_panel.set_anchors_preset(Control.PRESET_TOP_WIDE)
	boss_panel.offset_top = float(layout["safe_top"]) + float(layout["edge_pad"]) + 56.0
	boss_panel.offset_left = float(layout["safe_left"]) + float(layout["edge_pad"])
	boss_panel.offset_right = -(float(layout["safe_right"]) + float(layout["edge_pad"]))
	boss_panel.visible = false
	root.add_child(boss_panel)

	var boss_title := Label.new()
	boss_title.text = "// KRAMPUS-PRIME //"
	boss_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_title.add_theme_color_override("font_color", THEME.NEON_RED)
	boss_title.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
	boss_title.add_theme_constant_override("outline_size", 4)
	boss_title.add_theme_font_size_override("font_size", 20 if is_mobile else 24)
	boss_panel.add_child(boss_title)

	var boss_bar := ProgressBar.new()
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_bar.custom_minimum_size = Vector2(0, 20 if is_mobile else 22)
	boss_bar.show_percentage = false
	THEME.apply_to_progress_bar(boss_bar, THEME.NEON_RED)
	boss_panel.add_child(boss_bar)
	return {"boss_panel": boss_panel, "boss_bar": boss_bar}


static func build_level_screen(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var edge_pad := float(layout["edge_pad"])
	var level_screen := PanelContainer.new()
	level_screen.name = "LevelScreen"
	level_screen.visible = false
	level_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	level_screen.self_modulate = Color(0.03, 0.08, 0.06, 0.94)
	root.add_child(level_screen)

	var level_margin := MarginContainer.new()
	level_margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + edge_pad)))
	level_margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + edge_pad)))
	level_margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + edge_pad)))
	level_margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + edge_pad)))
	level_screen.add_child(level_margin)

	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	level_margin.add_child(scroll)

	var level_vbox := VBoxContainer.new()
	level_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	level_vbox.add_theme_constant_override("separation", 18)
	scroll.add_child(level_vbox)

	var level_title := Label.new()
	level_title.name = "LevelTitle"
	level_title.text = "Festive Upgrade"
	level_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_title.modulate = Color("7aff8a")
	level_title.add_theme_font_size_override("font_size", 30 if is_mobile else 38)
	level_vbox.add_child(level_title)

	var upgrade_box: BoxContainer = VBoxContainer.new() if is_mobile else HBoxContainer.new()
	upgrade_box.name = "UpgradeCards"
	upgrade_box.alignment = BoxContainer.ALIGNMENT_CENTER
	upgrade_box.add_theme_constant_override("separation", 18)
	level_vbox.add_child(upgrade_box)
	return {"level_screen": level_screen, "upgrade_box": upgrade_box}
