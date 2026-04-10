extends RefCounted

## Manages board object lifecycle: spawning, damage resolution, destruction.
## When a board object dies, it drops a scroll pickup.

var board_factory: RefCounted
var scroll_pickup: RefCounted
var spawn_rng := RandomNumberGenerator.new()
var drop_rng := RandomNumberGenerator.new()


func _init(bf: RefCounted, sp: RefCounted) -> void:
	board_factory = bf
	scroll_pickup = sp
	spawn_rng.seed = int(Time.get_ticks_usec()) + 17
	drop_rng.seed = int(Time.get_ticks_usec()) + 29


func spawn_board_object(main: Node) -> void:
	var arena_radius: float = float(main.config.get("arena_radius", 18.0))
	board_factory.spawn_board_object(main.board_root, main.board_objects,
		arena_radius, spawn_rng)


func update_board_objects(projectiles: Array, board_objects: Array,
		pickup_root: Node3D, pickups: Array, fx_root: Node3D = null,
		particles: RefCounted = null) -> void:
	for obj_idx in range(board_objects.size() - 1, -1, -1):
		var obj: Dictionary = board_objects[obj_idx]
		for proj_idx in range(projectiles.size() - 1, -1, -1):
			var proj: Dictionary = projectiles[proj_idx]
			if bool(proj.get("hostile", false)):
				continue
			if proj["node"].position.distance_to(obj["node"].position) < 1.2:
				obj["hp"] = float(obj.get("hp", 0.0)) - float(proj.get("damage", 0.0))
				proj["pierce"] = int(proj.get("pierce", 1)) - 1
				if particles != null and fx_root != null:
					particles.spawn_muzzle_flash(fx_root, obj["node"].position, Vector3.UP, Color("ffd700"))
				if int(proj["pierce"]) <= 0:
					proj["node"].queue_free()
					projectiles.remove_at(proj_idx)
				else:
					projectiles[proj_idx] = proj
				break
		var hp_bar: MeshInstance3D = obj.get("hp_bar") as MeshInstance3D
		if hp_bar != null and hp_bar.is_inside_tree():
			hp_bar.scale.x = clampf(float(obj["hp"]) / maxf(1.0, float(obj["max_hp"])), 0.0, 1.0)
		if float(obj.get("hp", 0.0)) <= 0.0:
			if particles != null and fx_root != null:
				particles.spawn_death_burst(fx_root, obj["node"].position, Color("ffd700"), 1.2)
			scroll_pickup.spawn_scroll(pickup_root, pickups,
				obj["node"].position, drop_rng)
			obj["node"].queue_free()
			board_objects.remove_at(obj_idx)
		else:
			board_objects[obj_idx] = obj
