extends GdUnitTestSuite


func test_scroll_pressure_increases_with_level() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var early := ScrollFormula.compute_scroll_pressure(2.0, 0.5, rng, [], 1)
	rng.seed = 42
	var late := ScrollFormula.compute_scroll_pressure(20.0, 0.5, rng, [], 1)
	assert_float(late).is_greater(early)


func test_scroll_pressure_capped_below_one() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var extreme := ScrollFormula.compute_scroll_pressure(9999.0, 1.0, rng, [], 6)
	assert_float(extreme).is_less_equal(0.85)


func test_lookback_without_drops_increases_pressure() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 99
	var no_lookback := ScrollFormula.compute_scroll_pressure(10.0, 0.5, rng, [], 1)
	rng.seed = 99
	var lookback_empty := ScrollFormula.compute_scroll_pressure(10.0, 0.5, rng, [
		{"scrolls_dropped": 0}, {"scrolls_dropped": 0}, {"scrolls_dropped": 0}
	], 1)
	assert_float(lookback_empty).is_greater(no_lookback)


func test_partial_reset_preserves_some_pressure() -> void:
	var reset: float = ScrollFormula.partial_reset_pressure(0.8)
	assert_float(reset).is_greater(0.0)
	assert_float(reset).is_less(0.8)


func test_roll_deterministic_with_same_seed() -> void:
	var rng_a := RandomNumberGenerator.new()
	rng_a.seed = 42
	var roll_a: bool = ScrollFormula.roll_board_object_spawn(0.5, 60.0, 120.0, rng_a)
	var rng_b := RandomNumberGenerator.new()
	rng_b.seed = 42
	var roll_b: bool = ScrollFormula.roll_board_object_spawn(0.5, 60.0, 120.0, rng_b)
	assert_bool(roll_a).is_equal(roll_b)


func test_difficulty_increases_pressure() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var easy := ScrollFormula.compute_scroll_pressure(10.0, 0.5, rng, [], 1)
	rng.seed = 42
	var hard := ScrollFormula.compute_scroll_pressure(10.0, 0.5, rng, [], 6)
	assert_float(hard).is_greater(easy)
