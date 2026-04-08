extends RefCounted

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_enemy(actor_root: Node3D, enemies: Array, enemy_type: String, hp_scale: float, enemy_defs: Dictionary, config: Dictionary) -> void:
	var def: Dictionary = enemy_defs[enemy_type]
	var enemy_node := Node3D.new()
	enemy_node.name = "Enemy_%s" % enemy_type
	var mesh_instance: MeshInstance3D = pixels.make_billboard_sprite(enemy_type, 2.0, Color(def["color"]))
	enemy_node.add_child(mesh_instance)
	var shadow := MeshInstance3D.new()
	var shadow_mesh := PlaneMesh.new()
	shadow_mesh.size = Vector2(1.1, 1.1)
	shadow.mesh = shadow_mesh
	shadow.position = Vector3(0, -0.56, 0)
	shadow.material_override = materials.shadow_material()
	enemy_node.add_child(shadow)
	actor_root.add_child(enemy_node)
	var angle := randf() * TAU
	var radius := float(config["arena_radius"]) - 1.5
	enemy_node.position = Vector3(cos(angle) * radius, 0.58, sin(angle) * radius)
	var scale_value := float(def["scale"])
	enemy_node.scale = Vector3.ONE * scale_value
	enemies.append({
		"id": enemy_type,
		"node": enemy_node,
		"hp": float(def["max_hp"]) * hp_scale,
		"max_hp": float(def["max_hp"]) * hp_scale,
		"speed": float(def["speed"]),
		"contact_damage": float(def["contact_damage"]),
		"drop_xp": int(def["drop_xp"]),
		"color": Color(def["color"]),
		"attack_timer": 0.0
	})


func spawn_boss(actor_root: Node3D, boss_ref: Dictionary, enemy_defs: Dictionary, config: Dictionary, hp_scale: float, boss_hp_scale: float, boss_panel: VBoxContainer, boss_bar: ProgressBar, on_show_message: Callable) -> Dictionary:
	if boss_ref.size() > 0:
		return boss_ref
	var def: Dictionary = enemy_defs["boss"]
	var boss_node := Node3D.new()
	boss_node.name = "Boss"
	var body: MeshInstance3D = pixels.make_billboard_sprite("boss", 4.4, Color(def["color"]))
	boss_node.add_child(body)
	var shadow := MeshInstance3D.new()
	var shadow_mesh := PlaneMesh.new()
	shadow_mesh.size = Vector2(2.9, 2.9)
	shadow.mesh = shadow_mesh
	shadow.position = Vector3(0, -0.92, 0)
	shadow.material_override = materials.shadow_material()
	boss_node.add_child(shadow)
	var ring := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 1.6
	torus.inner_radius = 0.15
	ring.mesh = torus
	ring.rotation_degrees = Vector3(90, 0, 0)
	ring.position = Vector3(0, 1.3, 0)
	ring.material_override = materials.emissive_material(Color("ffe07a"), 2.0, 0.2)
	boss_node.add_child(ring)
	boss_node.position = Vector3(0, 0.18, -float(config["arena_radius"]) + 2.5)
	actor_root.add_child(boss_node)
	var new_boss := {
		"id": "boss",
		"node": boss_node,
		"ring": ring,
		"hp": float(def["max_hp"]) * hp_scale * boss_hp_scale,
		"max_hp": float(def["max_hp"]) * hp_scale * boss_hp_scale,
		"speed": float(def["speed"]),
		"contact_damage": float(def["contact_damage"]),
		"color": Color(def["color"]),
		"attack_timer": 0.0
	}
	boss_panel.visible = true
	boss_bar.max_value = new_boss["max_hp"]
	boss_bar.value = new_boss["hp"]
	on_show_message.call("KRAMPUS DETECTED", 2.2, Color("ff4466"))
	return new_boss


func update_enemies(delta: float, enemies: Array, boss_ref: Dictionary, player_node: Node3D, on_move_actor: Callable, on_damage_player: Callable, on_spawn_projectile: Callable, boss_attack_scale: float) -> void:
	for index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[index]
		var direction: Vector3 = (player_node.position - enemy["node"].position).normalized()
		on_move_actor.call(enemy["node"], direction, float(enemy["speed"]), delta, 0.52 + float(enemy["node"].scale.x) * 0.3)
		if enemy["node"].position.distance_to(player_node.position) < 0.9 + float(enemy["node"].scale.x) * 0.35:
			on_damage_player.call(float(enemy["contact_damage"]) * delta * 2.0)
		enemies[index] = enemy
	if boss_ref.size() > 0:
		var boss_dir: Vector3 = (player_node.position - boss_ref["node"].position).normalized()
		if boss_ref["node"].position.distance_to(player_node.position) > 8.0:
			on_move_actor.call(boss_ref["node"], boss_dir, float(boss_ref["speed"]), delta, 1.2)
		boss_ref["ring"].rotation_degrees.y += 120.0 * delta
		boss_ref["attack_timer"] += delta
		if boss_ref["attack_timer"] >= 1.15 / boss_attack_scale:
			boss_ref["attack_timer"] = 0.0
			for shot in range(-2, 3):
				on_spawn_projectile.call(boss_ref["node"].position + Vector3(0, 0.6, 0), boss_dir.rotated(Vector3.UP, shot * 0.12), true, 18.0, 1, 18.0, 0.35)


func closest_target(enemies: Array, boss_ref: Dictionary, player_node: Node3D, range_limit: float) -> Dictionary:
	var best: Dictionary = {}
	var best_distance := INF
	for enemy in enemies:
		var distance := player_node.position.distance_to(enemy["node"].position)
		if distance < range_limit and distance < best_distance:
			best_distance = distance
			best = enemy
	if boss_ref.size() > 0:
		var boss_distance := player_node.position.distance_to(boss_ref["node"].position)
		if boss_distance < range_limit + 4.0 and boss_distance < best_distance:
			best = boss_ref
	return best
