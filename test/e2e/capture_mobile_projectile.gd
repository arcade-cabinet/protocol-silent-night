extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_projectile_capture.json")
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
		"fixed_run_seed": 1337,
		"invincible": true,
		"auto_collect": true,
		"suppress_session_pause": true,
	})
	_main.start_run("holly_striker")
	_stabilize_dynamic_visuals()
	_main.title_screen.visible = false
	_main.start_screen.visible = false
	_main.ui_mgr.hud_root.visible = true
	_main.ui_mgr.show_message("", 0.0)
	_spawn_projectile_pair()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/projectile_mobile.png" % _shot_dir)
	_save_manager.reset_state_for_tests()
	quit(0)


func _spawn_projectile_pair() -> void:
	_main.combat.spawn_projectile(_main.projectile_root, _main.projectiles,
		_main.player_node.position + Vector3(-4.8, 0.42, 2.9), Vector3(1.0, 0.0, -0.16).normalized(),
		false, 12.0, 1, 24.0, 0.34, Color(_main.player_state["class"].color))
	_main.combat.spawn_projectile(_main.projectile_root, _main.projectiles,
		_main.player_node.position + Vector3(6.6, 0.42, -2.4), Vector3(-1.0, 0.0, 0.18).normalized(),
		true, 10.0, 1, 20.0, 0.32, Color("ff617e"))
	for projectile in _main.projectiles:
		var node := projectile["node"] as Node3D
		node.look_at_from_position(node.position, node.position + projectile["direction"], Vector3.UP, true)


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
