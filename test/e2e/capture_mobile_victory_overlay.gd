extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _save_manager: Node = null
var _shot_dir := "res://.artifacts/screenshots"


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_victory_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await _settle_frames(2)
	_main.configure_test_mode({"skip_between_match": true})
	_main.ui_mgr.title_screen.visible = false
	_main.ui_mgr.start_screen.visible = false
	_main.ui_mgr.progress_screen.visible = false
	_main.current_wave_index = 9
	_main.debug_end_run(true)
	_stabilize_dynamic_visuals()
	await _settle_frames(3)
	await _main.capture_screenshot("%s/victory_mobile.png" % _shot_dir)
	_save_manager.reset_state_for_tests()
	quit(0)


func _settle_frames(count: int) -> void:
	for _i in range(count):
		await process_frame


func _stabilize_dynamic_visuals() -> void:
	_main.process_mode = Node.PROCESS_MODE_DISABLED
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
