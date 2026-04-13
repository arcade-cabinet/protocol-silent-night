extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

static func build_progress_screen(root: Control, on_back: Callable) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var panel := PanelContainer.new()
	panel.name = "ProgressScreen"
	panel.visible = false
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	root.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + float(layout["edge_pad"]))))
	margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + float(layout["edge_pad"]))))
	margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + float(layout["edge_pad"]))))
	margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + float(layout["edge_pad"]))))
	panel.add_child(margin)

	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	margin.add_child(scroll)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 20)
	scroll.add_child(vbox)

	var title := Label.new()
	title.text = "SERVICE RECORD"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28 if is_mobile else 48)
	title.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(title)

	var grid := GridContainer.new()
	grid.columns = 1 if is_mobile else 2
	grid.add_theme_constant_override("h_separation", 40)
	grid.add_theme_constant_override("v_separation", 20)
	grid.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	vbox.add_child(grid)

	var back_btn := Button.new()
	back_btn.text = "< BACK"
	back_btn.custom_minimum_size = Vector2(160, 50)
	back_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	back_btn.add_theme_font_size_override("font_size", 18)
	THEME.apply_to_button(back_btn, THEME.NEON_CYAN)
	back_btn.pressed.connect(on_back)
	vbox.add_child(back_btn)

	return {"panel": panel, "grid": grid}

static func populate_progress(grid: GridContainer, data: Dictionary) -> void:
	for child in grid.get_children():
		child.queue_free()
	
	var stats = [
		{"label": "TOTAL RUNS", "val": str(data.get("total_runs", 0))},
		{"label": "CAMPAIGN CLEARS", "val": str(data.get("campaign_clears", 0))},
		{"label": "TOTAL KILLS", "val": str(data.get("total_kills", 0))},
		{"label": "BEST WAVE", "val": str(data.get("best_wave", 0))},
		{"label": "BEST LEVEL", "val": str(data.get("best_level", 0))},
		{"label": "OPERATORS UNLOCKED", "val": "%d / 50" % int(data.get("unlocked_count", 0))}
	]
	
	for s in stats:
		var hbox := HBoxContainer.new()
		hbox.custom_minimum_size = Vector2(280, 40)
		var lbl := Label.new()
		lbl.text = s["label"] + ":"
		lbl.add_theme_color_override("font_color", THEME.NEON_CYAN)
		lbl.add_theme_font_size_override("font_size", 18)
		lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hbox.add_child(lbl)
		
		var val := Label.new()
		val.text = s["val"]
		val.add_theme_color_override("font_color", THEME.NEON_WHITE)
		val.add_theme_font_size_override("font_size", 20)
		val.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		hbox.add_child(val)
		grid.add_child(hbox)
