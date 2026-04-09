extends RefCounted

## Per-frame spawn logic using boss pressure accumulator.
## Krampus appears within normal waves via probability rolls.

var main: Node
var boss_rng := RandomNumberGenerator.new()
var scroll_rng := RandomNumberGenerator.new()
var bosses_spawned_this_level: int = 0
var scrolls_dropped_this_level: int = 0
var elapsed: float = 0.0


func _init(main_node: Node) -> void:
	main = main_node
	boss_rng.seed = int(Time.get_ticks_usec())
	scroll_rng.seed = int(Time.get_ticks_usec()) + 31337


func reset_for_level() -> void:
	bosses_spawned_this_level = 0
	scrolls_dropped_this_level = 0
	elapsed = 0.0


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
	var enemy_type: String = composition[randi() % composition.size()]
	main.enemies_ai.spawn_enemy(main.actor_root, main.enemies, enemy_type,
		float(wave.get("hp_scale", 1.0)), main.enemy_defs, main.config)


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
