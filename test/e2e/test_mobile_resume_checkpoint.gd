extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

const WINDOW_SIZE := Vector2i(844, 390)
const RUN_SEED := 1225

var _main: Node = null
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(WINDOW_SIZE)
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://e2e_mobile_resume_checkpoint.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await _settle_frames(3)
	_main.configure_test_mode({"manual_tick": true, "fixed_run_seed": RUN_SEED, "invincible": true, "auto_collect": true})
	await _start_holly_run()
	_main.current_wave_index = 2
	_main.progression.level = 4
	_main.progression.xp = 3
	_main.progression.xp_needed = 11
	_main.progression.kills = 9
	_main.player_state["hp"] = 54.0
	_main.player_state["max_hp"] = 120.0
	_main.player_state["class"].damage = 37.0
	_main.run_cookies = 23
	_main.rewraps = 2
	_main._notification(Node.NOTIFICATION_APPLICATION_PAUSED)
	_assert(not (_save_manager.state.get("suspended_run", {}) as Dictionary).is_empty(), "Expected suspended run snapshot after application pause")

	_main.queue_free()
	await _settle_frames(3)
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	await _settle_frames(3)
	_main.configure_test_mode({"manual_tick": true, "fixed_run_seed": RUN_SEED, "invincible": true, "auto_collect": true})
	await _activate_button(_button_with_text(_main.title_screen, "DEPLOY"), func() -> bool: return _main.start_screen.visible, "Expected start screen after deploy tap on resume shell")

	var resume_button: Button = _main.start_screen.find_child("ResumeRunButton", true, false)
	_assert(resume_button != null and resume_button.visible, "Expected visible resume button on start screen")
	_assert(resume_button.text.contains("WAVE 3"), "Expected resume button to surface suspended wave")
	await _activate_button(resume_button, func() -> bool: return _main.state == "playing", "Expected resumed gameplay state after tapping resume")
	await _settle_frames(2)
	_assert(_main.state == "playing", "Expected gameplay after resume")
	_assert(_main.current_wave_index == 2, "Expected restored run to resume on wave 3 checkpoint")
	_assert(_main.progression.level == 4, "Expected progression level to persist through resume")
	_assert(_main.progression.kills == 9, "Expected kill count to persist through resume")
	_assert(_main.run_cookies == 23, "Expected run cookies to persist through resume")
	_assert(is_equal_approx(float(_main.player_state["hp"]), 54.0), "Expected player HP to persist through resume")
	_assert(is_equal_approx(float(_main.player_state["class"].damage), 37.0), "Expected upgraded damage to persist through resume")
	_assert((_save_manager.state.get("suspended_run", {}) as Dictionary).is_empty(), "Expected suspended run snapshot to clear after resume")

	_save_manager.reset_state_for_tests()
	quit(0)


func _start_holly_run() -> void:
	await _activate_button(_button_with_text(_main.title_screen, "DEPLOY"), func() -> bool: return _main.start_screen.visible, "Expected present select after deploy tap")
	var present_button := _present_button("holly_striker")
	_assert(present_button != null, "Expected Holly Striker present button")
	await _activate_button(present_button, func() -> bool: return _main.current_class_id == "holly_striker", "Expected selected present to update current class")
	var select_button: Button = _main.ui_mgr.select_button
	_assert(select_button != null and not select_button.disabled, "Expected unlocked present to enable deploy select button")
	await _activate_button(select_button, func() -> bool: return _main.difficulty_panel.visible, "Expected difficulty rail after present select")
	var diff_state: Dictionary = _main.difficulty_panel.get_meta("difficulty_state", {})
	var tier_buttons: Array = diff_state.get("tier_buttons", [])
	_assert(tier_buttons.size() > 0, "Expected difficulty buttons")
	await _activate_button(tier_buttons[0] as Button, func() -> bool: return _main.state == "playing", "Expected gameplay state after difficulty tap")
	await _settle_frames(2)


func _activate_button(button: Button, verifier: Callable, failure_message: String) -> void:
	_assert(button != null, "Expected tappable button")
	await _tap_button(button)
	if verifier.call():
		return
	await _click_button(button)
	if verifier.call():
		return
	button.pressed.emit()
	await _settle_frames(2)
	if verifier.call():
		return
	_fail(failure_message)


func _tap_button(button: Button) -> void:
	var target := button.get_global_rect().get_center()
	_touch(target, 0, true)
	await _settle_frames()
	_touch(target, 0, false)
	await _settle_frames(2)


func _touch(position: Vector2, index: int, pressed: bool) -> void:
	var event := InputEventScreenTouch.new()
	event.index = index
	event.position = position
	event.pressed = pressed
	Input.parse_input_event(event)


func _click_button(button: Button) -> void:
	var target := button.get_global_rect().get_center()
	var motion := InputEventMouseMotion.new()
	motion.position = target
	Input.parse_input_event(motion)
	var down := InputEventMouseButton.new()
	down.position = target
	down.button_index = MOUSE_BUTTON_LEFT
	down.pressed = true
	Input.parse_input_event(down)
	await _settle_frames()
	var up := InputEventMouseButton.new()
	up.position = target
	up.button_index = MOUSE_BUTTON_LEFT
	up.pressed = false
	Input.parse_input_event(up)
	await _settle_frames(2)


func _button_with_text(root_node: Node, text: String) -> Button:
	for node in root_node.find_children("*", "Button", true, false):
		if node is Button and (node as Button).text == text:
			return node as Button
	return null


func _present_button(class_id: String) -> Button:
	for node in _main.ui_mgr.start_classes_box.get_children():
		if node is Button and String(node.get_meta("class_id", "")) == class_id:
			return node as Button
	return null


func _settle_frames(count: int = 2) -> void:
	for _i in range(count):
		await process_frame


func _assert(condition: bool, message: String) -> void:
	if condition:
		return
	_fail(message)


func _fail(message: String) -> void:
	push_error(message)
	_save_manager.reset_state_for_tests()
	quit(1)


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
