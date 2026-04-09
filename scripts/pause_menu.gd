extends RefCounted

## Pause overlay: Resume / Restart / Settings / Quit. Sets the scene
## tree to paused via get_tree().paused and uses
## process_mode = PROCESS_MODE_ALWAYS on the panel so buttons still
## receive input while paused.


static func build(root: Control, on_resume: Callable, on_restart: Callable, on_settings: Callable, on_quit: Callable) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "PauseMenu"
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(320, 400)
	panel.position = Vector2(-160, -200)
	panel.process_mode = Node.PROCESS_MODE_ALWAYS
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.03, 0.04, 0.07, 0.97)
	style.border_color = Color("#ffd700")
	for side in ["border_width_left", "border_width_top", "border_width_right", "border_width_bottom"]:
		style.set(side, 2)
	for side in ["corner_radius_top_left", "corner_radius_top_right", "corner_radius_bottom_left", "corner_radius_bottom_right"]:
		style.set(side, 10)
	panel.add_theme_stylebox_override("panel", style)
	panel.visible = false
	root.add_child(panel)

	var margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		margin.add_theme_constant_override(side, 24)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 14)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "PAUSED"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 32)
	title.add_theme_color_override("font_color", Color("#ffd700"))
	vbox.add_child(title)

	_add_button(vbox, "RESUME", on_resume)
	_add_button(vbox, "RESTART", on_restart)
	_add_button(vbox, "SETTINGS", on_settings)
	_add_button(vbox, "QUIT", on_quit)

	return {"panel": panel}


static func _add_button(parent: Container, text: String, callback: Callable) -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = Vector2(240, 48)
	b.add_theme_font_size_override("font_size", 18)
	if callback.is_valid():
		b.pressed.connect(callback)
	parent.add_child(b)
	return b


static func show(state: Dictionary) -> void:
	if state.is_empty():
		return
	(state["panel"] as PanelContainer).visible = true


static func hide(state: Dictionary) -> void:
	if state.is_empty():
		return
	(state["panel"] as PanelContainer).visible = false
