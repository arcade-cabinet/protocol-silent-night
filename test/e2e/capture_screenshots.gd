extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(1440, 900))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://screenshot_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	await process_frame

	await _main.capture_screenshot("%s/menu.png" % _shot_dir)
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true
	})
	_main.start_run("holly_striker")
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/gameplay.png" % _shot_dir)

	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": false
	})
	_main.debug_force_level_up()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/level_up.png" % _shot_dir)

	_main._apply_upgrade("damage")
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true
	})
	_main.debug_spawn_boss()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/boss.png" % _shot_dir)

	_main.debug_end_run(true)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/victory.png" % _shot_dir)

	_main.debug_end_run(false)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/defeat.png" % _shot_dir)

	_save_manager.reset_state_for_tests()
	quit(0)


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
