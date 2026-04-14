extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build_title_manifesto(is_mobile: bool, stacked_mobile: bool = false) -> Control:
	return _build_panel([
		["LIVE GIFTS", "present punks only"],
		["AUTOFIRE RIOT", "build fast die loud"],
		["DEATH CLAUSE", "the lot cashes out"],
	], "TREE-LOT ANARCHY UNDER BAD LIGHT.", THEME.NEON_GOLD, is_mobile, stacked_mobile)


static func build_select_manifesto(is_mobile: bool, stacked_mobile: bool = false) -> Control:
	return _build_panel([
		["PICK 1 GIFT", "no dead weight"],
		["READ DOSSIER", "one glance only"],
		["LOCK RIOT", "deploy hot"],
	], "FAST CHOICES. LOUD GIFTS. NO TOOL-UI DRIFT.", THEME.NEON_RED, is_mobile, stacked_mobile)


static func _build_panel(items: Array, footer_text: String, accent: Color, is_mobile: bool, stacked_mobile: bool) -> Control:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(0.0 if stacked_mobile else (420.0 if is_mobile else 560.0), 0.0)
	panel.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(accent, Color(0.11, 0.05, 0.07, 0.92)))
	var margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		margin.add_theme_constant_override(side, 10 if is_mobile else 12)
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8 if is_mobile else 10)
	margin.add_child(vbox)
	var row: BoxContainer = VBoxContainer.new() if stacked_mobile else HBoxContainer.new()
	row.add_theme_constant_override("separation", 8 if is_mobile else 12)
	row.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	vbox.add_child(row)
	for item in items:
		row.add_child(_build_chip(String(item[0]), String(item[1]), accent, is_mobile))
	var footer := Label.new()
	footer.text = footer_text
	footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	footer.add_theme_font_size_override("font_size", 10 if is_mobile else 11)
	footer.add_theme_color_override("font_color", THEME.NEON_WHITE)
	vbox.add_child(footer)
	return panel


static func _build_chip(title: String, body: String, accent: Color, is_mobile: bool) -> Control:
	var chip := PanelContainer.new()
	chip.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	chip.add_theme_stylebox_override("panel", THEME.make_panel_style(accent, Color(0.07, 0.04, 0.05, 0.94)))
	var margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		margin.add_theme_constant_override(side, 8)
	chip.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 3)
	margin.add_child(box)
	var header := Label.new()
	header.text = title
	header.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	header.add_theme_font_size_override("font_size", 11 if is_mobile else 12)
	header.add_theme_color_override("font_color", accent)
	box.add_child(header)
	var text := Label.new()
	text.text = body
	text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	text.add_theme_font_size_override("font_size", 9 if is_mobile else 10)
	text.add_theme_color_override("font_color", THEME.NEON_WHITE)
	box.add_child(text)
	return chip
