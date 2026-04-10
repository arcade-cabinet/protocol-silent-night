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


# --- Krampus HSM ---

func test_krampus_hsm_phase_dispatch() -> void:
	assert_str(EnemyBehaviors.behavior_krampus_hsm(1)).is_equal("circle_strafe")
	assert_str(EnemyBehaviors.behavior_krampus_hsm(2)).is_equal("charge_ranged")
	assert_str(EnemyBehaviors.behavior_krampus_hsm(3)).is_equal("rapid_charge_multishot")


func test_krampus_circle_strafe_dir_has_tangential_component() -> void:
	# Boss at origin, player at (10, 0, 0) — ORBIT_RADIUS distance
	# Direction should be roughly perpendicular (tangential) to the radial
	var dir := BossBTHelpers.circle_strafe_dir(Vector3.ZERO, Vector3(10.0, 0.0, 0.0))
	assert_float(dir.length()).is_between(0.99, 1.01)
	# At exactly orbit radius, radial_bias = 0 → direction is pure tangent (z-axis)
	assert_float(absf(dir.z)).is_greater(0.5)


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
