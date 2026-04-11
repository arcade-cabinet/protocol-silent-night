extends RefCounted

const UI_SCREENS := preload("res://scripts/ui_screens.gd")
const UI_OVERLAYS := preload("res://scripts/ui_overlays.gd")
const THEME := preload("res://scripts/holidaypunk_theme.gd")


const RADAR_CHART := preload("res://scripts/stat_radar_chart.gd")


static func build_title_screen(root: Control, on_play: Callable) -> Dictionary:
	var screen := PanelContainer.new()
	screen.name = "TitleScreen"
	screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	screen.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	root.add_child(screen)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 60)
	margin.add_theme_constant_override("margin_top", 100)
	margin.add_theme_constant_override("margin_right", 60)
	margin.add_theme_constant_override("margin_bottom", 100)
	screen.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 32)
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 64)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 8)
	vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// ENDLESS VIGIL //"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 24)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(subtitle)

	var play_btn := Button.new()
	play_btn.text = "PLAY"
	play_btn.custom_minimum_size = Vector2(240, 80)
	play_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	play_btn.add_theme_font_size_override("font_size", 28)
	THEME.apply_to_button(play_btn, THEME.NEON_CYAN)
	play_btn.pressed.connect(on_play)
	vbox.add_child(play_btn)

	return {"screen": screen}


static func build_start_screen(root: Control, on_back: Callable) -> Dictionary:
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


	var mid_row := HBoxContainer.new()
	mid_row.alignment = BoxContainer.ALIGNMENT_CENTER
	mid_row.add_theme_constant_override("separation", 40)
	start_vbox.add_child(mid_row)

	var scroll_container := ScrollContainer.new()
	scroll_container.custom_minimum_size = Vector2(800, 400) if DisplayServer.screen_get_size().x >= 800 else Vector2(300, 300)
	mid_row.add_child(scroll_container)

	var classes_box := GridContainer.new()
	classes_box.name = "ClassCards"
	var screen_w := DisplayServer.screen_get_size().x
	classes_box.columns = 4 if screen_w >= 800 else 2
	classes_box.add_theme_constant_override("h_separation", 14)
	classes_box.add_theme_constant_override("v_separation", 14)
	scroll_container.add_child(classes_box)

	var details_vbox := VBoxContainer.new()
	details_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	details_vbox.add_theme_constant_override("separation", 20)
	mid_row.add_child(details_vbox)

	var radar_canvas := RADAR_CHART.build(details_vbox, Vector2(240, 240))

	var select_btn := Button.new()
	select_btn.text = "SELECT"
	select_btn.name = "SelectButton"
	select_btn.custom_minimum_size = Vector2(240, 60)
	select_btn.add_theme_font_size_override("font_size", 24)
	select_btn.disabled = true
	THEME.apply_to_button(select_btn, THEME.NEON_CYAN)
	details_vbox.add_child(select_btn)


	var instruction := Label.new()
	instruction.text = "Desktop: WASD or arrows to move, Shift to dash. Mobile: drag anywhere and use the dash button."
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


static func build_hud(root: Control) -> Dictionary:
	return UI_SCREENS.build_hud(root)


static func build_boss_panel(root: Control) -> Dictionary:
	return UI_SCREENS.build_boss_panel(root)


static func build_level_screen(root: Control) -> Dictionary:
	return UI_SCREENS.build_level_screen(root)


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	return UI_OVERLAYS.build_end_screen(root, on_menu_return)


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	return UI_OVERLAYS.build_overlays_and_controls(root, on_dash_down, on_dash_up)


