extends RefCounted
class_name WaveFormula

## Level generation with boss pressure accumulator and countdown timer.
## No separate boss waves — Krampus appears within normal levels via
## escalating PRNG probability with lookback memory.

const ENEMY_POOL := ["grunt", "rusher", "tank"]
const ELITE_POOL := ["elf", "santa", "bumble"]
const PATTERN_TYPES := ["scatter", "ring", "wedge", "flanking", "spiral"]


static func generate_pressure_profile(run_seed: int) -> Dictionary:
	var rng := RandomNumberGenerator.new()
	rng.seed = run_seed
	return {
		"swarm": rng.randf_range(0.3, 1.0),
		"speed": rng.randf_range(0.2, 1.0),
		"pattern": rng.randf_range(0.1, 0.9),
		"elite": rng.randf_range(0.1, 0.8),
		"burst": rng.randf_range(0.15, 0.85),
		"siege": rng.randf_range(0.2, 0.9),
		"boss_affinity": rng.randf_range(0.15, 0.6),
		"scroll": rng.randf_range(0.2, 0.9),
	}


static func generate_wave(run_seed: int, level: int, lookback: Array = [], difficulty: int = 1) -> Dictionary:
	var profile := generate_pressure_profile(run_seed)
	var rng := RandomNumberGenerator.new()
	rng.seed = run_seed + level * 7919
	var lf := float(maxi(level, 0))
	var df := float(clampi(difficulty, 1, 6))
	var p_swarm := float(profile["swarm"])
	var p_speed := float(profile["speed"])
	var p_siege := float(profile["siege"])
	var p_burst := float(profile["burst"])
	var p_boss := float(profile["boss_affinity"])
	var base_spawn_interval: float = 1.3 / (1.0 + lf * 0.06 * df * (1.0 + p_swarm * 0.7))
	var spawn_interval: float = maxf(base_spawn_interval, 0.12)
	var speed_mult: float = 1.0 + lf * 0.035 * df * (1.0 + p_speed * 0.6)
	var hp_scale: float = 1.0 + (lf * 0.12) * pow(lf, 0.35) * df * (1.0 + p_siege * 0.3)
	var damage_scale: float = 1.0 + lf * 0.08 * df * (1.0 + p_siege * 0.4)
	var burst_chance: float = clampf(p_burst * lf * 0.04 * df, 0.0, 0.55)
	var burst_size: int = 3 + int(lf * 0.3 * p_burst * df)
	var countdown: float = clampf(120.0 - lf * 2.5 * df + rng.randf_range(-10.0, 10.0), 30.0, 180.0)
	var boss_pressure: float = _compute_boss_pressure(lf * df, p_boss, rng, lookback)
	var max_bosses: int = 1 + int(boss_pressure / 0.6)
	var composition := _build_composition(rng, profile, level)
	var pattern := _pick_pattern(rng, profile, level)
	var enemy_phase_level: int = clampi(1 + int(lf * df / 8.0), 1, 5)
	return {
		"level": level,
		"countdown": countdown,
		"spawn_interval": spawn_interval,
		"speed_mult": speed_mult,
		"hp_scale": hp_scale,
		"damage_scale": damage_scale,
		"composition": composition,
		"pattern": pattern,
		"burst_chance": burst_chance,
		"burst_size": burst_size,
		"boss_pressure": boss_pressure,
		"max_bosses": max_bosses,
		"boss_hp_scale": 1.0 + lf * 0.06,
		"enemy_phase_level": enemy_phase_level,
		"scroll_pressure": ScrollFormula.compute_scroll_pressure(lf * df, float(profile["scroll"]), rng, lookback, difficulty),
	}


static func _compute_boss_pressure(lf: float, p_boss: float,
		rng: RandomNumberGenerator, lookback: Array) -> float:
	var base: float = lf * 0.02 * (1.0 + p_boss * 0.8)
	var growth: float = pow(lf * 0.08, 1.4) * p_boss
	var lookback_bonus := 0.0
	for prev in lookback:
		var prev_bosses := int(prev.get("bosses_spawned", 0))
		if prev_bosses == 0:
			lookback_bonus += 0.04
		else:
			lookback_bonus -= 0.02
	var noise: float = rng.randf_range(-0.05, 0.08)
	return clampf(base + growth + lookback_bonus + noise, 0.0, 0.95)


static func roll_boss_spawn(boss_pressure: float, elapsed: float,
		countdown: float, rng: RandomNumberGenerator) -> bool:
	var time_factor: float = clampf(elapsed / maxf(countdown, 1.0), 0.0, 1.0)
	var effective: float = boss_pressure * (0.3 + time_factor * 0.7)
	return rng.randf() < effective * 0.02


static func _build_composition(rng: RandomNumberGenerator,
		profile: Dictionary, level: int) -> Array:
	var pool: Array = []
	pool.append_array(ENEMY_POOL)
	var p_elite := float(profile["elite"])
	var elite_threshold: float = 5.0 - p_elite * 3.0
	if float(level) >= elite_threshold:
		var elite_count := mini(
			int((float(level) - elite_threshold) * 0.3 * p_elite) + 1,
			ELITE_POOL.size())
		var shuffled := ELITE_POOL.duplicate()
		_shuffle_array(rng, shuffled)
		for i in range(elite_count):
			pool.append(shuffled[i])
	var weights: Array = []
	for enemy_id in pool:
		weights.append(_enemy_weight(rng, profile, level, enemy_id))
	return _weighted_selection(rng, pool, weights, mini(pool.size(), 3))


static func _enemy_weight(rng: RandomNumberGenerator,
		profile: Dictionary, level: int, enemy_id: String) -> float:
	var lf := float(level)
	match enemy_id:
		"grunt": return 1.0 + float(profile["swarm"]) * 0.5
		"rusher": return 0.6 + float(profile["speed"]) * 0.8 + lf * 0.02
		"tank": return 0.3 + float(profile["siege"]) * 0.7 + lf * 0.03
		"elf": return 0.2 + float(profile["speed"]) * 0.5 + lf * 0.01
		"santa": return 0.15 + float(profile["siege"]) * 0.6 + lf * 0.015
		"bumble": return 0.1 + float(profile["elite"]) * 0.4 + lf * 0.01
		_: return 0.5 + rng.randf_range(0.0, 0.3)


static func _pick_pattern(rng: RandomNumberGenerator,
		profile: Dictionary, level: int) -> String:
	if level < 3:
		return "scatter"
	var pattern_bias: float = float(profile["pattern"])
	if rng.randf() < 0.15 + pattern_bias * 0.25:
		return PATTERN_TYPES[rng.randi_range(1, PATTERN_TYPES.size() - 1)]
	return "scatter"


static func _weighted_selection(rng: RandomNumberGenerator,
		items: Array, weights: Array, count: int) -> Array:
	var result: Array = []
	var available := items.duplicate()
	var avail_w := weights.duplicate()
	for _i in range(count):
		if available.is_empty(): break
		var total := 0.0
		for w in avail_w: total += float(w)
		if total <= 0.0: break
		var pick := rng.randf() * total
		var cum := 0.0
		for j in range(available.size()):
			cum += float(avail_w[j])
			if pick <= cum:
				result.append(available[j])
				available.remove_at(j)
				avail_w.remove_at(j)
				break
	return result


static func _shuffle_array(rng: RandomNumberGenerator, arr: Array) -> void:
	for i in range(arr.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var tmp: Variant = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp
