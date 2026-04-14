extends RefCounted

const WAVE_FORMULA := preload("res://scripts/wave_formula.gd")
const WAVE_SPAWNER := preload("res://scripts/wave_spawner.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")
const COMBAT_HELPERS := preload("res://scripts/combat_helpers.gd")
const EVENT_HELPERS := preload("res://scripts/game_event_helpers.gd")
const BOARD_HELPERS := preload("res://scripts/board_helpers.gd")
const FRAME_BUDGET := preload("res://scripts/frame_budget_monitor.gd")
const ENEMY_REACTIVITY := preload("res://scripts/enemy_reactivity.gd")

var main: Node
var wave_spawner: RefCounted
var frame_budget: RefCounted


func _init(main_node: Node) -> void:
	main = main_node
	wave_spawner = WAVE_SPAWNER.new(main_node)
	frame_budget = FRAME_BUDGET.new()


func start_run(class_id: String) -> void:
	if not main.present_defs.has(class_id):
		return
	EVENT_HELPERS.clear_runtime(main)
	main.current_class_id = class_id
	main.state = "playing"
	main.current_wave_index = -1
	main.run_seed = int(main.test_mode.get("fixed_run_seed", int(Time.get_ticks_msec()) ^ int(Time.get_unix_time_from_system())))
	seed(main.run_seed)
	wave_spawner.configure_seed(main.run_seed)
	main.board_obj_handler.configure_seed(main.run_seed)
	main.particles._rng.seed = main.run_seed ^ 0xFACE12
	main.screen_shake._rng.seed = main.run_seed ^ 0x5AE1
	main.screen_shake.reset()
	main.progression.reset()
	main.dash_timer = 0.0
	main.dash_cooldown_timer = 0.0
	main.move_velocity = Vector2.ZERO
	main.boss_ref = {}
	main.level_lookback.clear()
	frame_budget.reset()
	main.rewraps = 0 if main.permadeath else maxi(0, 6 - main.difficulty_tier)
	var start_sm: Node = main._save_manager()
	if start_sm != null:
		start_sm.record_run_start()
	main.coal_queue = start_sm.get_coal() if start_sm != null else []
	MAIN_HELPERS.load_equipped_gear(main, start_sm)
	MAIN_HELPERS.apply_reduced_motion(main, start_sm)
	BOARD_HELPERS.build_board(main)
	spawn_player()
	main._update_ui()
	MAIN_HELPERS.show_gameplay_ui(main)
	start_next_wave()


func tick_playing(delta: float) -> void:
	frame_budget.sample(delta)
	update_player(delta)
	update_spawning(delta)
	_tick_combat_systems(delta)
	main.wave_time_remaining = maxf(0.0, main.wave_time_remaining - delta * main._test_scale("wave_scale"))
	if main.wave_time_remaining <= 0.0 and main.state == "playing":
		EVENT_HELPERS.begin_wave_clear(main)
	main.ui_mgr.timer_label.text = "%.0f" % main.wave_time_remaining


func _tick_combat_systems(delta: float) -> void:
	main.enemies_ai.update_enemies(delta, main.enemies, main.boss_ref, main.player_node, Callable(main, "_move_actor"), Callable(main, "_damage_player"), Callable(self, "spawn_projectile_hostile"), main._test_scale("boss_attack_scale"), Callable(self, "_enemy_telegraph"))
	main.boss_phases.update_boss(delta, main.boss_ref, main.player_node, Callable(main, "_move_actor"), Callable(self, "spawn_projectile_hostile"), Callable(main, "_damage_player"), main.ui_mgr.show_message, Callable(self, "_boss_summon_minion"), main.fx_root, main._test_scale("boss_attack_scale"), Callable(self, "_on_boss_phase_changed"))
	main.enemies_ai.refresh_threat_language(main.enemies, main.boss_ref, main.boss_phases.current_phase)
	for enemy in main.enemies: ENEMY_REACTIVITY.update_enemy(enemy, delta)
	ENEMY_REACTIVITY.update_boss(main.boss_ref, delta)
	main.combat.update_projectiles(delta, main.projectiles, main.enemies, main.boss_ref, main.player_node, main.obstacle_colliders, main.ui_mgr.boss_bar, main.ui_mgr.boss_panel, Callable(main, "_damage_player"), Callable(main, "_kill_enemy"), Callable(self, "on_boss_killed"), main.fx_root, main.vfx, main.dmg_numbers)
	main.combat.update_pickups(delta, main.pickups, main.player_node, main.config, main.test_mode, Callable(self, "gain_xp"), main.fx_root, main.particles, Callable(self, "gain_cookies"), Callable(self, "gain_scroll"))
	main.combat.update_vfx(delta, main.vfx)
	main.dmg_numbers.update(delta)
	main.particles.update(delta)
	main.board_obj_handler.update_board_objects(main.projectiles, main.board_objects, main.pickup_root, main.pickups, main.fx_root, main.particles)


func start_next_wave() -> void:
	var lookback_entry: Dictionary = wave_spawner.get_lookback_entry() if main.current_wave_index >= 0 else {}
	if not lookback_entry.is_empty():
		main.level_lookback.append(lookback_entry)
		if main.level_lookback.size() > 10:
			main.level_lookback.pop_front()
	main.current_wave_index += 1
	var level: int = main.current_wave_index + 1
	if main.weather_director != null: main.weather_director.set_intensity(level, 10, main.difficulty_tier)
	main.current_wave = WAVE_FORMULA.generate_wave(main.run_seed, level, main.level_lookback, main.difficulty_tier)
	wave_spawner.reset_for_level()
	var save_mgr: Node = main._save_manager()
	main.wave_time_remaining = float(main.current_wave.get("countdown", 120.0))
	main.spawn_timer = 0.0
	main.state = "playing"
	main.ui_mgr.wave_label.text = "LEVEL %d" % level
	main.ui_mgr.show_message("LEVEL %d" % level, 1.8, Color("edf7ff"))
	if main.audio_mgr != null:
		main.audio_mgr.play_wave_banner()
		if main.current_wave.get("is_boss_wave", false):
			main.audio_mgr.play_music("boss")

	if save_mgr != null:
		save_mgr.register_wave_reached(level)
		save_mgr.register_level_reached(level)
	for _i in range(int(main.config.get("board_objects_per_level", 2))):
		_spawn_board_object()


func spawn_boss(hp_scale: float) -> void: main.boss_ref = main.enemies_ai.spawn_boss(main.actor_root, main.boss_ref, main.enemy_defs, main.config, hp_scale, main._test_scale("boss_hp_scale"), main.ui_mgr.boss_panel, main.ui_mgr.boss_bar, main.ui_mgr.show_message)
func end_run(win: bool) -> void: EVENT_HELPERS.end_run(main, win)


func spawn_player() -> void:
	if main.flair_animator != null:
		main.flair_animator.clear()
	var result: Dictionary = main.player_ctrl.spawn_player(main.actor_root, main.current_class_id, main.present_defs, main.gear_sys, main.flair_animator)
	main.player_node = result["node"]
	main.player_mesh = result["mesh"]
	main.player_state = result["state"]
	main.ui_mgr.hp_bar.max_value = main.player_state["max_hp"]
	main.ui_mgr.xp_bar.max_value = main.progression.xp_needed
	main._update_ui()


func update_player(delta: float) -> void:
	if main.player_node == null:
		return
	var desired_move: Vector2 = main.player_ctrl.read_move_input(main.input_move, main.touch_active)
	main.move_velocity = main.move_velocity.lerp(desired_move, clampf(delta * 8.0, 0.0, 1.0))
	if main.dash_cooldown_timer > 0.0:
		main.dash_cooldown_timer -= delta
		main.ui_mgr.dash_button.disabled = main.dash_cooldown_timer > 0.0
	if main.dash_pressed and main.dash_cooldown_timer <= 0.0:
		main.dash_timer = float(main.config["dash_duration"])
		main.dash_cooldown_timer = float(main.config["dash_cooldown"]) * main.player_state["class"].dash_cooldown
		main.dash_pressed = false
		if main.audio_mgr != null:
			main.audio_mgr.play_dash()
		if main.mobile_feedback != null:
			main.mobile_feedback.trigger(main, "dash")
		main.afterimages.append(main.present_animator.spawn_dash_afterimage(main.fx_root, main.player_node))
	var speed: float = main.player_state["class"].speed * main._test_scale("player_speed_scale")
	if main.dash_timer > 0.0:
		main.dash_timer -= delta
		speed *= 2.8
	main._move_actor(main.player_node, Vector3(main.move_velocity.x, 0.0, main.move_velocity.y), speed, delta, 0.62)
	if main.move_velocity.length() > 0.01:
		main.player_mesh.rotation.y = atan2(main.move_velocity.x, main.move_velocity.y)
	main.present_animator.update(delta, main.player_mesh, main.move_velocity)
	main.present_animator.update_afterimages(main.afterimages, delta)
	var target_func := func() -> Dictionary: return COMBAT_HELPERS.closest_target(main)
	var fired: bool = main.player_ctrl.auto_fire(delta, main.player_state, main.player_node, target_func, Callable(self, "spawn_projectile_player"), main._test_scale("player_fire_scale"), main._test_scale("player_damage_scale"))
	if fired:
		main.present_animator.trigger_recoil()
	main.player_ctrl.update_player_aura(delta, main.player_state, main.player_node, main.enemies, main.boss_ref, main._test_scale("player_damage_scale"), Callable(main, "_kill_enemy"), Callable(main, "_spawn_hit_fx"), main.ui_mgr.boss_bar, Callable(self, "spawn_aura_damage_number"), Callable(self, "on_boss_killed"))


func update_spawning(delta: float) -> void:
	wave_spawner.update_spawning(delta, Callable(self, "spawn_boss"), Callable(self, "_spawn_board_object"))


func _spawn_board_object() -> void: main.board_obj_handler.spawn_board_object(main)


func spawn_projectile_player(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	COMBAT_HELPERS.spawn_projectile_player(main, origin, direction, hostile, damage, pierce, speed, scale_value)


func spawn_projectile_hostile(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	COMBAT_HELPERS.spawn_projectile_hostile(main, origin, direction, hostile, damage, pierce, speed, scale_value)


func spawn_aura_damage_number(wp: Vector3, a: float, c: Color) -> void: COMBAT_HELPERS.spawn_aura_damage_number(main, wp, a, c)
func on_boss_killed() -> void: EVENT_HELPERS.on_boss_killed(main)
func gain_xp(amt: int) -> void: EVENT_HELPERS.gain_xp(main, amt)
func gain_cookies(amt: int) -> void: EVENT_HELPERS.gain_cookies(main, amt)
func gain_scroll(scroll_type: String) -> void: main.run_scrolls.append({"scroll_type": scroll_type})
func _boss_summon_minion() -> void: COMBAT_HELPERS.boss_summon_minion(main)
func _on_boss_phase_changed(_phase: int) -> void: EVENT_HELPERS.on_boss_phase_changed(main)
func _enemy_telegraph(etype: String, pos: Vector3) -> void: EVENT_HELPERS.enemy_telegraph(main, etype, pos)
func frame_budget_summary() -> Dictionary: return frame_budget.summary()
