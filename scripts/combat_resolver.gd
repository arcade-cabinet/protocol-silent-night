extends RefCounted

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer
var audio_mgr: RefCounted = null


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_projectile(projectile_root: Node3D, projectiles: Array, origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float, player_color: Color, fx_root: Node3D = null, particles: RefCounted = null) -> void:
	var node := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = scale_value
	sphere.height = scale_value * 2.0
	node.mesh = sphere
	node.material_override = materials.emissive_material(Color("ff617e") if hostile else player_color, 1.6, 0.08)
	node.position = origin
	projectile_root.add_child(node)
	projectiles.append({"node": node, "direction": direction, "hostile": hostile, "damage": damage, "pierce": pierce, "speed": speed, "life": 1.0})
	if audio_mgr != null and not hostile:
		audio_mgr.play_shot("#%s" % player_color.to_html(false))
	if particles != null and fx_root != null and not hostile:
		particles.spawn_muzzle_flash(fx_root, origin, direction, player_color)


func update_projectiles(delta: float, projectiles: Array, enemies: Array, boss_ref: Dictionary, player_node: Node3D, obstacle_colliders: Array, boss_bar: ProgressBar, boss_panel: VBoxContainer, on_damage_player: Callable, on_kill_enemy: Callable, on_boss_killed: Callable, fx_root: Node3D, vfx: Array, dmg_numbers: RefCounted = null) -> void:
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
					if audio_mgr != null:
						if audio_mgr.has_method("play_3d"): audio_mgr.play_3d("hit", enemy["node"].position, -3.0)
						else: audio_mgr.play_hit()
					if dmg_numbers != null:
						dmg_numbers.spawn(fx_root, enemy["node"].position + Vector3(0, 1.0, 0), float(projectile["damage"]), enemy["color"])
					projectile["pierce"] -= 1
					if enemy["hp"] <= 0.0:
						on_kill_enemy.call(enemy_index)
					if projectile["pierce"] <= 0:
						remove = true
						break
			if not remove and boss_ref.size() > 0 and float(boss_ref.get("hp", 0.0)) > 0.0 and projectile["node"].position.distance_to(boss_ref["node"].position) < 1.8:
				boss_ref["hp"] -= float(projectile["damage"])
				boss_bar.value = boss_ref["hp"]
				spawn_hit_fx(fx_root, vfx, boss_ref["node"].position, boss_ref["color"])
				if dmg_numbers != null:
					dmg_numbers.spawn(fx_root, boss_ref["node"].position + Vector3(0, 2.0, 0), float(projectile["damage"]), boss_ref["color"], true)
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


func update_pickups(delta: float, pickups: Array, player_node: Node3D, config: Dictionary, test_mode: Dictionary, on_gain_xp: Callable, fx_root: Node3D = null, particles: RefCounted = null, on_gain_cookies: Callable = Callable(), on_gain_scroll: Callable = Callable()) -> void:
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
			var ptype: String = pickup.get("type", "xp")
			if ptype == "cookie" and on_gain_cookies.is_valid():
				on_gain_cookies.call(int(pickup["value"]))
			elif ptype == "scroll" and on_gain_scroll.is_valid():
				on_gain_scroll.call(String(pickup.get("scroll_type", "nice")))
			else:
				on_gain_xp.call(int(pickup["value"]))
			if audio_mgr != null: audio_mgr.play_pickup()
			if particles != null and fx_root != null:
				if ptype == "scroll":
					var stype: String = String(pickup.get("scroll_type", "nice"))
					var scroll_color := Color("#ffd700") if stype == "nice" else Color("#ff2244")
					particles.spawn_death_burst(fx_root, pickup["node"].position, scroll_color, 0.65)
				else:
					particles.spawn_pickup_sparkle(fx_root, pickup["node"].position)
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


func spawn_pickup(pickup_root: Node3D, pickups: Array, world_position: Vector3, value: int, pickup_type: String = "xp") -> void:
	var node := Node3D.new()
	var art_id := "cookie" if pickup_type == "cookie" else "xp"
	var color := Color("ffd700") if pickup_type == "cookie" else Color("8cff8e")
	var sprite: MeshInstance3D = pixels.make_billboard_sprite(art_id, 1.25, color)
	node.add_child(sprite)
	node.position = world_position + Vector3(0, 0.18, 0)
	pickup_root.add_child(node)
	pickups.append({
		"node": node, "value": value, "base_y": node.position.y,
		"phase": randf() * TAU, "time": 0.0, "type": pickup_type
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
