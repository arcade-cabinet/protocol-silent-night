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
