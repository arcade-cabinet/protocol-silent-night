extends GdUnitTestSuite
# Unit tests for grunt/rusher/tank BT state machines and Krampus HSM helpers.
# All tick functions are pure RefCounted — no scene tree needed.

const EnemyBTStates := preload("res://scripts/enemy_bt_states.gd")
const EnemyBehaviors := preload("res://scripts/enemy_behaviors.gd")
const BossBTHelpers := preload("res://scripts/boss_bt_helpers.gd")


var _telegraphs: Array = []


func before_test() -> void:
	_telegraphs = []


func _make_node(pos: Vector3) -> Node3D:
	var n := Node3D.new()
	n.scale = Vector3.ONE
	n.position = pos
	add_child(n)
	return n


func _make_enemy(id: String, pos: Vector3) -> Dictionary:
	return {
		"id": id,
		"node": _make_node(pos),
		"hp": 10.0,
		"speed": 3.0,
		"behavior_timer": 0.0,
		"behavior_state": "chase" if id == "grunt" else ("idle" if id == "rusher" else "advance"),
		"enemy_uid": 42,
	}


func _record_telegraph(enemy_id: String, position: Vector3) -> void:
	_telegraphs.append({"id": enemy_id, "pos": position})


# --- Phase-level scaling ---

func test_grunt_phase2_aggro_reaches_player_at_13() -> void:
	var enemy := _make_enemy("grunt", Vector3(0, 0, 0))
	# Phase 1 aggro = 12.0, phase 2 aggro = 14.0 — player at 13 should only chase at phase 2
	var player_pos := Vector3(13.0, 0.0, 0.0)
	assert_str(EnemyBTStates.grunt_tick(enemy, player_pos, 0.05, 1)).is_equal("wander")
	assert_str(EnemyBTStates.grunt_tick(enemy, player_pos, 0.05, 2)).is_equal("chase")


func test_rusher_phase2_shorter_cooldown() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0, 0))
	# Put into cooldown state
	enemy["behavior_state"] = "cooldown"
	enemy["behavior_timer"] = 0.0
	# Phase 1 cooldown = 0.9s; phase 2 cooldown = 0.75s. Tick 0.8s: should exit at phase 2 but not phase 1.
	EnemyBTStates.rusher_tick(enemy, Vector3(10.0, 0.0, 0.0), 0.8, Callable(), 2)
	assert_str(String(enemy["behavior_state"])).is_equal("idle")


func test_rusher_phase1_cooldown_not_expired_at_0_8s() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0, 0))
	enemy["behavior_state"] = "cooldown"
	enemy["behavior_timer"] = 0.0
	EnemyBTStates.rusher_tick(enemy, Vector3(10.0, 0.0, 0.0), 0.8, Callable(), 1)
	assert_str(String(enemy["behavior_state"])).is_equal("cooldown")


func test_tank_phase2_slam_mult_higher() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	enemy["behavior_state"] = "slam"
	EnemyBTStates.tank_tick(enemy, Vector3(4.0, 0.0, 0.0), 0.05, Callable(), 2)
	# Phase 2: 1.8 + 0.3 = 2.1
	assert_float(float(enemy.get("slam_damage_mult", 0.0))).is_equal_approx(2.1, 0.01)


func test_tank_phase3_prep_duration_shorter() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	enemy["behavior_state"] = "prep_slam"
	# Phase 3 prep = max(0.5 - 0.16, 0.2) = 0.34s. Tick 0.35s should transition to slam.
	var state := EnemyBTStates.tank_tick(enemy, Vector3(3.0, 0.0, 0.0), 0.35, Callable(), 3)
	assert_str(state).is_equal("slam")


# --- Grunt ---

func test_grunt_enters_chase_when_player_close() -> void:
	var enemy := _make_enemy("grunt", Vector3(0, 0, 0))
	# Player within aggro_radius (12.0)
	var player_pos := Vector3(8.0, 0.0, 0.0)
	var state := EnemyBTStates.grunt_tick(enemy, player_pos, 0.05)
	assert_str(state).is_equal("chase")


func test_grunt_wanders_when_player_far() -> void:
	var enemy := _make_enemy("grunt", Vector3(0, 0, 0))
	# Player beyond aggro_radius (12.0)
	var player_pos := Vector3(20.0, 0.0, 0.0)
	var state := EnemyBTStates.grunt_tick(enemy, player_pos, 0.05)
	assert_str(state).is_equal("wander")


func test_grunt_wander_direction_is_normalized() -> void:
	var enemy := _make_enemy("grunt", Vector3(0, 0, 0))
	var dir := EnemyBTStates.grunt_wander_direction(enemy, 0.1)
	assert_float(dir.length()).is_between(0.99, 1.01)


# --- Rusher ---

func test_rusher_bursts_when_player_in_range() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0, 0))
	# Player within burst range (14.0)
	var player_pos := Vector3(10.0, 0.0, 0.0)
	var state := EnemyBTStates.rusher_tick(enemy, player_pos, 0.05, Callable())
	assert_str(state).is_equal("burst")


func test_rusher_cooldown_after_burst() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0, 0))
	var player_pos := Vector3(10.0, 0.0, 0.0)
	# Enter burst first
	EnemyBTStates.rusher_tick(enemy, player_pos, 0.05, Callable())
	assert_str(String(enemy["behavior_state"])).is_equal("burst")
	# Advance timer past burst duration (0.6s)
	var state := EnemyBTStates.rusher_tick(enemy, player_pos, 0.65, Callable())
	assert_str(state).is_equal("cooldown")


func test_rusher_fires_telegraph_on_burst_entry() -> void:
	var enemy := _make_enemy("rusher", Vector3(0, 0, 0))
	var player_pos := Vector3(10.0, 0.0, 0.0)
	EnemyBTStates.rusher_tick(enemy, player_pos, 0.05, Callable(self, "_record_telegraph"))
	assert_int(_telegraphs.size()).is_equal(1)
	assert_str(_telegraphs[0]["id"]).is_equal("rusher")


# --- Tank ---

func test_tank_slam_damage_mult() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	# Manually put tank in slam state
	enemy["behavior_state"] = "slam"
	EnemyBTStates.tank_tick(enemy, Vector3(4.0, 0.0, 0.0), 0.05, Callable())
	assert_float(float(enemy.get("slam_damage_mult", 0.0))).is_equal(EnemyBTStates.TANK_SLAM_DAMAGE_MULT)


func test_tank_stagger_after_slam() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	enemy["behavior_state"] = "slam"
	# Advance past slam duration (0.3s)
	var state := EnemyBTStates.tank_tick(enemy, Vector3(4.0, 0.0, 0.0), 0.4, Callable())
	assert_str(state).is_equal("stagger")


func test_tank_enters_prep_slam_when_close() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	# Player within prep range (5.0)
	var player_pos := Vector3(3.0, 0.0, 0.0)
	var state := EnemyBTStates.tank_tick(enemy, player_pos, 0.05, Callable())
	assert_str(state).is_equal("prep_slam")


func test_tank_telegraph_fires_on_prep_slam_expiry() -> void:
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	enemy["behavior_state"] = "prep_slam"
	var player_pos := Vector3(3.0, 0.0, 0.0)
	var telegraphs: Array = []
	var tcb := func(id: String, pos: Vector3) -> void: telegraphs.append(id)
	# Advance past TANK_PREP_DURATION (0.5s)
	var state := EnemyBTStates.tank_tick(enemy, player_pos, 0.6, tcb)
	assert_str(state).is_equal("slam")
	assert_int(telegraphs.size()).is_equal(1)
	assert_str(telegraphs[0]).is_equal("tank")


# --- Krampus HSM ---

func test_krampus_hsm_phase_dispatch() -> void:
	assert_str(EnemyBehaviors.behavior_krampus_hsm(1)).is_equal("circle_strafe")
	assert_str(EnemyBehaviors.behavior_krampus_hsm(2)).is_equal("charge_ranged")
	assert_str(EnemyBehaviors.behavior_krampus_hsm(3)).is_equal("rapid_charge_multishot")


func test_tank_slam_mult_applied_in_contact_damage() -> void:
	# Regression: slam_damage_mult was set by tank_tick but never read in enemy_director.
	# Verify the 1.8× multiplier reaches the on_damage_player callback.
	var mat := preload("res://scripts/material_factory.gd").new()
	var pix := preload("res://scripts/pixel_art_renderer.gd").new()
	var director := preload("res://scripts/enemy_director.gd").new(mat, pix)
	var tank := _make_enemy("tank", Vector3(0.5, 0.0, 0.0))
	tank["contact_damage"] = 10.0
	tank["behavior_state"] = "slam"
	# Start timer at TANK_SLAM_DURATION so this tick sets slam_damage_mult then transitions
	# to stagger (no on_move_actor call needed — stagger has no movement).
	tank["behavior_timer"] = EnemyBTStates.TANK_SLAM_DURATION
	var player: Node3D = auto_free(Node3D.new())
	player.position = Vector3.ZERO
	add_child(player)
	var damage_received: Array = [0.0]
	var on_damage := func(amt: float) -> void: damage_received[0] += amt
	var enemies: Array = [tank]
	var delta := 0.1
	director.update_enemies(delta, enemies, {}, player, Callable(), on_damage, Callable(), 1.0)
	# With slam_damage_mult=1.8: 10.0 * 0.1 * 2.0 * 1.8 = 3.6
	assert_float(damage_received[0]).is_equal_approx(3.6, 0.05)


func test_tank_slam_mult_cleared_in_stagger_state() -> void:
	# Regression: slam_damage_mult was never reset after slam→stagger transition,
	# causing 1.8× contact damage to persist indefinitely after each slam.
	var enemy := _make_enemy("tank", Vector3(0, 0, 0))
	enemy["behavior_state"] = "slam"
	# Tick 1: timer at SLAM_DURATION → transitions to stagger, mult still 1.8 (slam frame)
	enemy["behavior_timer"] = EnemyBTStates.TANK_SLAM_DURATION
	EnemyBTStates.tank_tick(enemy, Vector3(4.0, 0.0, 0.0), 0.01, Callable())
	assert_str(String(enemy["behavior_state"])).is_equal("stagger")
	# Tick 2: first stagger tick — mult must be reset to 1.0
	EnemyBTStates.tank_tick(enemy, Vector3(4.0, 0.0, 0.0), 0.01, Callable())
	assert_float(float(enemy.get("slam_damage_mult", 1.0))).is_equal_approx(1.0, 0.001)


func test_krampus_circle_strafe_dir_has_tangential_component() -> void:
	# Boss at origin, player at (10, 0, 0) — ORBIT_RADIUS distance
	# Direction should be roughly perpendicular (tangential) to the radial
	var dir := BossBTHelpers.circle_strafe_dir(Vector3.ZERO, Vector3(10.0, 0.0, 0.0))
	assert_float(dir.length()).is_between(0.99, 1.01)
	# At exactly orbit radius, radial_bias = 0 → direction is pure tangent (z-axis)
	assert_float(absf(dir.z)).is_greater(0.5)


func test_spawn_enemy_applies_speed_mult() -> void:
	# Verify speed_mult from wave params is baked into the spawned enemy dict.
	var mat := preload("res://scripts/material_factory.gd").new()
	var pix := preload("res://scripts/pixel_art_renderer.gd").new()
	var director := preload("res://scripts/enemy_director.gd").new(mat, pix)
	var config := {"arena_radius": 12.0}
	var enemy_defs := preload("res://scripts/enemy_director.gd").new(mat, pix)
	# Use grunt def directly from declarations
	var defs := {"grunt": {"max_hp": 24.0, "speed": 3.4, "contact_damage": 9.0, "scale": 0.75, "drop_xp": 1, "drop_cookies": 0, "color": "#ffffff"}}
	var root := auto_free(Node3D.new())
	add_child(root)
	var enemies: Array = []
	director.spawn_enemy(root, enemies, "grunt", 1.0, defs, config, 1, 2.0, 1.5)
	assert_int(enemies.size()).is_equal(1)
	assert_float(float(enemies[0]["speed"])).is_equal_approx(3.4 * 2.0, 0.01)
	assert_float(float(enemies[0]["contact_damage"])).is_equal_approx(9.0 * 1.5, 0.01)


func test_krampus_charge_tick_fires_after_interval() -> void:
	var boss_ref: Dictionary = {}
	var interval := 2.0
	var triggered := false
	# Advance in small steps until charge triggers
	for _i in range(200):
		if BossBTHelpers.charge_tick(boss_ref, 0.016, interval):
			triggered = true
			break
	assert_bool(triggered).is_true()
	assert_bool(BossBTHelpers.is_charging(boss_ref)).is_true()
	# After CHARGE_DURATION ticks, should no longer be charging
	BossBTHelpers.update_charge_phase(boss_ref, BossBTHelpers.CHARGE_DURATION + 0.01)
	assert_bool(BossBTHelpers.is_charging(boss_ref)).is_false()
