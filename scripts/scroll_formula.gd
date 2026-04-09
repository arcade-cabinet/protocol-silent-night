extends RefCounted
class_name ScrollFormula

## PRNG-driven scroll pressure accumulator.
## Same pattern as boss_pressure — no fixed cadences.
## Scroll pressure grows with level + PRNG + lookback memory.


static func compute_scroll_pressure(level_f: float, profile_scroll: float,
		rng: RandomNumberGenerator, lookback: Array, difficulty: int) -> float:
	var base: float = level_f * 0.025 * (1.0 + profile_scroll * 0.6)
	var growth: float = pow(level_f * 0.06, 1.3) * profile_scroll
	var lookback_bonus := 0.0
	for prev in lookback:
		if int(prev.get("scrolls_dropped", 0)) == 0:
			lookback_bonus += 0.05
		else:
			lookback_bonus -= 0.015
	var diff_bonus: float = float(difficulty) * 0.008
	var noise: float = rng.randf_range(-0.04, 0.06)
	return clampf(base + growth + lookback_bonus + diff_bonus + noise, 0.0, 0.85)


static func roll_board_object_spawn(scroll_pressure: float, elapsed: float,
		countdown: float, rng: RandomNumberGenerator) -> bool:
	var time_factor: float = clampf(elapsed / maxf(countdown, 1.0), 0.0, 1.0)
	var effective: float = scroll_pressure * (0.2 + time_factor * 0.8)
	return rng.randf() < effective * 0.015


static func partial_reset_pressure(current: float) -> float:
	return current * 0.4
