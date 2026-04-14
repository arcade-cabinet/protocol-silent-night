extends RefCounted

const TOUCH_PROFILE := preload("res://scripts/touch_profile.gd")


static func handle(event: InputEvent, viewport_size: Vector2, state: Dictionary, memory: Dictionary, save_manager: Node = null, player_class = null) -> void:
	var touch_profile: Dictionary = TOUCH_PROFILE.resolve(viewport_size, save_manager, player_class)
	if event is InputEventScreenTouch:
		_handle_touch(event as InputEventScreenTouch, state, memory, touch_profile)
	elif event is InputEventScreenDrag:
		_handle_drag(event as InputEventScreenDrag, state, memory, touch_profile)


static func _handle_touch(touch: InputEventScreenTouch, state: Dictionary, memory: Dictionary, touch_profile: Dictionary) -> void:
	var index := int(touch.index)
	var dash_index := int(memory.get("dash_index", -1))
	var move_index := int(memory.get("move_index", -1))
	if touch.pressed and _is_dash_touch(touch.position, touch_profile):
		memory["dash_index"] = index
		state["dash_pressed"] = true
		return
	if not touch.pressed and index == dash_index:
		memory["dash_index"] = -1
		state["dash_pressed"] = false
		return
	if not touch.pressed and index == move_index:
		_clear_move_touch(state, memory)
		return
	if touch.pressed and move_index == -1:
		memory["move_index"] = index
		state["touch_active"] = true
		state["touch_origin"] = touch.position
		state["touch_position"] = touch.position
		state["joystick_base"] = touch.position
		state["joystick_knob"] = touch.position
		state["show_joystick"] = true


static func _handle_drag(drag: InputEventScreenDrag, state: Dictionary, memory: Dictionary, touch_profile: Dictionary) -> void:
	if int(memory.get("move_index", -1)) != int(drag.index):
		return
	state["touch_active"] = true
	state["touch_position"] = drag.position
	var origin: Vector2 = state.get("touch_origin", drag.position)
	var delta_vec := drag.position - origin
	var radius := float(touch_profile["joystick_drag_radius"])
	var move := delta_vec.limit_length(radius) / radius
	var visual_radius := float(touch_profile["joystick_visual_radius"])
	state["input_move"] = move
	state["joystick_base"] = origin
	state["joystick_knob"] = origin + move * visual_radius
	state["show_joystick"] = true


static func _clear_move_touch(state: Dictionary, memory: Dictionary) -> void:
	memory["move_index"] = -1
	state["touch_active"] = false
	state["input_move"] = Vector2.ZERO
	state["hide_joystick"] = true


static func _is_dash_touch(position: Vector2, touch_profile: Dictionary) -> bool:
	var dash_rect: Rect2 = touch_profile["dash_rect"]
	return dash_rect.has_point(position)
