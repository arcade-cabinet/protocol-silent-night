extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func apply(button: Button, card: Dictionary, accent: Color, is_mobile: bool) -> void:
	button.text = ""
	button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	button.clip_contents = true

	var frame := MarginContainer.new()
	frame.name = "CardFrame"
	frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	frame.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	frame.add_theme_constant_override("margin_left", 10)
	frame.add_theme_constant_override("margin_top", 10)
	frame.add_theme_constant_override("margin_right", 10)
	frame.add_theme_constant_override("margin_bottom", 10)
	button.add_child(frame)

	var row := HBoxContainer.new()
	row.mouse_filter = Control.MOUSE_FILTER_IGNORE
	row.size_flags_vertical = Control.SIZE_EXPAND_FILL
	row.add_theme_constant_override("separation", 10)
	frame.add_child(row)

	var stripe := ColorRect.new()
	stripe.mouse_filter = Control.MOUSE_FILTER_IGNORE
	stripe.color = accent if bool(card.get("unlocked", true)) else accent.darkened(0.45)
	stripe.custom_minimum_size = Vector2(5, 0)
	stripe.size_flags_vertical = Control.SIZE_EXPAND_FILL
	row.add_child(stripe)

	var body := VBoxContainer.new()
	body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	body.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	body.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_theme_constant_override("separation", 6 if is_mobile else 8)
	row.add_child(body)

	body.add_child(_label(String(card.get("kicker", "")), 10 if is_mobile else 11, THEME.NEON_GOLD))
	body.add_child(_label(String(card.get("name", "")), 16 if is_mobile else 18, THEME.NEON_WHITE, true))
	body.add_child(_label(String(card.get("role", "")), 11 if is_mobile else 12, accent))
	body.add_child(_label(String(card.get("stats", "")), 11 if is_mobile else 12, Color("dceefb"), true))

	var spacer := Control.new()
	spacer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	body.add_child(spacer)

	body.add_child(_label(String(card.get("flavor", "")), 11 if is_mobile else 12, Color("c6d1dd"), true))
	body.add_child(_label(String(card.get("footer", "")), 10 if is_mobile else 11, accent if bool(card.get("unlocked", true)) else THEME.NEON_RED, true))


static func _label(text: String, size: int, color: Color, wrap: bool = false) -> Label:
	var label := Label.new()
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	label.text = text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART if wrap else TextServer.AUTOWRAP_OFF
	label.add_theme_font_size_override("font_size", size)
	label.add_theme_color_override("font_color", color)
	return label
