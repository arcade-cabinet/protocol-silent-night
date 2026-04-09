extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _frames: int = 0
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_MINIMIZED)
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://e2e_full_playthrough.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()

	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"manual_tick": true,
		"wave_scale": 8.0,
		"player_damage_scale": 8.0,
		"player_fire_scale": 3.5,
		"boss_hp_scale": 0.08,
		"skip_between_match": true
	})
	_main.start_run("elf")

	while _frames < 1500 and _main.state not in ["win", "game_over"]:
		_frames += 1
		_main.debug_tick(0.25)
		await process_frame

	if _main.state != "win":
		var boss_hp := "none"
		if _main.boss_ref.size() > 0:
			boss_hp = "%0.2f" % float(_main.boss_ref.get("hp", -1.0))
		push_error("Expected a campaign clear, got state=%s after %d frames (wave=%d kills=%d level=%d boss_hp=%s)" % [_main.state, _frames, _main.current_wave_index + 1, _main.kills, _main.level, boss_hp])
		quit(1)
		return

	if not _save_manager.is_unlocked("santa"):
		push_error("Expected Santa unlock by wave five.")
		quit(1)
		return

	if not _save_manager.is_unlocked("bumble"):
		push_error("Expected Bumble unlock after campaign clear.")
		quit(1)
		return

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
