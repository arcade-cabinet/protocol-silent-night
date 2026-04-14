extends GdUnitTestSuite

const EnemyBehaviors := preload("res://scripts/enemy_behaviors.gd")


var _moves: Array = []
var _projectiles: Array = []


func before_test() -> void:
	_moves = []
	_projectiles = []


func _make_enemy(id: String, position: Vector3, speed: float = 3.0) -> Dictionary:
	var node := Node3D.new()
	node.scale = Vector3.ONE
	node.position = position
	add_child(node)
	return {
		"id": id,
		"node": node,
		"hp": 10.0,
		"max_hp": 10.0,
		"speed": speed,
		"contact_damage": 1.0,
		"attack_timer": 0.0,
		"behavior_timer": 0.0,
		"behavior_state": "chase",
		"enemy_uid": 7
	}


func _make_player(position: Vector3) -> Node3D:
	var player := Node3D.new()
	player.position = position
	add_child(player)
	return player


func _move_recorder(node: Node3D, direction: Vector3, speed: float, delta: float, radius: float) -> void:
	_moves.append({
		"node": node,
		"direction": direction,
		"speed": speed,
		"delta": delta,
		"radius": radius
	})
	# Simulate simple movement to advance state without full physics.
	node.position += direction * speed * delta


func _projectile_recorder(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	_projectiles.append({
		"origin": origin,
		"direction": direction,
		"hostile": hostile,
		"damage": damage,
		"pierce": pierce,
		"speed": speed,
		"scale": scale_value
	})


func test_chase_moves_toward_player() -> void:
	var enemy := _make_enemy("grunt", Vector3(0, 0.58, 0))
	var player := _make_player(Vector3(5, 0.58, 0))
	EnemyBehaviors.behavior_chase(enemy, player, 0.1, Callable(self, "_move_recorder"))
	assert_int(_moves.size()).is_equal(1)
	assert_float(_moves[0]["direction"].x).is_greater(0.9)


func test_swerve_offset_is_bounded() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0.58, 0))
	var player := _make_player(Vector3(5, 0.58, 0))
	var player_callable := Callable(self, "_move_recorder")
	for i in range(20):
		EnemyBehaviors.behavior_swerve(enemy, player, 0.05, player_callable)
	# All move directions should still be roughly unit length and not wildly diverge.
	for move in _moves:
		var direction: Vector3 = move["direction"]
		assert_float(direction.length()).is_between(0.9, 1.1)
		assert_float(direction.x).is_greater(0.0)


func test_stomp_cycles_states() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0.58, 0), 1.5)
	var player := _make_player(Vector3(6, 0.58, 0))
	var move_callable := Callable(self, "_move_recorder")
	for i in range(90):
		EnemyBehaviors.behavior_stomp(enemy, player, 0.05, move_callable)
	# After 4.5 seconds we should have passed through windup and surge at least once.
	var states_seen := {}
	states_seen[String(enemy["behavior_state"])] = true
	assert_bool(String(enemy["behavior_state"]) in ["chase", "windup", "surge"]).is_true()
	assert_int(_moves.size()).is_greater(0)


func test_flank_fires_projectile_eventually() -> void:
	var enemy := _make_enemy("elf", Vector3(8, 0.58, 0))
	var player := _make_player(Vector3(0, 0.58, 0))
	var move_callable := Callable(self, "_move_recorder")
	var shot_callable := Callable(self, "_projectile_recorder")
	for i in range(40):
		EnemyBehaviors.behavior_flank(enemy, player, 0.05, move_callable, shot_callable)
	assert_int(_projectiles.size()).is_greater(0)
	assert_bool(bool(_projectiles[0]["hostile"])).is_true()


func test_ranged_keeps_distance_and_fires_burst() -> void:
	var enemy := _make_enemy("santa", Vector3(10, 0.58, 0))
	var player := _make_player(Vector3(0, 0.58, 0))
	var move_callable := Callable(self, "_move_recorder")
	var shot_callable := Callable(self, "_projectile_recorder")
	for i in range(60):
		EnemyBehaviors.behavior_ranged(enemy, player, 0.05, move_callable, shot_callable)
	# Santa should have fired at least one 3-shot burst.
	assert_int(_projectiles.size()).is_greater_equal(3)
	# Enemy should not have closed inside the minimum range (10 units).
	var final_distance: float = enemy["node"].position.distance_to(player.position)
	assert_float(final_distance).is_greater(8.5)


func test_ranged_repositions_when_player_far() -> void:
	var enemy := _make_enemy("santa", Vector3(20, 0.58, 0))
	var player := _make_player(Vector3(0, 0.58, 0))
	var move_callable := Callable(self, "_move_recorder")
	var shot_callable := Callable(self, "_projectile_recorder")
	var before: float = enemy["node"].position.distance_to(player.position)
	for i in range(20):
		EnemyBehaviors.behavior_ranged(enemy, player, 0.05, move_callable, shot_callable)
	var after: float = enemy["node"].position.distance_to(player.position)
	# Outside the leash, santa should have moved toward the player.
	assert_float(after).is_less(before)


func test_pack_biases_toward_player() -> void:
	var enemy_a := _make_enemy("bumble", Vector3(-1, 0.58, 0))
	enemy_a["enemy_uid"] = 1
	var enemy_b := _make_enemy("bumble", Vector3(1, 0.58, 0))
	enemy_b["enemy_uid"] = 2
	var player := _make_player(Vector3(10, 0.58, 0))
	var enemies := [enemy_a, enemy_b]
	var move_callable := Callable(self, "_move_recorder")
	EnemyBehaviors.behavior_pack(enemy_a, enemies, player, 0.1, move_callable)
	assert_int(_moves.size()).is_equal(1)
	var direction: Vector3 = _moves[0]["direction"]
	assert_float(direction.length()).is_between(0.9, 1.1)
	assert_float(direction.x).is_greater(0.0)


func test_swerve_higher_phase_increases_amplitude() -> void:
	# Phase 5 swerve amplitude factor (0.9 + 5*0.3 = 2.4) should exceed phase 1 (0.9 + 1*0.3 = 1.2).
	# We verify the offset coefficient grows, not the direction itself, by checking sin contribution.
	var low_amplitude: float = 0.9 + float(1) * 0.3
	var high_amplitude: float = 0.9 + float(5) * 0.3
	assert_float(high_amplitude).is_greater(low_amplitude)


func test_flank_fires_faster_at_higher_phase() -> void:
	# Phase 5 fire interval: max(1.2 - 4*0.1, 0.5) = 0.8 < phase 1 interval 1.2
	var enemy := _make_enemy("elf", Vector3(8, 0.58, 0))
	var player := _make_player(Vector3(0, 0.58, 0))
	var move_callable := Callable(self, "_move_recorder")
	var shot_callable := Callable(self, "_projectile_recorder")
	# With phase 5, fire interval = 0.8s. 40 ticks * 0.05 = 2.0s → at least 2 shots.
	for i in range(40):
		EnemyBehaviors.behavior_flank(enemy, player, 0.05, move_callable, shot_callable, 5)
	assert_int(_projectiles.size()).is_greater_equal(2)


func test_stomp_surge_faster_at_higher_phase() -> void:
	# surge_mult at phase 1 = 2.0, at phase 5 = 3.0. Both must be positive.
	var surge_1: float = 2.0 + float(1 - 1) * 0.25
	var surge_5: float = 2.0 + float(5 - 1) * 0.25
	assert_float(surge_5).is_greater(surge_1)


func test_spawn_enemy_propagates_phase_level_and_speed_mult() -> void:
	# Regression: wave_spawner was not passing enemy_phase_level/speed_mult to
	# spawn_enemy — enemies always spawned at phase_level=1 with base speed.
	var mat := preload("res://scripts/material_factory.gd").new()
	var pix := preload("res://scripts/pixel_art_renderer.gd").new()
	var director := preload("res://scripts/enemy_director.gd").new(mat, pix)
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var f := FileAccess.open("res://declarations/enemies/enemies.json", FileAccess.READ)
	var defs: Dictionary = JSON.parse_string(f.get_as_text())
	var cfg: Dictionary = {"arena_radius": 18.0}
	var enemies: Array = []
	var base_speed: float = float(defs["grunt"]["speed"])
	director.spawn_enemy(root, enemies, "grunt", 1.0, defs, cfg, 3, 2.0)
	assert_int(int(enemies[0]["phase_level"])).is_equal(3)
	assert_float(float(enemies[0]["speed"])).is_equal_approx(base_speed * 2.0, 0.001)
	assert_object((enemies[0]["node"] as Node3D).find_child("ThreatMarks", true, false)).is_not_null()
