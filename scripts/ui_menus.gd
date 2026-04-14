extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const SUSPENDED_RUN := preload("res://scripts/suspended_run.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")
const START_DETAIL := preload("res://scripts/start_present_detail.gd")


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

	var frame := VBoxContainer.new()
	frame.size_flags_vertical = Control.SIZE_EXPAND_FILL
	margin.add_child(frame)
	var top_spacer := Control.new()
	top_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	frame.add_child(top_spacer)
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * 1.4)))
	frame.add_child(vbox)
	var bottom_spacer := Control.new()
	bottom_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	frame.add_child(bottom_spacer)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.add_theme_font_size_override("font_size", 38 if is_mobile else 64)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 8)
	vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// TREE LOT RIOT //\nAUTOFIRE CHAOS • BUILD FAST • DIE LOUD"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 15 if is_mobile else 21)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(subtitle)

	var play_btn := Button.new()
	play_btn.name = "StartRunButton"
	play_btn.text = "RIP THE WRAP"
	play_btn.custom_minimum_size = Vector2(200, 60) if is_mobile else Vector2(280, 70)
	play_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	play_btn.add_theme_font_size_override("font_size", 20 if is_mobile else 28)
	THEME.apply_to_button(play_btn, THEME.NEON_CYAN)
	play_btn.pressed.connect(on_play)
	vbox.add_child(play_btn)

	var prog_btn := Button.new()
	prog_btn.name = "ProgressButton"
	prog_btn.text = "SCAR TISSUE"
	prog_btn.custom_minimum_size = Vector2(200, 50) if is_mobile else Vector2(280, 60)
	prog_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	prog_btn.add_theme_font_size_override("font_size", 16 if is_mobile else 22)
	THEME.apply_to_button(prog_btn, THEME.NEON_GOLD)
	prog_btn.pressed.connect(on_progress)
	vbox.add_child(prog_btn)
	return {"screen": screen}


static func build_start_screen(root: Control, on_back: Callable, on_resume: Callable = Callable()) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var stacked_mobile := bool(layout["uses_stacked_mobile_ui"])
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

	var start_vbox := VBoxContainer.new()
	start_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	start_vbox.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * 1.3)))
	start_vbox.size_flags_vertical = Control.SIZE_EXPAND_FILL
	var outer_scroll: ScrollContainer = null
	if stacked_mobile:
		start_margin.add_child(start_vbox)
	else:
		outer_scroll = ScrollContainer.new()
		outer_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		outer_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
		start_margin.add_child(outer_scroll)
		outer_scroll.add_child(start_vbox)

	var title := Label.new()
	title.text = "PROTOCOL: SILENT NIGHT"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.add_theme_font_size_override("font_size", 20 if is_mobile else 48)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	title.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
	title.add_theme_constant_override("outline_size", 6)
	start_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "// PICK THE MEANEST GIFT //"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 11 if is_mobile else 20)
	subtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
	start_vbox.add_child(subtitle)

	var mid_row: BoxContainer = VBoxContainer.new() if stacked_mobile else HBoxContainer.new()
	mid_row.alignment = BoxContainer.ALIGNMENT_CENTER
	mid_row.add_theme_constant_override("separation", int(round(float(layout["section_gap"]) * (1.0 if stacked_mobile else 1.8))))
	mid_row.size_flags_vertical = Control.SIZE_EXPAND_FILL if stacked_mobile else Control.SIZE_SHRINK_CENTER
	start_vbox.add_child(mid_row)

	var details_vbox := VBoxContainer.new()
	details_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	details_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	details_vbox.add_theme_constant_override("separation", 12 if stacked_mobile else 20)
	mid_row.add_child(details_vbox)
	var detail_state := START_DETAIL.build(details_vbox, layout)
	var select_btn := Button.new()
	select_btn.text = "LOCK THE GIFT"
	select_btn.name = "SelectButton"
	select_btn.custom_minimum_size = Vector2(float(layout["safe_rect"].size.x) - edge_pad * 2.0, 56) if stacked_mobile else Vector2(240, 60)
	select_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL if stacked_mobile else Control.SIZE_SHRINK_CENTER
	select_btn.add_theme_font_size_override("font_size", 22 if is_mobile else 24)
	select_btn.disabled = true
	THEME.apply_to_button(select_btn, THEME.NEON_CYAN)
	details_vbox.add_child(select_btn)
	var resume_btn := Button.new()
	resume_btn.name = "ResumeRunButton"
	resume_btn.visible = false
	resume_btn.custom_minimum_size = select_btn.custom_minimum_size
	resume_btn.size_flags_horizontal = select_btn.size_flags_horizontal
	resume_btn.add_theme_font_size_override("font_size", 16 if is_mobile else 18)
	THEME.apply_to_button(resume_btn, THEME.NEON_GOLD)
	if on_resume.is_valid():
		resume_btn.pressed.connect(on_resume)
	details_vbox.add_child(resume_btn)

	var class_scroll := ScrollContainer.new()
	class_scroll.custom_minimum_size = Vector2(float(layout["safe_rect"].size.x) - edge_pad * 2.0, 240.0) if stacked_mobile else Vector2(minf(800.0, float(layout["safe_rect"].size.x) * 0.56), 400.0)
	class_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED if stacked_mobile else ScrollContainer.SCROLL_MODE_AUTO
	class_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO if stacked_mobile else ScrollContainer.SCROLL_MODE_DISABLED
	class_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL if stacked_mobile else Control.SIZE_SHRINK_CENTER
	mid_row.add_child(class_scroll)

	var classes_box: Container = VBoxContainer.new() if stacked_mobile else HBoxContainer.new()
	classes_box.name = "ClassCards"
	classes_box.add_theme_constant_override("separation", 12 if stacked_mobile else 20)
	class_scroll.add_child(classes_box)

	var instruction := Label.new()
	instruction.text = "Phone: landscape is primary. Left thumb drives. Right thumb starts trouble." if is_mobile else "Desktop: WASD or arrows to move, Shift to dash. Mobile: drag anywhere and hit the dash button when the lot turns ugly."
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
	return {"screen": start_screen, "classes_box": classes_box, "radar_canvas": null, "detail_state": detail_state, "select_btn": select_btn, "resume_btn": resume_btn, "class_scroll": class_scroll, "uses_outer_scroll": outer_scroll != null}


static func refresh_resume_button(screen: PanelContainer, save_manager: Node, present_defs: Dictionary = {}) -> void:
	if screen == null:
		return
	var resume_btn: Button = screen.find_child("ResumeRunButton", true, false)
	if resume_btn == null:
		return
	var summary: Dictionary = SUSPENDED_RUN.summary(save_manager, present_defs)
	resume_btn.visible = not summary.is_empty()
	if not summary.is_empty():
		resume_btn.text = "RESUME VIGIL · WAVE %d · %s" % [int(summary.get("resume_level", 1)), String(summary.get("present_name", "UNKNOWN")).to_upper()]
