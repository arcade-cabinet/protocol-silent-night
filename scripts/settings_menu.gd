extends RefCounted

## Settings overlay panel: Master/Music/SFX/Ambient/UI sliders,
## screen shake toggle, reduced motion toggle. Persists via
## save_manager.set_preference.

const BUS_KEYS: Array = ["Master", "Music", "SFX", "Ambient", "UI"]


static func build(root: Control, audio_mgr: RefCounted, save_manager: Node, on_close: Callable) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "SettingsMenu"
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = Vector2(460, 500)
	panel.position = Vector2(-230, -250)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.05, 0.08, 0.96)
	style.border_color = Color("#69d6ff")
	style.border_width_left = 2; style.border_width_top = 2
	style.border_width_right = 2; style.border_width_bottom = 2
	style.corner_radius_top_left = 10
	style.corner_radius_top_right = 10
	style.corner_radius_bottom_left = 10
	style.corner_radius_bottom_right = 10
	panel.add_theme_stylebox_override("panel", style)
	panel.visible = false
	root.add_child(panel)

	var margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		margin.add_theme_constant_override(side, 24)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 12)
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "SETTINGS"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color("#69d6ff"))
	vbox.add_child(title)

	var sliders: Dictionary = {}
	for bus_name in BUS_KEYS:
		sliders[bus_name] = _add_slider_row(vbox, bus_name, audio_mgr, save_manager)

	var shake_cb := _add_toggle(vbox, "Screen Shake", save_manager, "screen_shake", true)
	var motion_cb := _add_toggle(vbox, "Reduced Motion", save_manager, "reduced_motion", false)

	var close := Button.new()
	close.text = "CLOSE"
	close.custom_minimum_size = Vector2(180, 48)
	close.pressed.connect(func() -> void:
		panel.visible = false
		if on_close.is_valid(): on_close.call()
	)
	vbox.add_child(close)

	return {"panel": panel, "sliders": sliders, "shake_cb": shake_cb, "motion_cb": motion_cb}


static func _add_slider_row(parent: Container, bus_name: String, audio_mgr: RefCounted, sm: Node) -> HSlider:
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = "%s  " % bus_name
	label.custom_minimum_size = Vector2(100, 0)
	row.add_child(label)
	var slider := HSlider.new()
	slider.min_value = -60.0
	slider.max_value = 6.0
	slider.step = 1.0
	slider.custom_minimum_size = Vector2(260, 28)
	var key: String = "bus_volume_%s" % bus_name.to_lower()
	var initial: float = 0.0
	if sm != null and sm.has_method("get_preference"):
		initial = float(sm.get_preference(key, 0.0))
	slider.value = initial
	slider.value_changed.connect(func(v: float) -> void:
		if audio_mgr != null and audio_mgr.has_method("set_bus_volume"):
			audio_mgr.set_bus_volume(bus_name, v)
		if sm != null and sm.has_method("set_preference"):
			sm.set_preference(key, v)
	)
	row.add_child(slider)
	parent.add_child(row)
	return slider


static func _add_toggle(parent: Container, text: String, sm: Node, key: String, default: bool) -> CheckBox:
	var cb := CheckBox.new()
	cb.text = text
	if sm != null and sm.has_method("get_preference"):
		cb.button_pressed = bool(sm.get_preference(key, default))
	cb.toggled.connect(func(pressed: bool) -> void:
		if sm != null and sm.has_method("set_preference"):
			sm.set_preference(key, pressed)
	)
	parent.add_child(cb)
	return cb


static func show(state: Dictionary) -> void:
	if state.is_empty():
		return
	(state["panel"] as PanelContainer).visible = true
