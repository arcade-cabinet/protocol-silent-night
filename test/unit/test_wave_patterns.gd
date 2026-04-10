extends GdUnitTestSuite

## Tests for wave_spawner.gd pattern-based spawn positions and burst spawning.

const SPAWNER := preload("res://scripts/wave_spawner.gd")

const ARENA_RADIUS := 18.0


func _ring_positions(count: int) -> Array:
	var spawner: RefCounted = SPAWNER.new(null)
	var positions: Array = []
	for i in range(count):
		positions.append(spawner._pattern_position("ring", i, count, ARENA_RADIUS))
	return positions


func _scatter_positions(count: int) -> Array:
	var spawner: RefCounted = SPAWNER.new(null)
	var positions: Array = []
	for i in range(count):
		positions.append(spawner._pattern_position("scatter", i, count, ARENA_RADIUS))
	return positions


# --- Ring pattern ---

func test_ring_positions_are_evenly_spaced() -> void:
	var positions := _ring_positions(4)
	assert_int(positions.size()).is_equal(4)
	# All should be at the same radius (~28.8 = 18 * 1.6)
	var expected_r := ARENA_RADIUS * 1.6
	for pos in positions:
		var v := pos as Vector3
		var dist := Vector2(v.x, v.z).length()
		assert_float(dist).is_equal_approx(expected_r, 0.01)


func test_ring_all_at_y_058() -> void:
	var positions := _ring_positions(6)
	for pos in positions:
		assert_float(float((pos as Vector3).y)).is_equal_approx(0.58, 0.001)


func test_ring_4_positions_are_perpendicular() -> void:
	var positions := _ring_positions(4)
	# With 4 enemies in a ring, angles should be 0, 90, 180, 270 degrees.
	# Dot product of adjacent vectors should be ~0.
	var p0 := Vector2((positions[0] as Vector3).x, (positions[0] as Vector3).z).normalized()
	var p1 := Vector2((positions[1] as Vector3).x, (positions[1] as Vector3).z).normalized()
	assert_float(abs(p0.dot(p1))).is_less(0.01)


# --- Flanking pattern ---

func test_flanking_even_and_odd_are_opposite_sides() -> void:
	var spawner: RefCounted = SPAWNER.new(null)
	# Even index: angle ~+PI/2, Odd index: angle ~-PI/2
	var even_pos := spawner._pattern_position("flanking", 0, 4, ARENA_RADIUS) as Vector3
	var odd_pos := spawner._pattern_position("flanking", 1, 4, ARENA_RADIUS) as Vector3
	# Even and odd should be on opposite sides (x signs differ significantly)
	# PI/2 → x≈0, z≈r; -PI/2 → x≈0, z≈-r
	# Check z component has opposite sign
	assert_bool(signf(even_pos.z) != signf(odd_pos.z)).is_true()


# --- Scatter pattern ---

func test_scatter_all_at_spawn_radius() -> void:
	var positions := _scatter_positions(8)
	var expected_r := ARENA_RADIUS * 1.6
	for pos in positions:
		var v := pos as Vector3
		var dist := Vector2(v.x, v.z).length()
		assert_float(dist).is_equal_approx(expected_r, 0.01)


func test_scatter_positions_have_variance() -> void:
	# If scatter gives random angles, two positions should not be identical.
	var positions := _scatter_positions(8)
	var all_same := true
	var first := positions[0] as Vector3
	for i in range(1, positions.size()):
		var p := positions[i] as Vector3
		if not p.is_equal_approx(first):
			all_same = false
			break
	assert_bool(all_same).is_false()


# --- Spiral ---

func test_spiral_positions_rotate_each_call() -> void:
	var spawner: RefCounted = SPAWNER.new(null)
	var p0 := spawner._pattern_position("spiral", 0, 1, ARENA_RADIUS) as Vector3
	var p1 := spawner._pattern_position("spiral", 0, 1, ARENA_RADIUS) as Vector3
	# Each call advances the spiral angle, so positions should differ.
	assert_bool(p0.is_equal_approx(p1)).is_false()


# --- Wedge ---

func test_wedge_positions_cluster_in_one_arc() -> void:
	var spawner: RefCounted = SPAWNER.new(null)
	var angles: Array = []
	for i in range(5):
		var pos := spawner._pattern_position("wedge", i, 5, ARENA_RADIUS) as Vector3
		angles.append(atan2(pos.z, pos.x))
	# All angles should be within PI/2 + tolerance of each other (small arc).
	var min_a: float = float(angles[0])
	var max_a: float = float(angles[0])
	for a in angles:
		min_a = minf(min_a, float(a))
		max_a = maxf(max_a, float(a))
	assert_float(max_a - min_a).is_less(PI / 2.0 + 0.3)
