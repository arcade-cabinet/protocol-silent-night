extends RefCounted

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_projectile(projectile_root: Node3D, projectiles: Array, origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float, player_color: Color) -> void:
	var node := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = scale_value
	sphere.height = scale_value * 2.0
	node.mesh = sphere
	node.material_override = materials.emissive_material(Color("ff617e") if hostile else player_color, 1.6, 0.08)
	node.position = origin
	projectile_root.add_child(node)
	projectiles.append({
		"node": node,
		"direction": direction,
		"hostile": hostile,
		"damage": damage,
		"pierce": pierce,
		"speed": speed,
		"life": 1.0
	})


func update_projectiles(delta: float, projectiles: Array, enemies: Array, boss_ref: Dictionary, player_node: Node3D, obstacle_colliders: Array, boss_bar: ProgressBar, boss_panel: VBoxContainer, on_damage_player: Callable, on_kill_enemy: Callable, on_boss_killed: Callable, fx_root: Node3D, vfx: Array) -> void:
	for index in range(projectiles.size() - 1, -1, -1):
		var projectile: Dictionary = projectiles[index]
		projectile["life"] -= delta
		projectile["node"].position += projectile["direction"] * float(projectile["speed"]) * delta
		var remove: bool = projectile["life"] <= 0.0
		if not remove and bool(projectile["hostile"]) and _projectile_hits_obstacle(projectile["node"].position, obstacle_colliders):
			spawn_hit_fx(fx_root, vfx, Vector3(projectile["node"].position.x, 0.72, projectile["node"].position.z), Color("dceefb"))
			remove = true
		if projectile["hostile"]:
			if player_node != null and projectile["node"].position.distance_to(player_node.position) < 0.9:
				on_damage_player.call(float(projectile["damage"]))
				remove = true
		else:
			for enemy_index in range(enemies.size() - 1, -1, -1):
				var enemy: Dictionary = enemies[enemy_index]
				if projectile["node"].position.distance_to(enemy["node"].position) < 0.9 * float(enemy["node"].scale.x):
					enemy["hp"] -= float(projectile["damage"])
					spawn_hit_fx(fx_root, vfx, enemy["node"].position, enemy["color"])
					projectile["pierce"] -= 1
					if enemy["hp"] <= 0.0:
						on_kill_enemy.call(enemy_index)
					if projectile["pierce"] <= 0:
						remove = true
						break
			if not remove and boss_ref.size() > 0 and projectile["node"].position.distance_to(boss_ref["node"].position) < 1.8:
				boss_ref["hp"] -= float(projectile["damage"])
				boss_bar.value = boss_ref["hp"]
				spawn_hit_fx(fx_root, vfx, boss_ref["node"].position, boss_ref["color"])
				projectile["pierce"] -= 1
				if boss_ref["hp"] <= 0.0:
					on_boss_killed.call()
				if projectile["pierce"] <= 0:
					remove = true
		if remove:
			projectile["node"].queue_free()
			projectiles.remove_at(index)
		else:
			projectiles[index] = projectile


func update_pickups(delta: float, pickups: Array, player_node: Node3D, config: Dictionary, test_mode: Dictionary, on_gain_xp: Callable) -> void:
	for index in range(pickups.size() - 1, -1, -1):
		var pickup: Dictionary = pickups[index]
		var to_player: Vector3 = player_node.position - pickup["node"].position
		var dist := Vector2(to_player.x, to_player.z).length()
		pickup["time"] = float(pickup.get("time", 0.0)) + delta
		pickup["node"].rotation_degrees.y += 120.0 * delta
		if dist <= float(config["pickup_magnet_radius"]) or bool(test_mode.get("auto_collect", false)):
			pickup["node"].position += to_player.normalized() * delta * 10.0
		else:
			pickup["node"].position.y = float(pickup["base_y"]) + sin(float(pickup["time"]) * 4.0 + float(pickup["phase"])) * 0.12
		if dist <= float(config["pickup_auto_collect_radius"]) or bool(test_mode.get("auto_collect", false)):
			on_gain_xp.call(int(pickup["value"]))
			pickup["node"].queue_free()
			pickups.remove_at(index)
		else:
			pickups[index] = pickup


func update_vfx(delta: float, vfx: Array) -> void:
	for index in range(vfx.size() - 1, -1, -1):
		var fx: Dictionary = vfx[index]
		fx["life"] -= delta
		fx["node"].scale = fx["node"].scale.lerp(Vector3.ZERO, delta * 8.0)
		if fx["life"] <= 0.0:
			fx["node"].queue_free()
			vfx.remove_at(index)
		else:
			vfx[index] = fx


func spawn_pickup(pickup_root: Node3D, pickups: Array, world_position: Vector3, value: int) -> void:
	var node := Node3D.new()
	var sprite: MeshInstance3D = pixels.make_billboard_sprite("xp", 1.25, Color("8cff8e"))
	node.add_child(sprite)
	node.position = world_position + Vector3(0, 0.18, 0)
	pickup_root.add_child(node)
	pickups.append({
		"node": node,
		"value": value,
		"base_y": node.position.y,
		"phase": randf() * TAU,
		"time": 0.0
	})


func spawn_hit_fx(fx_root: Node3D, vfx: Array, world_position: Vector3, color: Color) -> void:
	var node := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.32
	sphere.height = 0.64
	node.mesh = sphere
	node.position = world_position + Vector3(0, 0.7, 0)
	node.material_override = materials.emissive_material(color, 1.1, 0.18)
	fx_root.add_child(node)
	vfx.append({
		"node": node,
		"life": 0.25
	})


func _projectile_hits_obstacle(world_position: Vector3, obstacle_colliders: Array) -> bool:
	var world_flat := Vector2(world_position.x, world_position.z)
	for collider in obstacle_colliders:
		if world_flat.distance_to(collider["world"]) < float(collider["radius"]) + 0.18:
			return true
	return false
