extends RefCounted
class_name DifficultySelect

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

const TIERS := [
	{"name": "Priceless", "mult": 1, "rewraps": 5, "color": "#55f7ff", "desc": "Gentle introduction"},
	{"name": "Great", "mult": 2, "rewraps": 4, "color": "#55ff88", "desc": "A proper challenge"},
	{"name": "Good", "mult": 3, "rewraps": 3, "color": "#ffd700", "desc": "This will hurt"},
	{"name": "Naughty", "mult": 4, "rewraps": 2, "color": "#ff8844", "desc": "Suffering is earned"},
	{"name": "Nice", "mult": 5, "rewraps": 1, "color": "#ff4466", "desc": "One chance left"},
	{"name": "Unforgivable", "mult": 6, "rewraps": 0, "color": "#ff0033", "desc": "No mercy. No rewraps."},
]


static func build(root: Control, on_select: Callable, current_tier: int = 1, current_perma: bool = false) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var stacked_mobile := bool(layout["uses_stacked_mobile_ui"])
	var edge_pad := float(layout["edge_pad"])
	var panel := PanelContainer.new()
	panel.name = "DifficultySelect"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	THEME.apply_to_panel(panel, THEME.NEON_CYAN)
	panel.visible = false
	root.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + edge_pad)))
	margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + edge_pad)))
	margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + edge_pad)))
	margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + edge_pad)))
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 12 if stacked_mobile else 16)
	var decision_shell: PanelContainer = null
	var uses_outer_scroll := not stacked_mobile
	if stacked_mobile:
		var mobile_frame := VBoxContainer.new()
		mobile_frame.size_flags_vertical = Control.SIZE_EXPAND_FILL
		margin.add_child(mobile_frame)
		var top_spacer := Control.new()
		top_spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		mobile_frame.add_child(top_spacer)
		decision_shell = PanelContainer.new()
		decision_shell.custom_minimum_size = Vector2(maxf(260.0, float(layout["safe_rect"].size.x) - edge_pad * 2.0), 0.0)
		decision_shell.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		THEME.apply_to_panel(decision_shell, THEME.NEON_CYAN)
		mobile_frame.add_child(decision_shell)
		var shell_margin := MarginContainer.new()
		shell_margin.add_theme_constant_override("margin_left", 4)
		shell_margin.add_theme_constant_override("margin_top", 6)
		shell_margin.add_theme_constant_override("margin_right", 4)
		shell_margin.add_theme_constant_override("margin_bottom", 6)
		decision_shell.add_child(shell_margin)
		shell_margin.add_child(vbox)
	else:
		var scroll := ScrollContainer.new()
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
		scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
		margin.add_child(scroll)
		scroll.add_child(vbox)

	var title := Label.new()
	title.name = "DifficultyTitle"
	title.text = "SET BOARD PRESSURE"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	title.add_theme_font_size_override("font_size", 22 if is_mobile else 36)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	vbox.add_child(title)

	var present_label := Label.new()
	present_label.name = "SelectedPresentLabel"
	present_label.text = "DEPLOYING SELECTED PRESENT"
	present_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	present_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	present_label.add_theme_font_size_override("font_size", 13 if is_mobile else 16)
	present_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(present_label)

	var hint_label := Label.new()
	hint_label.name = "DifficultyHintLabel"
	hint_label.text = "Pick run pressure, rewrap budget, and special stakes."
	hint_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	hint_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	hint_label.add_theme_font_size_override("font_size", 12 if is_mobile else 15)
	hint_label.add_theme_color_override("font_color", Color("dceefb"))
	vbox.add_child(hint_label)

	var perma_check := CheckButton.new()
	perma_check.text = "PERMADEATH"
	perma_check.button_pressed = current_perma
	perma_check.add_theme_font_size_override("font_size", 13 if is_mobile else 18)
	perma_check.add_theme_color_override("font_color", THEME.NEON_RED)
	var endless_check := CheckButton.new()
	endless_check.text = "ENDLESS MODE"
	endless_check.add_theme_font_size_override("font_size", 13 if is_mobile else 18)
	endless_check.add_theme_color_override("font_color", THEME.NEON_GOLD)

	var toggles: BoxContainer = VBoxContainer.new() if stacked_mobile else HBoxContainer.new()
	toggles.alignment = BoxContainer.ALIGNMENT_CENTER
	toggles.add_theme_constant_override("separation", 10 if stacked_mobile else 40)
	toggles.add_child(perma_check)
	toggles.add_child(endless_check)
	vbox.add_child(toggles)

	var tier_container: Control
	if stacked_mobile:
		var rail := VBoxContainer.new()
		rail.name = "TierRail"
		rail.alignment = BoxContainer.ALIGNMENT_CENTER
		rail.add_theme_constant_override("separation", 8)
		tier_container = rail
	else:
		var grid := GridContainer.new()
		grid.columns = 3
		grid.add_theme_constant_override("h_separation", 16)
		grid.add_theme_constant_override("v_separation", 12)
		tier_container = grid
	vbox.add_child(tier_container)

	var tier_buttons: Array = []
	for i in range(TIERS.size()):
		var tier: Dictionary = TIERS[i]
		var tier_index := i + 1
		var btn := Button.new()
		btn.text = _tier_label(tier, stacked_mobile)
		btn.custom_minimum_size = Vector2(maxf(240.0, float(layout["safe_rect"].size.x) - edge_pad * 2.0), 64.0) if stacked_mobile else Vector2(280, 120)
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL if stacked_mobile else Control.SIZE_SHRINK_CENTER
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT if stacked_mobile else HORIZONTAL_ALIGNMENT_CENTER
		btn.add_theme_font_size_override("font_size", 13 if is_mobile else 14)
		THEME.apply_to_button(btn, Color(tier["color"]))
		if tier_index == current_tier:
			btn.add_theme_stylebox_override("normal", THEME.make_hover_style(Color(tier["color"])))
		btn.pressed.connect(func() -> void:
			on_select.call(tier_index, true if tier_index == 6 else perma_check.button_pressed, endless_check.button_pressed)
		)
		tier_container.add_child(btn)
		tier_buttons.append(btn)

	var back_btn := Button.new()
	back_btn.text = "< BACK"
	back_btn.custom_minimum_size = Vector2(160, 50)
	back_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	back_btn.add_theme_font_size_override("font_size", 18)
	THEME.apply_to_button(back_btn, THEME.NEON_CYAN)
	back_btn.pressed.connect(func() -> void:
		panel.visible = false
		for child in panel.get_parent().get_children():
			if child.name == "StartScreen":
				child.visible = true
	)
	vbox.add_child(back_btn)
	var state := {
		"panel": panel,
		"perma_check": perma_check,
		"endless_check": endless_check,
		"present_label": present_label,
		"hint_label": hint_label,
		"decision_shell": decision_shell,
		"tier_container": tier_container,
		"tier_buttons": tier_buttons,
		"back_btn": back_btn,
		"uses_outer_scroll": uses_outer_scroll,
	}
	panel.set_meta("difficulty_state", state)
	return state


static func prepare(state: Dictionary, present_def: Dictionary) -> void:
	if state.is_empty():
		return
	var name := String(present_def.get("name", "Selected Present")).to_upper()
	var tagline := String(present_def.get("tagline", "Field package ready for deployment."))
	var accent := Color(String(present_def.get("bow_color", "#55f7ff")))
	var present_label: Label = state.get("present_label")
	var hint_label: Label = state.get("hint_label")
	if present_label != null:
		present_label.text = "DEPLOYING %s" % name
		present_label.add_theme_color_override("font_color", accent)
	if hint_label != null:
		hint_label.text = "%s // Pick the pressure tier for this run." % tagline
	if state.get("decision_shell") != null:
		THEME.apply_to_panel(state["decision_shell"], accent)


static func _tier_label(tier: Dictionary, stacked_mobile: bool) -> String:
	if not stacked_mobile:
		return "%s\n%dx // %d rewraps\n%s" % [tier["name"], tier["mult"], tier["rewraps"], tier["desc"]]
	var rewrap_label := "%d REWRAP%s" % [int(tier["rewraps"]), "" if int(tier["rewraps"]) == 1 else "S"]
	return "%s // %dx PRESSURE\n%s // %s" % [tier["name"], int(tier["mult"]), rewrap_label, String(tier["desc"]).to_upper()]
