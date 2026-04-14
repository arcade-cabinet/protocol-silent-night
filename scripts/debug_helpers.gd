extends RefCounted

## Static helpers for debug operations.

static func force_level_up(main: Node) -> void:
	main._trigger_level_up()


static func spawn_boss(main: Node) -> void:
	main.game_mgr.spawn_boss(1.0)


static func end_run(main: Node, win: bool) -> void:
	main.game_mgr.end_run(win)


static func capture_screenshot(main: Node, path: String) -> void:
	await main.get_tree().process_frame
	await main.get_tree().process_frame
	var image := main.get_viewport().get_texture().get_image()
	var target_path := ProjectSettings.globalize_path(path) if path.begins_with("res://") or path.begins_with("user://") else path
	var dir_path := target_path.get_base_dir()
	if not DirAccess.dir_exists_absolute(dir_path):
		DirAccess.make_dir_recursive_absolute(dir_path)
	image.save_png(target_path)
