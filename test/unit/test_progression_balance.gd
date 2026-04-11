extends GdUnitTestSuite

## Tests for progression_manager.gd balance changes:
## - Damage/fire_rate diminishing returns (no hard cap)
## - Multiplicative health upgrades
## - Wave XP scaling in gain_xp

const PROG := preload("res://scripts/progression_manager.gd")


func _make_player_state(base_damage: float = 10.0, max_hp: float = 100.0) -> Dictionary:
	var cls := ClassResource.new()
	cls.damage = base_damage
	cls.fire_rate = 1.0
	cls.speed = 3.5
	cls.range_val = 12.0
	return {
		"class": cls,
		"hp": max_hp,
		"max_hp": max_hp,
		"aura_level": 0,
	}


# --- Damage diminishing returns ---

func test_damage_first_5_stacks_use_125_multiplier() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0)
	for i in range(5):
		prog.apply_upgrade("damage", state)
	var expected := 10.0 * pow(1.25, 5)
	assert_float(state["class"].damage).is_equal_approx(expected, 0.01)
	assert_int(state.get("damage_stacks", 0)).is_equal(5)


func test_damage_6th_stack_uses_110_multiplier() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0)
	for i in range(5):
		prog.apply_upgrade("damage", state)
	var before_sixth := float(state["class"].damage)
	prog.apply_upgrade("damage", state)
	assert_float(state["class"].damage).is_equal_approx(before_sixth * 1.10, 0.01)
	assert_int(state.get("damage_stacks", 0)).is_equal(6)


func test_damage_no_hard_cap_allows_10_stacks() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0)
	for i in range(10):
		prog.apply_upgrade("damage", state)
	assert_int(state.get("damage_stacks", 0)).is_equal(10)
	assert_float(state["class"].damage).is_greater(10.0)


# --- Fire rate diminishing returns ---

func test_fire_rate_first_5_stacks_use_082_multiplier() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state()
	for i in range(5):
		prog.apply_upgrade("fire_rate", state)
	var expected := 1.0 * pow(0.82, 5)
	assert_float(state["class"].fire_rate).is_equal_approx(expected, 0.001)


func test_fire_rate_6th_stack_uses_092_multiplier() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state()
	for i in range(5):
		prog.apply_upgrade("fire_rate", state)
	var before_sixth := float(state["class"].fire_rate)
	prog.apply_upgrade("fire_rate", state)
	assert_float(state["class"].fire_rate).is_equal_approx(before_sixth * 0.92, 0.001)


func test_fire_rate_no_hard_cap_allows_10_stacks() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state()
	for i in range(10):
		prog.apply_upgrade("fire_rate", state)
	assert_int(state.get("fire_rate_stacks", 0)).is_equal(10)
	# Interval should be well below base but > 0
	assert_float(state["class"].fire_rate).is_greater(0.0)
	assert_float(state["class"].fire_rate).is_less(1.0)


# --- Multiplicative health ---

func test_health_upgrade_increases_max_hp_by_25_percent() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0, 100.0)
	prog.apply_upgrade("health", state)
	assert_float(state["max_hp"]).is_equal_approx(125.0, 0.01)


func test_health_upgrade_heals_player_by_increase_amount() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0, 100.0)
	state["hp"] = 60.0  # damaged
	prog.apply_upgrade("health", state)
	# max_hp 125, hp was 60 + 25 increase = 85 (capped at 125)
	assert_float(state["hp"]).is_equal_approx(85.0, 0.01)


func test_health_upgrade_minimum_25_hp_for_tiny_max_hp() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0, 40.0)
	state["hp"] = 40.0
	prog.apply_upgrade("health", state)
	# 25% of 40 = 10, but minimum is 25 — should increase by 25
	assert_float(state["max_hp"]).is_equal_approx(65.0, 0.01)


func test_health_scales_with_repeated_upgrades() -> void:
	var prog: RefCounted = PROG.new()
	var state := _make_player_state(10.0, 100.0)
	prog.apply_upgrade("health", state)  # 100 → 125
	prog.apply_upgrade("health", state)  # 125 → 156.25
	assert_float(state["max_hp"]).is_greater(150.0)
