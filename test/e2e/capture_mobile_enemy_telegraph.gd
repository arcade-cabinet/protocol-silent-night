extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_enemy_telegraph_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	await process_frame
	_main.configure_test_mode({
		"manual_tick": true,
		"fixed_run_seed": 1225,
		"invincible": true,
		"auto_collect": true,
		"suppress_session_pause": true,
	})
	_main.start_run("holly_striker")
	await _step_until_enemy_spawn()
	_stabilize_dynamic_visuals()
	_main.title_screen.visible = false
	_main.start_screen.visible = false
	_main.ui_mgr.hud_root.visible = true
	_main.ui_mgr.show_message("", 0.0)
	MAIN_HELPERS.enemy_telegraph(_main, "santa", _main.player_node.position + Vector3(7.2, 0.0, 4.0))
	await process_frame
	var telegraph := _main.fx_root.get_node_or_null("EnemyTelegraph_santa") as Node3D
	if telegraph != null:
		telegraph.scale = Vector3.ONE * 1.24
		telegraph.rotation.y = PI * 0.22
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/telegraph_mobile.png" % _shot_dir)
	_save_manager.reset_state_for_tests()
	quit(0)


func _step_until_enemy_spawn(max_steps: int = 80, delta: float = 0.1) -> void:
	for _i in range(max_steps):
		_main.debug_tick(delta)
		if _main.enemies.size() > 0:
			return


func _stabilize_dynamic_visuals() -> void:
	if _main.flair_animator != null:
		_main.flair_animator.set_process(false)
	for node in _main.find_children("*", "GPUParticles3D", true, false):
		(node as GPUParticles3D).emitting = false
		(node as GPUParticles3D).visible = false
	for node in _main.find_children("*", "CPUParticles3D", true, false):
		(node as CPUParticles3D).emitting = false
		(node as CPUParticles3D).visible = false


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
