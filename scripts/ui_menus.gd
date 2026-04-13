extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const RADAR_CHART := preload("res://scripts/stat_radar_chart.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build_title_screen(root: Control, on_play: Callable, on_progress: Callable) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var edge_pad := float(layout["edge_pad"])
	var screen := PanelContainer.new()
	screen.name = "TitleScreen"
	screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	screen.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	root.add_child(screen)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + edge_pad)))
	margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + edge_pad * 2.0)))
	margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + edge_pad)))
	margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + edge_pad * 2.0)))
	screen.add_child(margin)

	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	margin.add_child(scroll)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * 1.4)))
	scroll.add_child(vbox)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.add_theme_font_size_override("font_size", 32 if is_mobile else 64)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 8)
	vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// ENDLESS VIGIL //"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 16 if is_mobile else 24)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(subtitle)

	var play_btn := Button.new()
	play_btn.text = "DEPLOY"
	play_btn.custom_minimum_size = Vector2(200, 60) if is_mobile else Vector2(280, 70)
	play_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	play_btn.add_theme_font_size_override("font_size", 20 if is_mobile else 28)
	THEME.apply_to_button(play_btn, THEME.NEON_CYAN)
	play_btn.pressed.connect(on_play)
	vbox.add_child(play_btn)

	var prog_btn := Button.new()
	prog_btn.text = "SERVICE RECORD"
	prog_btn.custom_minimum_size = Vector2(200, 50) if is_mobile else Vector2(280, 60)
	prog_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	prog_btn.add_theme_font_size_override("font_size", 16 if is_mobile else 22)
	THEME.apply_to_button(prog_btn, THEME.NEON_GOLD)
	prog_btn.pressed.connect(on_progress)
	vbox.add_child(prog_btn)
	return {"screen": screen}


static func build_start_screen(root: Control, on_back: Callable) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var edge_pad := float(layout["edge_pad"])
	var start_screen := PanelContainer.new()
	start_screen.name = "StartScreen"
	start_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	start_screen.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	root.add_child(start_screen)

	var start_margin := MarginContainer.new()
	start_margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + edge_pad)))
	start_margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + edge_pad)))
	start_margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + edge_pad)))
	start_margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + edge_pad)))
	start_screen.add_child(start_margin)

	var outer_scroll := ScrollContainer.new()
	outer_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	outer_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	start_margin.add_child(outer_scroll)

	var start_vbox := VBoxContainer.new()
	start_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	start_vbox.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * 1.3)))
	outer_scroll.add_child(start_vbox)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.add_theme_font_size_override("font_size", 24 if is_mobile else 48)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 6)
	start_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// ENDLESS VIGIL //"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 14 if is_mobile else 20)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	start_vbox.add_child(subtitle)

	var mid_row: BoxContainer = VBoxContainer.new() if is_mobile else HBoxContainer.new()
	mid_row.alignment = BoxContainer.ALIGNMENT_CENTER
	mid_row.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * (1.0 if is_mobile else 1.8))))
	start_vbox.add_child(mid_row)

	var class_scroll := ScrollContainer.new()
	class_scroll.custom_minimum_size = Vector2(float(layout["safe_rect"].size.x) - edge_pad * 2.0, 280.0) if is_mobile else Vector2(minf(800.0, float(layout["safe_rect"].size.x) * 0.56), 400.0)
	class_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	class_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	mid_row.add_child(class_scroll)

	var classes_box := HBoxContainer.new()
	classes_box.name = "ClassCards"
	classes_box.add_theme_constant_override("separation", 20)
	class_scroll.add_child(classes_box)

	var details_vbox := VBoxContainer.new()
	details_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	details_vbox.add_theme_constant_override("separation", 20)
	mid_row.add_child(details_vbox)

	var radar_canvas := RADAR_CHART.build(details_vbox, Vector2(220, 220) if is_mobile else Vector2(240, 240))
	var select_btn := Button.new()
	select_btn.text = "SELECT"
	select_btn.name = "SelectButton"
	select_btn.custom_minimum_size = Vector2(220, 56) if is_mobile else Vector2(240, 60)
	select_btn.add_theme_font_size_override("font_size", 22 if is_mobile else 24)
	select_btn.disabled = true
	THEME.apply_to_button(select_btn, THEME.NEON_CYAN)
	details_vbox.add_child(select_btn)

	var instruction := Label.new()
	instruction.text = "Mobile: drag with your left thumb, tap DASH with your right. Desktop: WASD + Shift." if is_mobile else "Desktop: WASD or arrows to move, Shift to dash. Mobile: drag anywhere and use the dash button."
	instruction.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instruction.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	instruction.modulate = Color("dceefb")
	start_vbox.add_child(instruction)

	var back_btn := Button.new()
	back_btn.text = "< BACK"
	back_btn.custom_minimum_size = Vector2(160, 50)
	back_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	back_btn.add_theme_font_size_override("font_size", 18)
	THEME.apply_to_button(back_btn, THEME.NEON_CYAN)
	back_btn.pressed.connect(on_back)
	start_vbox.add_child(back_btn)
	return {"screen": start_screen, "classes_box": classes_box, "radar_canvas": radar_canvas, "select_btn": select_btn}
