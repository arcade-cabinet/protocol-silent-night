extends RefCounted

## Static helpers for debug operations.

static func force_level_up(main: Node) -> void:
	main._trigger_level_up()


static func spawn_boss(main: Node) -> void:
	main.game_mgr.spawn_boss(1.0)


static func end_run(main: Node, win: bool) -> void:
	main.game_mgr.end_run(win)
