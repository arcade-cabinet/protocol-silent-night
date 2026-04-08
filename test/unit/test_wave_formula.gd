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


func test_boss_wave_every_ten_levels() -> void:
	var wave_10 := WaveFormula.generate_wave(42, 10)
	var wave_11 := WaveFormula.generate_wave(42, 11)
	var wave_20 := WaveFormula.generate_wave(42, 20)
	assert_bool(wave_10["is_boss_wave"]).is_true()
	assert_bool(wave_11["is_boss_wave"]).is_false()
	assert_bool(wave_20["is_boss_wave"]).is_true()


func test_boss_wave_has_minion_pressure() -> void:
	var boss := WaveFormula.generate_wave(42, 10)
	assert_bool(boss["is_boss_wave"]).is_true()
	assert_int(boss["minion_types"].size()).is_greater(0)
	assert_float(boss["minion_interval"]).is_greater(0.0)


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
