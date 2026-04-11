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
	image.save_png(path)
