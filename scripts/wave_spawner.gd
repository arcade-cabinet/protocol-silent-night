extends RefCounted

## Per-frame spawn logic using boss pressure accumulator.
## Krampus appears within normal waves via probability rolls.
## Consumes burst_chance, burst_size, and pattern from wave dict
## so wave formula variety is visually expressed.

var main: Node
var boss_rng := RandomNumberGenerator.new()
var scroll_rng := RandomNumberGenerator.new()
var _spawn_rng := RandomNumberGenerator.new()
var bosses_spawned_this_level: int = 0
var scrolls_dropped_this_level: int = 0
var elapsed: float = 0.0
var _spiral_angle: float = 0.0


func _init(main_node: Node) -> void:
	main = main_node
	configure_seed(int(Time.get_ticks_usec()))


func configure_seed(base_seed: int) -> void:
	boss_rng.seed = base_seed
	scroll_rng.seed = base_seed + 31337
	_spawn_rng.seed = base_seed + 99991


func reset_for_level() -> void:
	bosses_spawned_this_level = 0
	scrolls_dropped_this_level = 0
	elapsed = 0.0
	_spiral_angle = 0.0


func update_spawning(delta: float, spawn_boss_callable: Callable, spawn_board_object_callable: Callable = Callable()) -> void:
	var wave: Dictionary = main.current_wave
	elapsed += delta
	main.spawn_timer += delta * main._test_scale("wave_scale")
	if main.spawn_timer < float(wave.get("spawn_interval", 1.0)):
		return
	main.spawn_timer = 0.0
	_try_boss_spawn(wave, spawn_boss_callable)
	if spawn_board_object_callable.is_valid():
		_try_scroll_object_spawn(wave, spawn_board_object_callable)
	var composition: Array = wave.get("composition", ["grunt"])
	if composition.is_empty():
		return
	var burst_chance: float = float(wave.get("burst_chance", 0.0))
	var burst_size: int = maxi(1, int(wave.get("burst_size", 1)))
	var count: int = burst_size if _spawn_rng.randf() < burst_chance else 1
	var pattern: String = String(wave.get("pattern", "scatter"))
	var ar: float = float(main.config["arena_radius"])
	for i in range(count):
		var enemy_type: String = composition[_spawn_rng.randi() % composition.size()]
		var pos := _pattern_position(pattern, i, count, ar)
		main.enemies_ai.spawn_enemy(main.actor_root, main.enemies, enemy_type,
			float(wave.get("hp_scale", 1.0)), main.enemy_defs, main.config,
			int(wave.get("enemy_phase_level", 1)),
			float(wave.get("speed_mult", 1.0)), float(wave.get("damage_scale", 1.0)), pos)


func _pattern_position(pattern: String, index: int, total: int, ar: float) -> Vector3:
	var spawn_r := ar * 1.6
	var angle: float
	match pattern:
		"ring":
			angle = (TAU / float(maxi(total, 1))) * index
		"wedge":
			var spread := PI / 2.5
			var t := float(index) / float(maxi(total - 1, 1))
			angle = (-spread / 2.0) + spread * t + _spawn_rng.randf_range(-0.08, 0.08)
		"flanking":
			angle = (PI / 2.0 if index % 2 == 0 else -PI / 2.0) + _spawn_rng.randf_range(-0.4, 0.4)
		"spiral":
			_spiral_angle += PI * 0.618034  # golden angle
			angle = _spiral_angle
		_:  # scatter
			angle = _spawn_rng.randf_range(0.0, TAU)
	return Vector3(cos(angle) * spawn_r, 0.58, sin(angle) * spawn_r)


func _try_boss_spawn(wave: Dictionary, spawn_boss_callable: Callable) -> void:
	var max_bosses: int = int(wave.get("max_bosses", 1))
	if bosses_spawned_this_level >= max_bosses:
		return
	var pressure: float = float(wave.get("boss_pressure", 0.0))
	var countdown: float = float(wave.get("countdown", 120.0))
	if WaveFormula.roll_boss_spawn(pressure, elapsed, countdown, boss_rng):
		bosses_spawned_this_level += 1
		spawn_boss_callable.call(float(wave.get("boss_hp_scale", 1.0)))


func _try_scroll_object_spawn(wave: Dictionary, spawn_callable: Callable) -> void:
	var pressure: float = float(wave.get("scroll_pressure", 0.0))
	var countdown: float = float(wave.get("countdown", 120.0))
	if ScrollFormula.roll_board_object_spawn(pressure, elapsed, countdown, scroll_rng):
		scrolls_dropped_this_level += 1
		spawn_callable.call()


func get_lookback_entry() -> Dictionary:
	return {"bosses_spawned": bosses_spawned_this_level, "scrolls_dropped": scrolls_dropped_this_level, "elapsed": elapsed}
