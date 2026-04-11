extends GdUnitTestSuite

## Unit tests for player_controller.gd touch input logic.
## Exercises handle_input and read_move_input without a live scene.

var _ctrl_script := preload("res://scripts/player_controller.gd")


func _make_ctrl() -> RefCounted:
	return _ctrl_script.new(null, null)


## Simulate a drag from src to dst and return the resulting input_move.
func _drag_move(src: Vector2, dst: Vector2) -> Vector2:
	var state: Dictionary = {
		"touch_active": false,
		"touch_origin": Vector2.ZERO,
		"touch_position": Vector2.ZERO,
		"input_move": Vector2.ZERO,
		"joystick_base": Vector2.ZERO,
		"joystick_knob": Vector2.ZERO,
		"show_joystick": false,
		"hide_joystick": false,
		"dash_pressed": false,
	}
	var ctrl: RefCounted = _make_ctrl()
	var vp := Vector2(390.0, 844.0)
	# Touch down
	var touch_down := InputEventScreenTouch.new()
	touch_down.position = src
	touch_down.pressed = true
	ctrl.handle_input(touch_down, vp, state)
	# Drag
	var drag := InputEventScreenDrag.new()
	drag.position = dst
	ctrl.handle_input(drag, vp, state)
	return state["input_move"]


func test_horizontal_drag_produces_rightward_move() -> void:
	# Drag from (100, 400) to (200, 400) on 390x844 viewport
	var move: Vector2 = _drag_move(Vector2(100.0, 400.0), Vector2(200.0, 400.0))
	# x should be strongly positive, y near zero
	assert_float(move.x).is_greater(0.8)
	assert_float(absf(move.y)).is_less(0.3)


func test_touch_in_dash_zone_triggers_dash() -> void:
	# Rightmost 30% of 390 = x > 273; bottom 35% of 844 = y > 549.6
	var state: Dictionary = {
		"touch_active": false,
		"touch_origin": Vector2.ZERO,
		"touch_position": Vector2.ZERO,
		"input_move": Vector2.ZERO,
		"joystick_base": Vector2.ZERO,
		"joystick_knob": Vector2.ZERO,
		"show_joystick": false,
		"hide_joystick": false,
		"dash_pressed": false,
	}
	var ctrl: RefCounted = _make_ctrl()
	var vp := Vector2(390.0, 844.0)
	var touch := InputEventScreenTouch.new()
	# Position firmly in dash zone: x=320 (82%), y=620 (73%)
	touch.position = Vector2(320.0, 620.0)
	touch.pressed = true
	ctrl.handle_input(touch, vp, state)
	assert_bool(state["dash_pressed"]).is_true()
	# touch_active should NOT be set (dash zone is exclusive)
	assert_bool(state["touch_active"]).is_false()


func test_touch_outside_dash_zone_activates_joystick() -> void:
	var state: Dictionary = {
		"touch_active": false,
		"touch_origin": Vector2.ZERO,
		"touch_position": Vector2.ZERO,
		"input_move": Vector2.ZERO,
		"joystick_base": Vector2.ZERO,
		"joystick_knob": Vector2.ZERO,
		"show_joystick": false,
		"hide_joystick": false,
		"dash_pressed": false,
	}
	var ctrl: RefCounted = _make_ctrl()
	var vp := Vector2(390.0, 844.0)
	var touch := InputEventScreenTouch.new()
	touch.position = Vector2(100.0, 400.0)
	touch.pressed = true
	ctrl.handle_input(touch, vp, state)
	assert_bool(state["touch_active"]).is_true()
	assert_bool(state["show_joystick"]).is_true()
	assert_bool(state["dash_pressed"]).is_false()


func test_gamepad_r1_triggers_dash() -> void:
	var state: Dictionary = {"dash_pressed": false}
	var ctrl: RefCounted = _make_ctrl()
	var joy_press := InputEventJoypadButton.new()
	joy_press.button_index = JOY_BUTTON_RIGHT_SHOULDER
	joy_press.pressed = true
	ctrl.handle_input(joy_press, Vector2(390.0, 844.0), state)
	assert_bool(state["dash_pressed"]).is_true()
	var joy_release := InputEventJoypadButton.new()
	joy_release.button_index = JOY_BUTTON_RIGHT_SHOULDER
	joy_release.pressed = false
	ctrl.handle_input(joy_release, Vector2(390.0, 844.0), state)
	assert_bool(state["dash_pressed"]).is_false()


func test_gamepad_a_button_also_triggers_dash() -> void:
	var state: Dictionary = {"dash_pressed": false}
	var ctrl: RefCounted = _make_ctrl()
	var joy := InputEventJoypadButton.new()
	joy.button_index = JOY_BUTTON_A
	joy.pressed = true
	ctrl.handle_input(joy, Vector2(390.0, 844.0), state)
	assert_bool(state["dash_pressed"]).is_true()


func test_read_move_input_applies_dead_zone_to_still_stick() -> void:
	# With no touch and no key presses, move from a zero-magnitude input_move
	# should remain zero (dead-zone filters negligible axis values).
	var ctrl: RefCounted = _make_ctrl()
	var move: Vector2 = ctrl.read_move_input(Vector2.ZERO, false)
	# Keyboard is not pressed in headless; joy axes return 0.0 — result is zero.
	assert_float(move.length()).is_less_equal(0.15)


func test_update_player_aura_calls_on_boss_killed_when_boss_dies() -> void:
	# Regression: aura hitting boss to 0 HP must call on_boss_killed.
	# aura_damage = 7.0 * aura_level=1 * damage_scale=1.0 = 7.0
	# boss receives 7.0 * 0.45 = 3.15 — boss_ref.hp=1.0 drops to ≤0.
	var ctrl: RefCounted = _make_ctrl()
	var player_node: Node3D = auto_free(Node3D.new())
	player_node.position = Vector3.ZERO
	add_child(player_node)
	var boss_node: Node3D = auto_free(Node3D.new())
	boss_node.position = Vector3(0.5, 0.0, 0.0)
	add_child(boss_node)
	var boss_bar: ProgressBar = auto_free(ProgressBar.new())
	add_child(boss_bar)
	boss_bar.max_value = 100.0; boss_bar.value = 1.0
	var boss_ref: Dictionary = {"node": boss_node, "hp": 1.0}
	var cls := ClassResource.new()
	cls.damage = 10.0
	var player_state: Dictionary = {"aura_level": 1, "aura_timer": 0.55, "class": cls}
	var killed: Array = [false]
	var on_boss_killed := func() -> void: killed[0] = true
	ctrl.update_player_aura(0.016, player_state, player_node, [], boss_ref, 1.0,
		Callable(), Callable(), boss_bar, Callable(), on_boss_killed)
	assert_bool(killed[0]).is_true()
