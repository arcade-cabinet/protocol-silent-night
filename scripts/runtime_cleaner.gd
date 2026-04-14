extends RefCounted

## Cleans up all runtime nodes and arrays between runs.

static func clear(main: Node) -> void:
	main.dmg_numbers.clear()
	main.particles.clear()
	main.boss_phases.clear()
	for array_ref in [main.enemies, main.projectiles, main.pickups, main.vfx]:
		for entry in array_ref:
			if entry.has("node") and entry["node"] != null:
				entry["node"].queue_free()
		array_ref.clear()
	main.obstacle_colliders.clear()
	main.boss_ref = {}
	if main.ui_mgr != null and main.ui_mgr.boss_panel != null:
		main.ui_mgr.boss_panel.visible = false
		main.ui_mgr.boss_bar.value = main.ui_mgr.boss_bar.max_value
	main.run_cookies = 0
	main.run_scrolls.clear()
	main.coal_queue.clear()
	for obj in main.board_objects:
		if obj.has("node") and obj["node"] != null:
			obj["node"].queue_free()
	main.board_objects.clear()
	for child in main.board_root.get_children():
		child.queue_free()
	for child in main.actor_root.get_children():
		child.queue_free()
	for child in main.fx_root.get_children():
		child.queue_free()
	if main.player_node != null:
		main.player_node.queue_free()
	main.player_node = null
