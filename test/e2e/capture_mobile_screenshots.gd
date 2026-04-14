extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(390, 844))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_screenshot_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/menu_mobile.png" % _shot_dir)
	await _capture_touch_settings()
	await _capture_present_and_difficulty()

	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"player_damage_scale": 0.35,
		"player_fire_scale": 3.0,
	})
	_main.start_run("holly_striker")
	for _i in range(90):
		await process_frame
	await _main.capture_screenshot("%s/gameplay_mobile.png" % _shot_dir)
	await _main.capture_screenshot("%s/target_hint_mobile.png" % _shot_dir)

	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": false,
	})
	_main.debug_force_level_up()
	for _i in range(8):
		await process_frame
	_main.ui_mgr.show_message("", 0.0)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/level_up_mobile.png" % _shot_dir)

	_main._apply_upgrade("damage")
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
	})
	_main.debug_spawn_boss()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/boss_mobile.png" % _shot_dir)

	_main.debug_end_run(true)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/victory_mobile.png" % _shot_dir)

	_save_manager.reset_state_for_tests()
	quit(0)


func _capture_present_and_difficulty() -> void:
	_main.ui_mgr._on_play_pressed()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/present_select_mobile.png" % _shot_dir)
	var first_unlocked: Button = _first_unlocked_present()
	if first_unlocked == null:
		return
	first_unlocked.pressed.emit()
	await process_frame
	await process_frame
	_main.ui_mgr.select_button.pressed.emit()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/difficulty_mobile.png" % _shot_dir)
	var diff_state: Dictionary = _main.ui_mgr.difficulty_panel.get_meta("difficulty_state", {})
	var tier_buttons: Array = diff_state.get("tier_buttons", [])
	if not tier_buttons.is_empty():
		(tier_buttons[0] as Button).pressed.emit()
	await process_frame
	await process_frame


func _capture_touch_settings() -> void:
	_main.ui_mgr.open_settings()
	await process_frame
	await process_frame
	var panel: PanelContainer = _main.ui_mgr.widgets.get("settings", {}).get("panel")
	if panel == null:
		return
	var tabs: TabContainer = panel.find_children("*", "TabContainer", true, false)[0]
	for idx in range(tabs.get_tab_count()):
		if tabs.get_tab_title(idx) == "Touch":
			tabs.current_tab = idx
			break
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/settings_mobile.png" % _shot_dir)
	panel.visible = false


func _first_unlocked_present() -> Button:
	for child in _main.ui_mgr.start_classes_box.get_children():
		if child is Button and bool(child.get_meta("unlocked", false)):
			return child
	return null


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
