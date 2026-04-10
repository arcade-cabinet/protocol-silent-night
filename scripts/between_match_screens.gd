extends RefCounted

## Builds the between-match screens: Results and Scroll Opening.
## Market screen lives in market_screen.gd.

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build_results_screen(root: Control, on_continue: Callable) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "ResultsScreen"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
	panel.visible = false
	root.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 80)
	margin.add_theme_constant_override("margin_top", 60)
	margin.add_theme_constant_override("margin_right", 80)
	margin.add_theme_constant_override("margin_bottom", 60)
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 14)
	margin.add_child(vbox)
	var title := Label.new()
	title.text = "PACKAGE SURVIVED"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(title)
	var stats_box := VBoxContainer.new()
	stats_box.alignment = BoxContainer.ALIGNMENT_CENTER
	stats_box.add_theme_constant_override("separation", 10)
	vbox.add_child(stats_box)
	var level_label := Label.new()
	var kills_label := Label.new()
	var cookies_label := Label.new()
	var scrolls_label := Label.new()
	for lbl in [level_label, kills_label, cookies_label, scrolls_label]:
		lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		lbl.add_theme_font_size_override("font_size", 22)
		lbl.add_theme_color_override("font_color", THEME.NEON_WHITE)
		stats_box.add_child(lbl)
	var continue_btn := Button.new()
	continue_btn.text = "CONTINUE →"
	continue_btn.custom_minimum_size = Vector2(260, 60)
	continue_btn.add_theme_font_size_override("font_size", 18)
	THEME.apply_to_button(continue_btn, THEME.NEON_CYAN)
	continue_btn.pressed.connect(on_continue)
	vbox.add_child(continue_btn)
	return {
		"panel": panel,
		"level_label": level_label, "kills_label": kills_label,
		"cookies_label": cookies_label, "scrolls_label": scrolls_label,
	}


static func update_results(state: Dictionary, data: Dictionary) -> void:
	state["level_label"].text = "Depth Survived: %d" % int(data.get("level", 0))
	state["kills_label"].text = "Enemies Purged: %d" % int(data.get("kills", 0))
	state["cookies_label"].text = "Cookies Earned: %d" % int(data.get("cookies", 0))
	state["scrolls_label"].text = "Scrolls Cracked: %d" % int(data.get("scrolls", 0))


static func build_scroll_screen(root: Control, on_continue: Callable) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "ScrollScreen"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_GOLD, Color(0.05, 0.03, 0.02, 0.94)))
	panel.visible = false
	root.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 80)
	margin.add_theme_constant_override("margin_top", 60)
	margin.add_theme_constant_override("margin_right", 80)
	margin.add_theme_constant_override("margin_bottom", 60)
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 16)
	margin.add_child(vbox)
	var title := Label.new()
	title.text = "OPEN YOUR SCROLLS"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(title)
	var scroll_grid := GridContainer.new()
	scroll_grid.columns = 5
	scroll_grid.add_theme_constant_override("h_separation", 12)
	scroll_grid.add_theme_constant_override("v_separation", 12)
	vbox.add_child(scroll_grid)
	var continue_btn := Button.new()
	continue_btn.text = "TO THE MARKET →"
	continue_btn.custom_minimum_size = Vector2(260, 60)
	continue_btn.add_theme_font_size_override("font_size", 18)
	THEME.apply_to_button(continue_btn, THEME.NEON_GOLD)
	continue_btn.pressed.connect(on_continue)
	vbox.add_child(continue_btn)
	return {"panel": panel, "grid": scroll_grid}


static func populate_scroll_grid(state: Dictionary, outcomes: Array) -> void:
	var grid: GridContainer = state["grid"]
	for child in grid.get_children():
		child.queue_free()
	if outcomes.is_empty():
		var empty := Label.new()
		empty.text = "// EMPTY MAILBAG //"
		empty.add_theme_font_size_override("font_size", 20)
		empty.add_theme_color_override("font_color", THEME.NEON_WHITE)
		grid.add_child(empty)
		return
	var display_count: int = mini(outcomes.size(), 20)
	for i in range(display_count):
		grid.add_child(_build_scroll_card(outcomes[i]))
	if outcomes.size() > display_count:
		var overflow := Label.new()
		overflow.text = "+%d still wrapped" % (outcomes.size() - display_count)
		overflow.add_theme_font_size_override("font_size", 16)
		overflow.add_theme_color_override("font_color", THEME.NEON_GOLD)
		grid.add_child(overflow)


static func _build_scroll_card(outcome: Dictionary) -> Control:
	var is_nice: bool = String(outcome.get("type", "nice")) == "nice"
	var accent := Color("#ffd700") if is_nice else Color("#ff2244")
	var bg := Color(0.1, 0.08, 0.04, 0.9) if is_nice else Color(0.12, 0.04, 0.04, 0.9)
	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(140, 120)
	card.add_theme_stylebox_override("panel", THEME.make_panel_style(accent, bg))
	var card_margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		card_margin.add_theme_constant_override(side, 10)
	card.add_child(card_margin)
	var card_vbox := VBoxContainer.new()
	card_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	card_vbox.add_theme_constant_override("separation", 6)
	card_margin.add_child(card_vbox)
	var header := Label.new()
	header.text = "NICE" if is_nice else "NAUGHTY"
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	header.add_theme_font_size_override("font_size", 16)
	header.add_theme_color_override("font_color", accent)
	card_vbox.add_child(header)
	var body := Label.new()
	body.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.custom_minimum_size = Vector2(120, 0)
	body.add_theme_font_size_override("font_size", 14)
	body.add_theme_color_override("font_color", THEME.NEON_WHITE)
	if is_nice:
		body.text = "+%d C" % int(outcome.get("cookies", 0))
	else:
		body.text = "COAL:\n%s" % String(outcome.get("effect_id", "")).to_upper()
	card_vbox.add_child(body)
	return card

