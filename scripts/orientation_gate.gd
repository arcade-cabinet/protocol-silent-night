extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build(root: Control) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "OrientationGate"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.visible = false
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	panel.z_index = 220
	THEME.apply_to_panel(panel, THEME.NEON_RED)
	root.add_child(panel)
	var margin := MarginContainer.new()
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 12)
	margin.add_child(vbox)
	var title := Label.new()
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 32)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	vbox.add_child(title)
	var body := Label.new()
	body.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body.add_theme_font_size_override("font_size", 18)
	body.add_theme_color_override("font_color", Color("dceefb"))
	body.custom_minimum_size = Vector2(520.0, 0.0)
	vbox.add_child(body)
	return {"panel": panel, "margin": margin, "title": title, "body": body}


static func refresh(state: Dictionary, main: Node) -> bool:
	if state.is_empty() or main == null or main.get_viewport() == null:
		return false
	var layout := VIEWPORT_PROFILE.for_viewport(main.get_viewport().get_visible_rect().size)
	var blocked := bool(layout["requires_landscape_rotation"])
	var panel: PanelContainer = state["panel"]
	panel.visible = blocked
	if not blocked:
		return false
	var edge_pad := int(round(float(layout["edge_pad"])))
	var margin: MarginContainer = state["margin"]
	margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]))) + edge_pad)
	margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]))) + edge_pad)
	margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]))) + edge_pad)
	margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]))) + edge_pad)
	var active_run := String(main.get("state")) in ["playing", "wave_clear", "level_up"]
	(state["title"] as Label).text = "ROTATE TO HOLD THE BOARD" if active_run else "LANDSCAPE REQUIRED"
	(state["body"] as Label).text = "Compact phone portrait is below the combat-read bar. Rotate to landscape. Large portrait stays reserved for tablet and unfolded-foldable widths."
	return true
