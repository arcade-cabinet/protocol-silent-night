extends RefCounted

const HUD_SHELL := preload("res://scripts/hud_shell.gd")
const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build_hud(root: Control) -> Dictionary:
	return HUD_SHELL.build(root)


static func build_boss_panel(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var safe_size: Vector2 = layout["safe_rect"].size
	var width := clampf(safe_size.x * 0.52, 320.0, 620.0)
	var boss_panel := VBoxContainer.new()
	boss_panel.name = "BossPanel"
	boss_panel.anchor_left = 0.5
	boss_panel.anchor_right = 0.5
	boss_panel.anchor_top = 0.0
	boss_panel.anchor_bottom = 0.0
	boss_panel.offset_top = float(layout["safe_top"]) + float(layout["edge_pad"]) + 92.0
	boss_panel.offset_left = -width * 0.5
	boss_panel.offset_right = width * 0.5
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
	var boss_hint := Label.new()
	boss_hint.text = "TREE LOT RIOT"
	boss_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_hint.add_theme_color_override("font_color", THEME.NEON_GOLD)
	boss_hint.add_theme_font_size_override("font_size", 10 if is_mobile else 12)
	boss_panel.add_child(boss_hint)

	var boss_bar := ProgressBar.new()
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_bar.custom_minimum_size = Vector2(width, 18 if is_mobile else 22)
	boss_bar.show_percentage = false
	THEME.apply_to_progress_bar(boss_bar, THEME.NEON_RED)
	boss_panel.add_child(boss_bar)
	return {"boss_panel": boss_panel, "boss_bar": boss_bar}


static func build_level_screen(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var stacked_mobile := bool(layout["uses_stacked_mobile_ui"])
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

	var level_vbox := VBoxContainer.new()
	level_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	level_vbox.add_theme_constant_override("separation", 12 if stacked_mobile else 18)
	var decision_shell: PanelContainer = null
	if stacked_mobile:
		var mobile_frame := VBoxContainer.new()
		mobile_frame.size_flags_vertical = Control.SIZE_EXPAND_FILL
		level_margin.add_child(mobile_frame)
		var top_spacer := Control.new()
		top_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		mobile_frame.add_child(top_spacer)
		decision_shell = PanelContainer.new()
		decision_shell.custom_minimum_size = Vector2(maxf(260.0, float(layout["safe_rect"].size.x) - edge_pad * 2.0), 0.0)
		decision_shell.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		THEME.apply_to_panel(decision_shell, Color("7aff8a"))
		mobile_frame.add_child(decision_shell)
		var shell_margin := MarginContainer.new()
		shell_margin.add_theme_constant_override("margin_left", 4)
		shell_margin.add_theme_constant_override("margin_top", 6)
		shell_margin.add_theme_constant_override("margin_right", 4)
		shell_margin.add_theme_constant_override("margin_bottom", 6)
		decision_shell.add_child(shell_margin)
		shell_margin.add_child(level_vbox)
	else:
		var frame := VBoxContainer.new()
		frame.size_flags_vertical = Control.SIZE_EXPAND_FILL
		level_margin.add_child(frame)
		var top_spacer := Control.new()
		top_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		frame.add_child(top_spacer)
		frame.add_child(level_vbox)
		var bottom_spacer := Control.new()
		bottom_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		frame.add_child(bottom_spacer)

	var level_title := Label.new()
	level_title.name = "LevelTitle"
	level_title.text = "Festive Upgrade"
	level_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_title.modulate = Color("7aff8a")
	level_title.add_theme_font_size_override("font_size", 24 if is_mobile else 38)
	level_vbox.add_child(level_title)

	var level_hint := Label.new()
	level_hint.name = "LevelHint"
	level_hint.text = "Rip one upgrade off the rack and get back into the riot."
	level_hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_hint.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	level_hint.add_theme_font_size_override("font_size", 13 if is_mobile else 16)
	level_hint.add_theme_color_override("font_color", Color("dceefb"))
	level_vbox.add_child(level_hint)

	var upgrade_box: BoxContainer = VBoxContainer.new() if stacked_mobile else HBoxContainer.new()
	upgrade_box.name = "UpgradeCards"
	upgrade_box.alignment = BoxContainer.ALIGNMENT_CENTER
	upgrade_box.add_theme_constant_override("separation", 12 if stacked_mobile else 18)
	level_vbox.add_child(upgrade_box)
	return {"level_screen": level_screen, "upgrade_box": upgrade_box, "decision_shell": decision_shell, "level_hint": level_hint}
