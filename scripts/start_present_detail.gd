extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build(parent: BoxContainer, layout: Dictionary) -> Dictionary:
	var is_mobile := bool(layout["is_mobile"])
	var stacked_mobile := bool(layout["uses_stacked_mobile_ui"])
	var wide_mobile := is_mobile and not stacked_mobile
	var safe_size: Vector2 = layout["safe_rect"].size
	var shell := PanelContainer.new()
	shell.name = "PresentDetailShell"
	shell.custom_minimum_size = Vector2(maxf(260.0, safe_size.x - 48.0), 0.0) if stacked_mobile else Vector2(clampf(safe_size.x * (0.26 if wide_mobile else 0.28), 220.0 if wide_mobile else 260.0, 300.0 if wide_mobile else 340.0), 0.0)
	shell.size_flags_horizontal = Control.SIZE_EXPAND_FILL if stacked_mobile else Control.SIZE_SHRINK_BEGIN
	shell.size_flags_vertical = Control.SIZE_EXPAND_FILL
	THEME.apply_to_panel(shell, THEME.NEON_GOLD)
	parent.add_child(shell)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10 if is_mobile else 14)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_right", 10 if is_mobile else 14)
	margin.add_theme_constant_override("margin_bottom", 10)
	shell.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8 if is_mobile else 10)
	margin.add_child(vbox)

	var cue := Label.new()
	cue.text = "RIOT DOSSIER"
	cue.add_theme_font_size_override("font_size", 11 if is_mobile else 12)
	cue.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(cue)

	var preview_host := PanelContainer.new()
	preview_host.name = "PresentPreviewHost"
	preview_host.custom_minimum_size = Vector2(0.0, 104.0 if wide_mobile else (148.0 if is_mobile else 196.0))
	preview_host.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	THEME.apply_to_panel(preview_host, THEME.NEON_CYAN)
	vbox.add_child(preview_host)

	var name_label := Label.new()
	name_label.name = "PresentDetailName"
	name_label.text = "SELECT A PRESENT"
	name_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_label.add_theme_font_size_override("font_size", 18 if is_mobile else 24)
	name_label.add_theme_color_override("font_color", THEME.NEON_WHITE)
	vbox.add_child(name_label)

	var tagline_label := Label.new()
	tagline_label.name = "PresentDetailTagline"
	tagline_label.text = "Pick the meanest package in the rack and read its trouble fast."
	tagline_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	tagline_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
	tagline_label.add_theme_color_override("font_color", Color("dceefb"))
	vbox.add_child(tagline_label)

	var stats_label := Label.new()
	stats_label.name = "PresentDetailStats"
	stats_label.text = "DMG --  RATE --/S  RANGE --  VOLLEY --  PIERCE --"
	stats_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	stats_label.add_theme_font_size_override("font_size", 12 if is_mobile else 14)
	stats_label.add_theme_color_override("font_color", THEME.NEON_CYAN)
	vbox.add_child(stats_label)

	var unlock_label := Label.new()
	unlock_label.name = "PresentDetailUnlock"
	unlock_label.text = "Rack hot. Pick once. Lock the gift. Let the lot sort the rest."
	unlock_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	unlock_label.add_theme_font_size_override("font_size", 11 if is_mobile else 13)
	unlock_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(unlock_label)

	return {
		"shell": shell,
		"preview_host": preview_host,
		"name_label": name_label,
		"tagline_label": tagline_label,
		"stats_label": stats_label,
		"unlock_label": unlock_label,
	}
