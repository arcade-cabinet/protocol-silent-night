extends RefCounted

const EnemyBehaviors := preload("res://scripts/enemy_behaviors.gd")

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer
var audio_mgr: RefCounted = null
var _uid_counter: int = 0
var _enemy_shadow_mesh: PlaneMesh = null
var _boss_shadow_mesh: PlaneMesh = null


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


const MAX_ENEMY_CAP := 48  # Mobile performance ceiling

func spawn_enemy(actor_root: Node3D, enemies: Array, enemy_type: String, hp_scale: float, enemy_defs: Dictionary, config: Dictionary, phase_level: int = 1, override_position: Vector3 = Vector3.INF) -> void:
	if enemies.size() >= MAX_ENEMY_CAP:
		return
	if not enemy_defs.has(enemy_type):
		push_error("spawn_enemy: unknown type '%s'" % enemy_type)
		return
	var def: Dictionary = enemy_defs[enemy_type]
	var enemy_node := Node3D.new()
	enemy_node.name = "Enemy_%s" % enemy_type
	var mesh_instance: MeshInstance3D = pixels.make_billboard_sprite(enemy_type, 2.0, Color(def["color"]))
	enemy_node.add_child(mesh_instance)
	if _enemy_shadow_mesh == null:
		_enemy_shadow_mesh = PlaneMesh.new()
		_enemy_shadow_mesh.size = Vector2(1.1, 1.1)
	var shadow := MeshInstance3D.new()
	shadow.mesh = _enemy_shadow_mesh
	shadow.position = Vector3(0, -0.56, 0)
	shadow.material_override = materials.shadow_material()
	enemy_node.add_child(shadow)
	actor_root.add_child(enemy_node)
	if override_position != Vector3.INF:
		enemy_node.position = override_position
	else:
		var ar := float(config["arena_radius"])
		var half_w := ar * 1.6 - 2.0
		var half_h := ar - 2.0
		var side := randi() % 4
		var spawn_x := randf_range(-half_w, half_w) if side < 2 else (half_w if side == 2 else -half_w)
		var spawn_z := (half_h if side == 0 else -half_h) if side < 2 else randf_range(-half_h, half_h)
		enemy_node.position = Vector3(spawn_x, 0.58, spawn_z)
	var scale_value := float(def["scale"])
	enemy_node.scale = Vector3.ONE * scale_value
	_uid_counter += 1
	enemies.append({
		"id": enemy_type,
		"node": enemy_node,
		"hp": float(def["max_hp"]) * hp_scale,
		"max_hp": float(def["max_hp"]) * hp_scale,
		"speed": float(def["speed"]),
		"contact_damage": float(def["contact_damage"]),
		"drop_xp": int(def["drop_xp"]),
		"drop_cookies": int(def.get("drop_cookies", 0)),
		"color": Color(def["color"]),
		"attack_timer": 0.0,
		"behavior_timer": 0.0,
		"behavior_state": "chase",
		"enemy_uid": _uid_counter,
		"phase_level": phase_level,
	})


func spawn_boss(actor_root: Node3D, boss_ref: Dictionary, enemy_defs: Dictionary, config: Dictionary, hp_scale: float, boss_hp_scale: float, boss_panel: VBoxContainer, boss_bar: ProgressBar, on_show_message: Callable) -> Dictionary:
	if boss_ref.size() > 0:
		return boss_ref
	var def: Dictionary = enemy_defs["boss"]
	var boss_node := Node3D.new()
	boss_node.name = "Boss"
	var body: MeshInstance3D = pixels.make_billboard_sprite("boss", 4.4, Color(def["color"]))
	boss_node.add_child(body)
	if _boss_shadow_mesh == null:
		_boss_shadow_mesh = PlaneMesh.new()
		_boss_shadow_mesh.size = Vector2(2.9, 2.9)
	var shadow := MeshInstance3D.new()
	shadow.mesh = _boss_shadow_mesh
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
	boss_node.position = Vector3(0, 0.18, -(float(config["arena_radius"]) - 3.0))
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
	if audio_mgr != null: audio_mgr.play_boss_roar()
	return new_boss


func update_enemies(delta: float, enemies: Array, boss_ref: Dictionary, player_node: Node3D, on_move_actor: Callable, on_damage_player: Callable, on_spawn_projectile: Callable, boss_attack_scale: float, on_telegraph: Callable = Callable()) -> void:
	for index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[index]
		var pl: int = int(enemy.get("phase_level", 1))
		match String(enemy.get("id", "grunt")):
			"grunt":
				EnemyBehaviors.behavior_grunt_bt(enemy, player_node.position, delta, on_move_actor)
			"rusher":
				EnemyBehaviors.behavior_rusher_bt(enemy, player_node.position, delta, on_move_actor, on_telegraph)
			"tank":
				EnemyBehaviors.behavior_tank_bt(enemy, player_node.position, delta, on_move_actor, on_telegraph)
			"elf":
				EnemyBehaviors.behavior_flank(enemy, player_node, delta, on_move_actor, on_spawn_projectile, pl, on_telegraph)
			"santa":
				EnemyBehaviors.behavior_ranged(enemy, player_node, delta, on_move_actor, on_spawn_projectile, pl, on_telegraph)
			"bumble":
				EnemyBehaviors.behavior_pack(enemy, enemies, player_node, delta, on_move_actor, pl)
			_:
				EnemyBehaviors.behavior_chase(enemy, player_node, delta, on_move_actor)
		if enemy["node"].position.distance_to(player_node.position) < 0.9 + float(enemy["node"].scale.x) * 0.35:
			var slam_mult: float = float(enemy.get("slam_damage_mult", 1.0))
			on_damage_player.call(float(enemy["contact_damage"]) * delta * 2.0 * slam_mult)
		enemies[index] = enemy
	# Boss is now handled by BossPhases in game_manager


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
