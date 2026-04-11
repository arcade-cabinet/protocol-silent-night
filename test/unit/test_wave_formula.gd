extends GdUnitTestSuite


func test_same_seed_produces_same_profile() -> void:
	var a := WaveFormula.generate_pressure_profile(42)
	var b := WaveFormula.generate_pressure_profile(42)
	assert_float(a["swarm"]).is_equal(b["swarm"])
	assert_float(a["speed"]).is_equal(b["speed"])
	assert_float(a["elite"]).is_equal(b["elite"])


func test_different_seeds_produce_different_profiles() -> void:
	var a := WaveFormula.generate_pressure_profile(100)
	var b := WaveFormula.generate_pressure_profile(200)
	var same_count := 0
	for key in a.keys():
		if is_equal_approx(float(a[key]), float(b[key])):
			same_count += 1
	assert_int(same_count).is_less(a.size())


func test_wave_determinism() -> void:
	var a := WaveFormula.generate_wave(1225, 5)
	var b := WaveFormula.generate_wave(1225, 5)
	assert_float(a["spawn_interval"]).is_equal(b["spawn_interval"])
	assert_float(a["hp_scale"]).is_equal(b["hp_scale"])
	assert_str(JSON.stringify(a["composition"])).is_equal(JSON.stringify(b["composition"]))


func test_difficulty_scales_superlinearly() -> void:
	var wave_5 := WaveFormula.generate_wave(99, 5)
	var wave_15 := WaveFormula.generate_wave(99, 15)
	var wave_50 := WaveFormula.generate_wave(99, 50)
	assert_float(wave_15["hp_scale"]).is_greater(wave_5["hp_scale"] * 2.0)
	assert_float(wave_50["hp_scale"]).is_greater(wave_15["hp_scale"] * 3.0)
	assert_float(wave_50["spawn_interval"]).is_less(wave_5["spawn_interval"])


func test_spawn_interval_has_minimum_floor() -> void:
	var extreme := WaveFormula.generate_wave(42, 999)
	assert_float(extreme["spawn_interval"]).is_greater_equal(0.12)


func test_boss_pressure_increases_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 2)
	var late := WaveFormula.generate_wave(42, 20)
	assert_float(late["boss_pressure"]).is_greater(early["boss_pressure"])


func test_boss_pressure_capped_below_one() -> void:
	var extreme := WaveFormula.generate_wave(42, 999)
	assert_float(extreme["boss_pressure"]).is_less_equal(1.0)


func test_is_boss_wave_true_at_level_10() -> void:
	# Level 10 always exceeds the 0.35 boss_pressure threshold
	var wave := WaveFormula.generate_wave(42, 10)
	assert_bool(bool(wave["is_boss_wave"])).is_true()


func test_is_boss_wave_false_at_level_1() -> void:
	# Level 1 never reaches the 0.35 boss_pressure threshold
	var wave := WaveFormula.generate_wave(42, 1)
	assert_bool(bool(wave["is_boss_wave"])).is_false()


func test_countdown_timer_decreases_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 1)
	var late := WaveFormula.generate_wave(42, 30)
	assert_float(early["countdown"]).is_greater(late["countdown"])
	assert_float(late["countdown"]).is_greater_equal(30.0)
	assert_float(early["countdown"]).is_less_equal(180.0)


func test_lookback_increases_boss_pressure() -> void:
	var no_lookback := WaveFormula.generate_wave(42, 3, [])
	var lookback_no_bosses := WaveFormula.generate_wave(42, 3, [
		{"bosses_spawned": 0}, {"bosses_spawned": 0}, {"bosses_spawned": 0}
	])
	assert_float(lookback_no_bosses["boss_pressure"]).is_greater(no_lookback["boss_pressure"])


func test_composition_includes_elites_at_higher_levels() -> void:
	var early := WaveFormula.generate_wave(42, 2)
	var late := WaveFormula.generate_wave(42, 20)
	var elite_set := ["elf", "santa", "bumble"]
	var early_has_elite := false
	for enemy_id in early["composition"]:
		if enemy_id in elite_set:
			early_has_elite = true
	var late_has_elite := false
	for enemy_id in late["composition"]:
		if enemy_id in elite_set:
			late_has_elite = true
	assert_bool(early_has_elite).is_false()
	assert_bool(late_has_elite).is_true()


func test_level_zero_produces_valid_wave() -> void:
	var wave := WaveFormula.generate_wave(1, 0)
	assert_float(wave["spawn_interval"]).is_greater(0.0)
	assert_float(wave["hp_scale"]).is_greater_equal(1.0)
	assert_int(wave["composition"].size()).is_greater(0)
	assert_float(wave["countdown"]).is_greater(0.0)


func test_enemy_phase_level_present_in_wave() -> void:
	var wave := WaveFormula.generate_wave(42, 5)
	assert_bool(wave.has("enemy_phase_level")).is_true()
	assert_int(wave["enemy_phase_level"]).is_between(1, 5)


func test_enemy_phase_level_increases_with_level_and_difficulty() -> void:
	var early := WaveFormula.generate_wave(42, 4, [], 1)
	var late := WaveFormula.generate_wave(42, 40, [], 1)
	assert_int(late["enemy_phase_level"]).is_greater(early["enemy_phase_level"])


func test_enemy_phase_level_clamped_1_to_5() -> void:
	var low := WaveFormula.generate_wave(1, 0)
	var extreme := WaveFormula.generate_wave(1, 999, [], 5)
	assert_int(low["enemy_phase_level"]).is_equal(1)
	assert_int(extreme["enemy_phase_level"]).is_equal(5)


func test_scroll_pressure_present_in_wave() -> void:
	var wave := WaveFormula.generate_wave(42, 5)
	assert_bool(wave.has("scroll_pressure")).is_true()
	assert_float(float(wave["scroll_pressure"])).is_between(0.0, 1.0)


func test_scroll_pressure_increases_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 1)
	var late := WaveFormula.generate_wave(42, 20)
	assert_float(float(late["scroll_pressure"])).is_greater_equal(float(early["scroll_pressure"]))


func test_max_bosses_scales_with_boss_pressure() -> void:
	var low := WaveFormula.generate_wave(42, 1)
	var high := WaveFormula.generate_wave(42, 30)
	assert_int(int(high["max_bosses"])).is_greater_equal(int(low["max_bosses"]))


func test_burst_chance_and_size_present_in_wave() -> void:
	var wave := WaveFormula.generate_wave(42, 10)
	assert_bool(wave.has("burst_chance")).is_true()
	assert_bool(wave.has("burst_size")).is_true()
	assert_float(float(wave["burst_chance"])).is_between(0.0, 0.55)
	assert_int(int(wave["burst_size"])).is_greater_equal(3)


func test_burst_chance_grows_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 1)
	var late := WaveFormula.generate_wave(42, 30)
	assert_float(float(late["burst_chance"])).is_greater(float(early["burst_chance"]))


func test_speed_mult_increases_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 1)
	var late := WaveFormula.generate_wave(42, 20)
	assert_float(float(late["speed_mult"])).is_greater(float(early["speed_mult"]))
	assert_float(float(early["speed_mult"])).is_greater_equal(1.0)


func test_speed_mult_scales_with_difficulty() -> void:
	var easy := WaveFormula.generate_wave(42, 10, [], 1)
	var hard := WaveFormula.generate_wave(42, 10, [], 6)
	assert_float(float(hard["speed_mult"])).is_greater(float(easy["speed_mult"]))


func test_damage_scale_increases_with_level() -> void:
	var early := WaveFormula.generate_wave(42, 1)
	var late := WaveFormula.generate_wave(42, 20)
	assert_float(float(late["damage_scale"])).is_greater(float(early["damage_scale"]))
	assert_float(float(early["damage_scale"])).is_greater_equal(1.0)


func test_damage_scale_scales_with_difficulty() -> void:
	var easy := WaveFormula.generate_wave(42, 10, [], 1)
	var hard := WaveFormula.generate_wave(42, 10, [], 6)
	assert_float(float(hard["damage_scale"])).is_greater(float(easy["damage_scale"]))
