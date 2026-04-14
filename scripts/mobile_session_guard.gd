extends RefCounted

const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func handle_notification(main: Node, what: int) -> void:
	if _session_pause_suppressed(main):
		return
	match what:
		Node.NOTIFICATION_APPLICATION_PAUSED, Node.NOTIFICATION_WM_GO_BACK_REQUEST:
			_pause_active_run(main)
		Node.NOTIFICATION_WM_WINDOW_FOCUS_OUT:
			if _is_mobile(main):
				_pause_active_run(main)


static func _pause_active_run(main: Node) -> void:
	if main == null or String(main.get("state")) not in ["playing", "wave_clear", "level_up"]:
		return
	var tree := main.get_tree()
	if String(main.get("state")) != "playing" or tree == null or tree.paused:
		return
	main.touch_active = false
	main.input_move = Vector2.ZERO
	main.move_velocity = Vector2.ZERO
	main.dash_pressed = false
	if main.ui_mgr != null:
		main.ui_mgr.hide_joystick()
		main.ui_mgr.toggle_pause(tree)
	if main.has_method("_save_manager"):
		var save_manager: Node = main._save_manager()
		if save_manager != null and save_manager.has_method("save_state"):
			save_manager.save_state()
	if main.get("mobile_feedback") != null:
		main.mobile_feedback.trigger(main, "pause")


static func _is_mobile(main: Node) -> bool:
	if main == null or main.get_viewport() == null:
		return false
	return bool(VIEWPORT_PROFILE.for_viewport(main.get_viewport().get_visible_rect().size).get("is_mobile", false))


static func _session_pause_suppressed(main: Node) -> bool:
	if main == null or not main.has_method("get"):
		return false
	var options: Variant = main.get("test_mode")
	return options is Dictionary and bool(options.get("suppress_session_pause", false))
