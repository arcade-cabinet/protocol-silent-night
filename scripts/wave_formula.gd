extends RefCounted
class_name WaveFormula

## Generates wave parameters from a run seed and level number.
## The seed creates a "pressure personality" for the run — six weights
## that determine which difficulty axes this run emphasizes.
## The level acts as a force multiplier along those axes.

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
	}


static func generate_wave(run_seed: int, level: int) -> Dictionary:
	var profile := generate_pressure_profile(run_seed)
	var rng := RandomNumberGenerator.new()
	rng.seed = run_seed + level * 7919
	var lf := float(level)
	var p_swarm := float(profile["swarm"])
	var p_speed := float(profile["speed"])
	var p_siege := float(profile["siege"])
	var p_burst := float(profile["burst"])
	var base_spawn_interval: float = 1.3 / (1.0 + lf * 0.06 * (1.0 + p_swarm * 0.7))
	var spawn_interval: float = maxf(base_spawn_interval, 0.12)
	var speed_mult: float = 1.0 + lf * 0.035 * (1.0 + p_speed * 0.6)
	var hp_scale: float = 1.0 + (lf * 0.12) * pow(lf, 0.35) * (1.0 + p_siege * 0.3)
	var damage_scale: float = 1.0 + lf * 0.08 * (1.0 + p_siege * 0.4)
	var burst_chance: float = clampf(p_burst * lf * 0.04, 0.0, 0.55)
	var burst_size: int = 3 + int(lf * 0.3 * p_burst)
	var duration: float = 16.0 + lf * 1.2 + p_siege * lf * 0.6
	var composition := _build_composition(rng, profile, level)
	var pattern := _pick_pattern(rng, profile, level)
	var is_boss_wave := (level % 10 == 0) and level > 0
	if is_boss_wave:
		duration = 999.0
	return {
		"level": level,
		"duration": duration,
		"spawn_interval": spawn_interval,
		"speed_mult": speed_mult,
		"hp_scale": hp_scale,
		"damage_scale": damage_scale,
		"composition": composition,
		"pattern": pattern,
		"burst_chance": burst_chance,
		"burst_size": burst_size,
		"is_boss_wave": is_boss_wave,
		"boss_hp_scale": 1.0 + lf * 0.05 if is_boss_wave else 0.0,
		"minion_types": ["grunt", "rusher"] if is_boss_wave else [],
		"minion_interval": maxf(2.5 - lf * 0.08, 0.6) if is_boss_wave else 0.0,
	}


static func _build_composition(
		rng: RandomNumberGenerator, profile: Dictionary, level: int
) -> Array:
	var pool: Array = []
	pool.append_array(ENEMY_POOL)
	var p_elite := float(profile["elite"])
	var elite_threshold: float = 5.0 - p_elite * 3.0
	if float(level) >= elite_threshold:
		var elite_count := mini(
			int((float(level) - elite_threshold) * 0.3 * p_elite) + 1,
			ELITE_POOL.size()
		)
		var shuffled := ELITE_POOL.duplicate()
		_shuffle_array(rng, shuffled)
		for i in range(elite_count):
			pool.append(shuffled[i])
	var weights: Array = []
	for enemy_id in pool:
		weights.append(_enemy_weight(rng, profile, level, enemy_id))
	return _weighted_selection(rng, pool, weights, mini(pool.size(), 3))


static func _enemy_weight(
		rng: RandomNumberGenerator, profile: Dictionary,
		level: int, enemy_id: String
) -> float:
	var lf := float(level)
	match enemy_id:
		"grunt":
			return 1.0 + float(profile["swarm"]) * 0.5
		"rusher":
			return 0.6 + float(profile["speed"]) * 0.8 + lf * 0.02
		"tank":
			return 0.3 + float(profile["siege"]) * 0.7 + lf * 0.03
		"elf":
			return 0.2 + float(profile["speed"]) * 0.5 + lf * 0.01
		"santa":
			return 0.15 + float(profile["siege"]) * 0.6 + lf * 0.015
		"bumble":
			return 0.1 + float(profile["elite"]) * 0.4 + lf * 0.01
		_:
			return 0.5 + rng.randf_range(0.0, 0.3)


static func _pick_pattern(
		rng: RandomNumberGenerator, profile: Dictionary, level: int
) -> String:
	if level < 3:
		return "scatter"
	var roll := rng.randf()
	var pattern_bias: float = float(profile["pattern"])
	if roll < 0.15 + pattern_bias * 0.25:
		return PATTERN_TYPES[rng.randi_range(1, PATTERN_TYPES.size() - 1)]
	return "scatter"


static func _weighted_selection(
		rng: RandomNumberGenerator, items: Array,
		weights: Array, count: int
) -> Array:
	var result: Array = []
	var available := items.duplicate()
	var available_weights := weights.duplicate()
	for _i in range(count):
		if available.is_empty():
			break
		var total := 0.0
		for w in available_weights:
			total += float(w)
		if total <= 0.0:
			break
		var pick := rng.randf() * total
		var cumulative := 0.0
		for j in range(available.size()):
			cumulative += float(available_weights[j])
			if pick <= cumulative:
				result.append(available[j])
				available.remove_at(j)
				available_weights.remove_at(j)
				break
	return result


static func _shuffle_array(rng: RandomNumberGenerator, arr: Array) -> void:
	for i in range(arr.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var tmp: Variant = arr[i]
		arr[i] = arr[j]
		arr[j] = tmp
