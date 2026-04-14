extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null
var _capture_seed := 1225

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
	_stabilize_dynamic_visuals()
	await _capture_mobile("menu_mobile.png")
	await _capture_touch_settings()
	await _capture_present_and_difficulty()

	_set_capture_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"player_damage_scale": 0.35,
		"player_fire_scale": 3.0,
	})
	_main.start_run("holly_striker")
	await _step_until_enemy_spawn()
	await _step_simulation(12)
	await _capture_mobile("gameplay_mobile.png")
	await _capture_mobile("target_hint_mobile.png")
	await _capture_doctrine_mobile("skate_mobile.png", "p_01", "right")
	await _capture_doctrine_mobile("sightline_left_mobile.png", "p_02", "left")
	await _capture_doctrine_mobile("sweep_mobile.png", "p_06", "right", 3)
	await _restore_default_mobile_run()

	_set_capture_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": false,
	})
	_main.debug_force_level_up()
	await _step_simulation(4)
	_main.ui_mgr.show_message("", 0.0)
	await _capture_mobile("level_up_mobile.png")

	_main._apply_upgrade("damage")
	_set_capture_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
	})
	_main.debug_spawn_boss()
	await _step_simulation(6)
	await _capture_mobile("boss_mobile.png")

	_main.debug_end_run(true)
	await _capture_mobile("victory_mobile.png")

	_save_manager.reset_state_for_tests()
	quit(0)


func _capture_present_and_difficulty() -> void:
	_main.ui_mgr._on_play_pressed()
	await _capture_mobile("present_select_mobile.png")
	var first_unlocked: Button = _first_unlocked_present()
	if first_unlocked == null:
		return
	first_unlocked.pressed.emit()
	await _settle_frames()
	_main.ui_mgr.select_button.pressed.emit()
	await _capture_mobile("difficulty_mobile.png")
	var diff_state: Dictionary = _main.ui_mgr.difficulty_panel.get_meta("difficulty_state", {})
	var tier_buttons: Array = diff_state.get("tier_buttons", [])
	if not tier_buttons.is_empty():
		(tier_buttons[0] as Button).pressed.emit()
	await _settle_frames()


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
	await _capture_mobile("settings_mobile.png")
	panel.visible = false


func _set_capture_test_mode(overrides: Dictionary = {}) -> void:
	var options := {
		"manual_tick": true,
		"fixed_run_seed": _capture_seed,
	}
	for key in overrides.keys():
		options[key] = overrides[key]
	_main.configure_test_mode(options)

func _capture_doctrine_mobile(file_name: String, class_id: String, handedness: String, unlock_wave: int = 0) -> void:
	if unlock_wave > 0:
		_save_manager.register_wave_reached(unlock_wave)
	_save_manager.set_preference("touch_handedness", handedness)
	_set_capture_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
	})
	_main.start_run(class_id)
	_main.debug_spawn_boss()
	await _step_until_target_hint()
	await _capture_mobile(file_name)

func _restore_default_mobile_run() -> void:
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_save_manager.set_preference("touch_handedness", "right")
	_set_capture_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"player_damage_scale": 0.35,
		"player_fire_scale": 3.0,
	})
	_main.start_run("holly_striker")
	await _step_until_enemy_spawn()
	await _step_simulation(12)

func _step_until_enemy_spawn(max_steps: int = 80, delta: float = 0.1) -> void:
	for _i in range(max_steps):
		_main.debug_tick(delta)
		if _main.enemies.size() > 0:
			return

func _step_until_target_hint(max_steps: int = 20, delta: float = 0.1) -> void:
	var label: Label = _main.ui_mgr.widgets.get("target_hint", {}).get("label")
	for _i in range(max_steps):
		_main.debug_tick(delta)
		if label != null and label.visible:
			return

func _step_simulation(steps: int, delta: float = 0.1) -> void:
	for _i in range(steps):
		_main.debug_tick(delta)


func _settle_frames(count: int = 2) -> void:
	for _i in range(count):
		await process_frame


func _capture_mobile(file_name: String) -> void:
	_stabilize_dynamic_visuals()
	await _settle_frames()
	await _main.capture_screenshot("%s/%s" % [_shot_dir, file_name])


func _stabilize_dynamic_visuals() -> void:
	if _main.flair_animator != null:
		_main.flair_animator.set_process(false)
	for node in _main.find_children("*", "GPUParticles3D", true, false):
		(node as GPUParticles3D).emitting = false
		(node as GPUParticles3D).visible = false
	for node in _main.find_children("*", "CPUParticles3D", true, false):
		(node as CPUParticles3D).emitting = false
		(node as CPUParticles3D).visible = false


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
