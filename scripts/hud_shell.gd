extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var hud_root := VBoxContainer.new()
	hud_root.name = "HudMargin"
	hud_root.set_anchors_preset(Control.PRESET_TOP_WIDE)
	hud_root.offset_left = float(layout["safe_left"]) + float(layout["edge_pad"])
	hud_root.offset_top = float(layout["safe_top"]) + float(layout["edge_pad"])
	hud_root.offset_right = -(float(layout["safe_right"]) + float(layout["edge_pad"]))
	hud_root.add_theme_constant_override("separation", 6 if is_mobile else 4)
	hud_root.visible = false
	root.add_child(hud_root)
	var top_bar := HBoxContainer.new()
	top_bar.add_theme_constant_override("separation", 10 if is_mobile else 14)
	hud_root.add_child(top_bar)
	var xp_panel := _panel(top_bar, THEME.NEON_CYAN, 1, is_mobile)
	var level_label := _label("LEVEL 1", 13 if is_mobile else 15, THEME.NEON_CYAN)
	xp_panel.add_child(level_label)
	var xp_bar := ProgressBar.new()
	xp_bar.max_value = 5
	xp_bar.value = 0
	xp_bar.custom_minimum_size = Vector2(0, 10)
	xp_bar.show_percentage = false
	THEME.apply_to_progress_bar(xp_bar, Color("69d6ff"))
	xp_panel.add_child(xp_bar)
	var hp_panel := _panel(top_bar, THEME.NEON_RED, 1, is_mobile)
	hp_panel.add_child(_label("INTEGRITY", 11 if is_mobile else 12, THEME.NEON_RED))
	var hp_bar := ProgressBar.new()
	hp_bar.max_value = 100
	hp_bar.value = 100
	hp_bar.custom_minimum_size = Vector2(0, 14 if is_mobile else 16)
	hp_bar.show_percentage = false
	THEME.apply_to_progress_bar(hp_bar, Color("ff617e"))
	hp_panel.add_child(hp_bar)
	var hp_label := _label("100 / 100", 11 if is_mobile else 13, THEME.NEON_WHITE)
	hp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hp_panel.add_child(hp_label)
	var wave_panel := _panel(top_bar, THEME.NEON_WHITE, 1, is_mobile)
	var wave_label := _label("WAVE 1", 14 if is_mobile else 16, THEME.NEON_GOLD)
	wave_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	wave_panel.add_child(wave_label)
	var timer_label := _label("120", 22 if is_mobile else 26, THEME.NEON_WHITE)
	timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	wave_panel.add_child(timer_label)
	var kill_panel := _panel(top_bar, THEME.NEON_GOLD, 1, is_mobile)
	kill_panel.add_child(_label("PURGED", 11 if is_mobile else 12, THEME.NEON_GOLD))
	var kills_label := _label("0", 18 if is_mobile else 20, Color("ffd700"))
	kill_panel.add_child(kills_label)
	var cookie_label := _label("0 C", 11 if is_mobile else 13, Color("ffd700"))
	cookie_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	kill_panel.add_child(cookie_label)
	return {
		"hud_root": hud_root,
		"level_label": level_label, "xp_bar": xp_bar,
		"hp_bar": hp_bar, "hp_label": hp_label,
		"wave_label": wave_label, "timer_label": timer_label,
		"kills_label": kills_label, "cookie_label": cookie_label
	}


static func _panel(parent: BoxContainer, accent: Color, stretch_ratio: int, is_mobile: bool) -> VBoxContainer:
	var shell := PanelContainer.new()
	shell.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	shell.size_flags_stretch_ratio = stretch_ratio
	THEME.apply_to_panel(shell, accent)
	parent.add_child(shell)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10 if is_mobile else 12)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_right", 10 if is_mobile else 12)
	margin.add_theme_constant_override("margin_bottom", 8)
	shell.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	margin.add_child(vbox)
	return vbox


static func _label(text: String, font_size: int, color: Color) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	return label
