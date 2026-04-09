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
	for child in main.board_root.get_children():
		child.queue_free()
	for child in main.actor_root.get_children():
		child.queue_free()
	if main.player_node != null:
		main.player_node.queue_free()
	main.player_node = null
