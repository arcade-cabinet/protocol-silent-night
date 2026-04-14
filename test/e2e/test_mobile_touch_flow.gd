extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")
const TOUCH_PROFILE := preload("res://scripts/touch_profile.gd")

const WINDOW_SIZE := Vector2i(844, 390)
const RUN_SEED := 1225

var _main: Node = null
var _save_manager: Node = null

func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(WINDOW_SIZE)
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://e2e_mobile_touch_flow.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")

func _run() -> void:
	await _settle_frames(3)
	_main.configure_test_mode({
		"manual_tick": true,
		"fixed_run_seed": RUN_SEED,
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"skip_between_match": true,
		"player_damage_scale": 0.7,
	})

	await _activate_button(_button_named(_main.title_screen, "StartRunButton"), func() -> bool: return _main.start_screen.visible, "Expected present select after deploy tap")

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
	await _settle_frames(4)
	_assert(_main.state == "playing", "Expected gameplay state after difficulty tap, got %s" % _main.state)
	_assert(_main.ui_mgr.dash_button.visible, "Expected dash button to show in mobile gameplay")

	await _step_until_enemy_spawn()
	var touch_profile: Dictionary = TOUCH_PROFILE.resolve(Vector2(WINDOW_SIZE), _save_manager, _main.player_state.get("class"))
	var move_origin := Vector2(96.0, float(touch_profile["dash_rect"].position.y) - 180.0)
	var move_target := move_origin + Vector2(110.0, 0.0)
	var start_pos: Vector3 = _main.player_node.global_position

	_game_touch(move_origin, 0, true)
	await _settle_frames()
	_game_drag(move_target, 0)
	await _step_simulation(8)
	_assert(_main.touch_active, "Expected move touch to stay active")
	_assert(_main.ui_mgr.joystick_base.visible, "Expected joystick to appear during move drag")
	_assert(_main.player_node.global_position.distance_to(start_pos) > 0.75, "Expected player to move under touch drag")

	var dash_center: Vector2 = (touch_profile["dash_rect"] as Rect2).get_center()
	_game_touch(dash_center, 1, true)
	await _step_simulation(1)
	_assert(_main.dash_cooldown_timer > 0.0, "Expected dash touch to trigger cooldown")
	_assert(_main.dash_timer > 0.0, "Expected dash touch to trigger dash movement")
	_assert(_main.touch_active, "Expected move touch to survive concurrent dash touch")

	_game_touch(dash_center, 1, false)
	_game_touch(move_target, 0, false)
	await _settle_frames(2)
	_assert(not _main.touch_active, "Expected move touch release to clear touch state")
	_assert(not _main.ui_mgr.joystick_base.visible, "Expected joystick to hide after move release")

	_save_manager.reset_state_for_tests()
	quit(0)

func _step_until_enemy_spawn(max_steps: int = 80, delta: float = 0.1) -> void:
	for _i in range(max_steps):
		_main.debug_tick(delta)
		await process_frame
		if _main.enemies.size() > 0:
			return
	_fail("Expected enemy spawn within %d steps" % max_steps)

func _step_simulation(steps: int, delta: float = 0.1) -> void:
	for _i in range(steps):
		_main.debug_tick(delta)
		await process_frame

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

func _drag(position: Vector2, index: int) -> void:
	var event := InputEventScreenDrag.new()
	event.index = index
	event.position = position
	Input.parse_input_event(event)

func _game_touch(position: Vector2, index: int, pressed: bool) -> void:
	var event := InputEventScreenTouch.new()
	event.index = index
	event.position = position
	event.pressed = pressed
	_main._unhandled_input(event)

func _game_drag(position: Vector2, index: int) -> void:
	var event := InputEventScreenDrag.new()
	event.index = index
	event.position = position
	_main._unhandled_input(event)

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

func _button_named(root_node: Node, name: String) -> Button:
	for node in root_node.find_children("*", "Button", true, false):
		if node is Button and (node as Button).name == name:
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
