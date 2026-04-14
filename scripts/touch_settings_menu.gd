extends RefCounted

const TOUCH_PROFILE := preload("res://scripts/touch_profile.gd")
const MOBILE_FEEDBACK := preload("res://scripts/mobile_feedback.gd")


static func build_tab(tabs: TabContainer, root: Control, save_manager: Node) -> void:
	var page := VBoxContainer.new()
	page.name = "Touch"
	page.add_theme_constant_override("separation", 12)
	tabs.add_child(page)
	var note := Label.new()
	note.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	note.add_theme_font_size_override("font_size", 12)
	note.modulate = Color(0.7, 0.85, 1.0, 0.85)
	var apply := func() -> void:
		_apply_live(root, save_manager)
		note.text = _note_text(root, save_manager)
	_add_handedness_row(page, save_manager, apply)
	_add_scale_row(page, "Joystick reach", "touch_joystick_scale", save_manager, apply)
	_add_scale_row(page, "Dash button size", "touch_dash_scale", save_manager, apply)
	_add_toggle_row(page, "Haptics", "mobile_haptics", true, save_manager, apply)
	page.add_child(note)
	note.text = _note_text(root, save_manager)


static func _add_handedness_row(parent: Container, save_manager: Node, on_changed: Callable) -> void:
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = "Layout"
	label.custom_minimum_size = Vector2(140, 0)
	row.add_child(label)
	var option := OptionButton.new()
	option.custom_minimum_size = Vector2(280, 32)
	var current := "right"
	if save_manager != null and save_manager.has_method("get_preference"):
		current = String(save_manager.get_preference("touch_handedness", "right"))
	var selected_idx := 0
	for handedness in TOUCH_PROFILE.handedness_ids():
		option.add_item(TOUCH_PROFILE.handedness_label(String(handedness)))
		var idx := option.item_count - 1
		option.set_item_metadata(idx, handedness)
		if String(handedness) == current:
			selected_idx = idx
	option.select(selected_idx)
	option.item_selected.connect(func(idx: int) -> void:
		if save_manager != null and save_manager.has_method("set_preference"):
			save_manager.set_preference("touch_handedness", String(option.get_item_metadata(idx)))
		on_changed.call()
	)
	row.add_child(option)
	parent.add_child(row)


static func _add_scale_row(parent: Container, text: String, key: String, save_manager: Node, on_changed: Callable) -> void:
	var row := HBoxContainer.new()
	var label := Label.new()
	label.text = text
	label.custom_minimum_size = Vector2(140, 0)
	row.add_child(label)
	var slider := HSlider.new()
	slider.min_value = 0.8
	slider.max_value = 1.35
	slider.step = 0.05
	slider.custom_minimum_size = Vector2(280, 28)
	var current := 1.0
	if save_manager != null and save_manager.has_method("get_preference"):
		current = float(save_manager.get_preference(key, 1.0))
	slider.value = current
	slider.value_changed.connect(func(value: float) -> void:
		if save_manager != null and save_manager.has_method("set_preference"):
			save_manager.set_preference(key, value)
		on_changed.call()
	)
	row.add_child(slider)
	parent.add_child(row)


static func _add_toggle_row(parent: Container, text: String, key: String, default_value: bool, save_manager: Node, on_changed: Callable) -> void:
	var cb := CheckBox.new()
	cb.text = text
	if save_manager != null and save_manager.has_method("get_preference"):
		cb.button_pressed = bool(save_manager.get_preference(key, default_value))
	cb.toggled.connect(func(pressed: bool) -> void:
		if save_manager != null and save_manager.has_method("set_preference"):
			save_manager.set_preference(key, pressed)
		on_changed.call()
	)
	parent.add_child(cb)


static func _apply_live(root: Control, save_manager: Node) -> void:
	if root == null or root.get_tree() == null:
		return
	var scene: Node = root.get_tree().current_scene
	if scene != null:
		TOUCH_PROFILE.apply_to_main(scene, save_manager)


static func _note_text(root: Control, save_manager: Node) -> String:
	var viewport_size := root.get_viewport_rect().size if root != null else Vector2(390.0, 844.0)
	var player_class = _current_player_class(root)
	var profile: Dictionary = TOUCH_PROFILE.resolve(viewport_size, save_manager, player_class)
	return "Layout: %s · %s doctrine · Reach %.0f%% · Dash %.0f%% · %s" % [
		TOUCH_PROFILE.handedness_label(String(profile["handedness"])),
		String(profile["doctrine_label"]),
		float(profile["joystick_scale"]) * 100.0,
		float(profile["dash_scale"]) * 100.0,
		MOBILE_FEEDBACK.note_text(viewport_size, save_manager),
	]


static func _current_player_class(root: Control):
	if root == null or root.get_tree() == null:
		return null
	var scene: Node = root.get_tree().current_scene
	if scene == null or scene.get("player_state") == null:
		return null
	var player_state: Variant = scene.get("player_state")
	return player_state.get("class") if player_state is Dictionary else null
