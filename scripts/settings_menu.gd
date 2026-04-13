extends RefCounted

## Settings overlay panel: TabContainer with three tabs.
## Audio: Master/Music/SFX/Ambient/UI volume sliders.
## Display: screen shake toggle, reduced motion, minimap zoom.
## Gameplay: difficulty preference, permadeath default.

const BUS_KEYS: Array = ["Master", "Music", "SFX", "Ambient", "UI"]
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")
const RUNTIME_QUALITY := preload("res://scripts/runtime_quality.gd")


static func build(root: Control, audio_mgr: RefCounted, save_manager: Node, on_close: Callable) -> Dictionary:
	var size := VIEWPORT_PROFILE.center_panel_size(root.get_viewport_rect().size, Vector2(520.0, 540.0), Vector2(320.0, 360.0))
	var panel := PanelContainer.new()
	panel.name = "SettingsMenu"
	panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	panel.custom_minimum_size = size
	panel.position = -size * 0.5
	panel.process_mode = Node.PROCESS_MODE_ALWAYS
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.05, 0.08, 0.96)
	style.border_color = Color("#69d6ff")
	for s in ["border_width_left", "border_width_top", "border_width_right", "border_width_bottom"]: style.set(s, 2)
	for c in ["corner_radius_top_left", "corner_radius_top_right", "corner_radius_bottom_left", "corner_radius_bottom_right"]: style.set(c, 10)
	panel.add_theme_stylebox_override("panel", style)
	panel.visible = false
	root.add_child(panel)
	var margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]: margin.add_theme_constant_override(side, 18)
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	margin.add_child(vbox)
	var title := Label.new()
	title.text = "SETTINGS"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 26)
	title.add_theme_color_override("font_color", Color("#69d6ff"))
	vbox.add_child(title)
	var tabs := TabContainer.new()
	tabs.custom_minimum_size = size - Vector2(40.0, 150.0)
	vbox.add_child(tabs)
	var sliders: Dictionary = _build_audio_tab(tabs, audio_mgr, save_manager)
	var display_state: Dictionary = _build_display_tab(tabs, root, save_manager)
	_build_gameplay_tab(tabs, save_manager)
	var close := Button.new()
	close.text = "CLOSE"
	close.custom_minimum_size = Vector2(180, 44)
	close.pressed.connect(func() -> void:
		panel.visible = false
		if on_close.is_valid(): on_close.call()
	)
	vbox.add_child(close)
	return {"panel": panel, "sliders": sliders, "shake_cb": display_state["shake_cb"], "motion_cb": display_state["motion_cb"], "minimap_slider": display_state["minimap_slider"], "quality_option": display_state["quality_option"]}


static func _build_audio_tab(tabs: TabContainer, audio_mgr: RefCounted, sm: Node) -> Dictionary:
	var page := VBoxContainer.new()
	page.name = "Audio"
	page.add_theme_constant_override("separation", 10)
	tabs.add_child(page)
	var sliders: Dictionary = {}
	for bus_name in BUS_KEYS:
		sliders[bus_name] = _add_slider_row(page, bus_name, audio_mgr, sm)
	return sliders


static func _build_display_tab(tabs: TabContainer, root: Control, sm: Node) -> Dictionary:
	var page := VBoxContainer.new()
	page.name = "Display"
	page.add_theme_constant_override("separation", 12)
	tabs.add_child(page)
	var quality := _add_quality_row(page, root, sm)
	var apply_live := func() -> void: _apply_live_display_settings(root, sm)
	var shake := _add_toggle(page, "Screen Shake", sm, "screen_shake", true, apply_live)
	var motion := _add_toggle(page, "Reduced Motion", sm, "reduced_motion", false, apply_live)
	var minimap_row := HBoxContainer.new()
	var label := Label.new()
	label.text = "Minimap zoom"
	label.custom_minimum_size = Vector2(140, 0)
	minimap_row.add_child(label)
	var slider := HSlider.new()
	slider.min_value = 8.0; slider.max_value = 60.0; slider.step = 1.0
	slider.custom_minimum_size = Vector2(280, 28)
	var initial: float = 22.0
	if sm != null and sm.has_method("get_preference"):
		initial = float(sm.get_preference("minimap_zoom", 22.0))
	slider.value = initial
	slider.value_changed.connect(func(v: float) -> void:
		if sm != null and sm.has_method("set_preference"):
			sm.set_preference("minimap_zoom", v)
		_apply_live_display_settings(root, sm)
	)
	minimap_row.add_child(slider)
	page.add_child(minimap_row)
	return {"shake_cb": shake, "motion_cb": motion, "minimap_slider": slider, "quality_option": quality}


static func _build_gameplay_tab(tabs: TabContainer, sm: Node) -> void:
	var page := VBoxContainer.new()
	page.name = "Gameplay"
	page.add_theme_constant_override("separation", 12)
	tabs.add_child(page)
	_add_toggle(page, "Default to Permadeath", sm, "permadeath", false)
	var note := Label.new()
	note.text = "Difficulty selected per-run from the start screen."
	note.add_theme_font_size_override("font_size", 13)
	note.modulate = Color(0.7, 0.85, 1.0, 0.85)
	page.add_child(note)


static func _add_slider_row(parent: Container, bus_name: String, audio_mgr: RefCounted, sm: Node) -> HSlider:
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = "%s  " % bus_name
	label.custom_minimum_size = Vector2(100, 0)
	row.add_child(label)
	var slider := HSlider.new()
	slider.min_value = -60.0; slider.max_value = 6.0; slider.step = 1.0
	slider.custom_minimum_size = Vector2(280, 28)
	var key: String = "bus_volume_%s" % bus_name.to_lower()
	var initial: float = 0.0
	if sm != null and sm.has_method("get_preference"): initial = float(sm.get_preference(key, 0.0))
	slider.value = initial
	slider.value_changed.connect(func(v: float) -> void:
		if audio_mgr != null and audio_mgr.has_method("set_bus_volume"): audio_mgr.set_bus_volume(bus_name, v)
		if sm != null and sm.has_method("set_preference"): sm.set_preference(key, v)
	)
	row.add_child(slider)
	parent.add_child(row)
	return slider


static func _add_quality_row(parent: Container, root: Control, sm: Node) -> OptionButton:
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = "Quality"
	label.custom_minimum_size = Vector2(140, 0)
	row.add_child(label)
	var option := OptionButton.new()
	option.custom_minimum_size = Vector2(280, 32)
	var current := "auto"
	if sm != null and sm.has_method("get_preference"):
		current = String(sm.get_preference("quality_profile", "auto"))
	var selected_idx := 0
	for profile_id in RUNTIME_QUALITY.option_ids():
		option.add_item(RUNTIME_QUALITY.option_label(String(profile_id)))
		var idx := option.item_count - 1
		option.set_item_metadata(idx, profile_id)
		if String(profile_id) == current:
			selected_idx = idx
	option.select(selected_idx)
	option.item_selected.connect(func(idx: int) -> void:
		if sm != null and sm.has_method("set_preference"):
			sm.set_preference("quality_profile", String(option.get_item_metadata(idx)))
		_apply_live_display_settings(root, sm)
	)
	row.add_child(option)
	parent.add_child(row)
	return option


static func _add_toggle(parent: Container, text: String, sm: Node, key: String, default: bool, on_changed: Callable = Callable()) -> CheckBox:
	var cb := CheckBox.new()
	cb.text = text
	if sm != null and sm.has_method("get_preference"): cb.button_pressed = bool(sm.get_preference(key, default))
	cb.toggled.connect(func(pressed: bool) -> void:
		if sm != null and sm.has_method("set_preference"): sm.set_preference(key, pressed)
		if on_changed.is_valid(): on_changed.call()
	)
	parent.add_child(cb)
	return cb


static func _apply_live_display_settings(root: Control, sm: Node) -> void:
	if root == null or root.get_tree() == null:
		return
	var scene: Node = root.get_tree().current_scene
	if scene != null and scene.has_method("_save_manager"):
		RUNTIME_QUALITY.apply_to_main(scene, sm)


static func show(state: Dictionary) -> void:
	if state.is_empty():
		return
	(state["panel"] as PanelContainer).visible = true
