extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_threat_marks_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	await process_frame
	_main.configure_test_mode({"manual_tick": true, "fixed_run_seed": 1776, "invincible": true, "auto_collect": true, "suppress_session_pause": true})
	_main.start_run("holly_striker")
	_stabilize_dynamic_visuals()
	_main.title_screen.visible = false
	_main.start_screen.visible = false
	_main.ui_mgr.hud_root.visible = true
	_main.ui_mgr.show_message("", 0.0)
	_spawn_enemy_threats()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/threat_marks_mobile.png" % _shot_dir)
	_save_manager.reset_state_for_tests()
	quit(0)


func _spawn_enemy_threats() -> void:
	_main.enemies_ai.spawn_enemy(_main.actor_root, _main.enemies, "tank", 1.0, _main.enemy_defs, _main.config, 4, 1.0, 1.0, _main.player_node.position + Vector3(5.4, 0.58, 1.8))
	_main.enemies_ai.spawn_enemy(_main.actor_root, _main.enemies, "santa", 1.0, _main.enemy_defs, _main.config, 4, 1.0, 1.0, _main.player_node.position + Vector3(-5.1, 0.58, -1.6))
	_main.enemies[0]["behavior_state"] = "prep_slam"
	_main.enemies[0]["behavior_timer"] = 0.32
	_main.enemies[0]["telegraphed"] = true
	_main.enemies[1]["behavior_state"] = "burst"
	_main.enemies[1]["behavior_timer"] = 0.48
	_main.enemies[1]["telegraphed"] = true
	_main.enemies_ai.refresh_threat_language(_main.enemies, {}, 1)


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
