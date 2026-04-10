extends RefCounted

const WAVE_FORMULA := preload("res://scripts/wave_formula.gd")
const WAVE_SPAWNER := preload("res://scripts/wave_spawner.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")
const RUNTIME_CLEANER := preload("res://scripts/runtime_cleaner.gd")

var main: Node
var wave_spawner: RefCounted

func _init(main_node: Node) -> void:
	main = main_node
	wave_spawner = WAVE_SPAWNER.new(main_node)

func start_run(class_id: String) -> void:
	if not main.present_defs.has(class_id):
		return
	clear_runtime()
	main.current_class_id = class_id
	main.state = "playing"
	main.current_wave_index = -1
	main.run_seed = int(Time.get_ticks_msec()) ^ int(Time.get_unix_time_from_system())
	main.progression.reset()
	main.dash_timer = 0.0; main.dash_cooldown_timer = 0.0; main.move_velocity = Vector2.ZERO
	main.boss_ref = {}
	main.level_lookback.clear()
	main.rewraps = 0 if main.permadeath else maxi(0, 6 - main.difficulty_tier)
	var start_sm: Node = main._save_manager()
	main.coal_queue = start_sm.get_coal() if start_sm != null else []
	MAIN_HELPERS.load_equipped_gear(main, start_sm)
	MAIN_HELPERS.apply_reduced_motion(main, start_sm)
	build_board()
	spawn_player()
	main._update_ui()
	MAIN_HELPERS.show_gameplay_ui(main)
	start_next_wave()

func tick_playing(delta: float) -> void:
	update_player(delta)
	update_spawning(delta)
	main.enemies_ai.update_enemies(delta, main.enemies, main.boss_ref, main.player_node, Callable(main, "_move_actor"), Callable(main, "_damage_player"), spawn_projectile_hostile, main._test_scale("boss_attack_scale"), Callable(self, "_enemy_telegraph"))
	main.boss_phases.update_boss(delta, main.boss_ref, main.player_node, Callable(main, "_move_actor"), spawn_projectile_hostile, Callable(main, "_damage_player"), main.ui_mgr.show_message, Callable(self, "_boss_summon_minion"), main.fx_root, main._test_scale("boss_attack_scale"), Callable(self, "_on_boss_phase_changed"))
	main.combat.update_projectiles(delta, main.projectiles, main.enemies, main.boss_ref, main.player_node, main.obstacle_colliders, main.ui_mgr.boss_bar, main.ui_mgr.boss_panel, Callable(main, "_damage_player"), Callable(main, "_kill_enemy"), on_boss_killed, main.fx_root, main.vfx, main.dmg_numbers)
	main.combat.update_pickups(delta, main.pickups, main.player_node, main.config, main.test_mode, gain_xp, main.fx_root, main.particles, gain_cookies, gain_scroll)
	main.combat.update_vfx(delta, main.vfx)
	main.dmg_numbers.update(delta)
	main.particles.update(delta)
	main.board_obj_handler.update_board_objects(main.projectiles, main.board_objects, main.pickup_root, main.pickups, main.fx_root, main.particles)
	main.wave_time_remaining = maxf(0.0, main.wave_time_remaining - delta * main._test_scale("wave_scale"))
	if main.wave_time_remaining <= 0.0 and main.state == "playing": begin_wave_clear()
	main.ui_mgr.timer_label.text = "%.0f" % main.wave_time_remaining

func start_next_wave() -> void:
	var lookback_entry: Dictionary = wave_spawner.get_lookback_entry() if main.current_wave_index >= 0 else {}
	if not lookback_entry.is_empty():
		main.level_lookback.append(lookback_entry)
		if main.level_lookback.size() > 10:
			main.level_lookback.pop_front()
	main.current_wave_index += 1
	var level: int = main.current_wave_index + 1
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
		if main.current_wave.get("is_boss_wave", false): main.audio_mgr.play_music("boss")
	var santa_level: int = int(main.config.get("santa_unlock_level", 5))
	if save_mgr != null and level >= santa_level and save_mgr.unlock("santa"):
		main.ui_mgr.show_achievement("MECHA-SANTA UNLOCKED"); main._refresh_start_screen()
	if save_mgr != null:
		save_mgr.register_wave_reached(level)
		save_mgr.register_level_reached(level)
	for _i in range(int(main.config.get("board_objects_per_level", 2))): _spawn_board_object()

func spawn_boss(hp_scale: float) -> void:
	main.boss_ref = main.enemies_ai.spawn_boss(main.actor_root, main.boss_ref, main.enemy_defs, main.config, hp_scale, main._test_scale("boss_hp_scale"), main.ui_mgr.boss_panel, main.ui_mgr.boss_bar, main.ui_mgr.show_message)

func end_run(win: bool) -> void:
	main.state = "win" if win else "game_over"
	MAIN_HELPERS.end_run_audio(main, win)
	var ui: RefCounted = main.ui_mgr
	ui.hud_root.visible = false; ui.dash_button.visible = false; ui.boss_panel.visible = false
	var sm: Node = main._save_manager()
	if sm != null and main.run_cookies > 0: sm.add_cookies(main.run_cookies)
	if sm != null: sm.set_coal(main.coal_queue)
	if win and sm != null and sm.unlock("santa"): ui.show_achievement("MECHA-SANTA UNLOCKED")
	if win and sm != null and sm.unlock("bumble"): ui.show_achievement("THE BUMBLE UNLOCKED"); main._refresh_start_screen()
	if bool(main.test_mode.get("skip_between_match", false)) or main.between_match == null:
		MAIN_HELPERS.finalize_end_screen(main, win)
	else: main.between_match.start_flow()

func return_to_menu() -> void:
	main.state = "menu"
	main.move_velocity = Vector2.ZERO
	main.input_move = Vector2.ZERO
	main.touch_active = false
	var ui: RefCounted = main.ui_mgr
	ui.end_screen.visible = false
	ui.level_screen.visible = false
	ui.dash_button.visible = false
	ui.hud_root.visible = false
	ui.start_screen.visible = true
	ui.boss_panel.visible = false
	if ui.difficulty_panel != null:
		ui.difficulty_panel.visible = false
	ui.hide_joystick()
	clear_runtime()
	main._refresh_start_screen()

func build_board() -> void:
	main.obstacle_colliders.clear()
	main.board_data = main.board_generator.generate_board(int(main.config.get("board_seed", 1225)) + main.progression.level, main.config)
	main.board_builder.build_board_foundation(main.board_root, float(main.config.get("arena_radius", 18.0)))
	main.board_builder.build_snow_drifts(main.board_root, main.board_data)
	main.board_builder.build_outer_ridge(main.board_root, main.board_data)
	for obstacle in main.board_data.get("obstacles", []):
		main.obstacles_builder.make_obstacle(main.board_root, obstacle, main.obstacle_colliders)
	for landmark in main.board_data.get("landmarks", []):
		main.obstacles_builder.make_landmark(main.board_root, landmark)

func spawn_player() -> void:
	if main.flair_animator != null: main.flair_animator.clear()
	var result: Dictionary = main.player_ctrl.spawn_player(main.actor_root, main.current_class_id, main.present_defs, main.gear_sys, main.flair_animator)
	main.player_node = result["node"]; main.player_mesh = result["mesh"]; main.player_state = result["state"]
	main.ui_mgr.hp_bar.max_value = main.player_state["max_hp"]; main.ui_mgr.xp_bar.max_value = main.progression.xp_needed
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
		main.dash_cooldown_timer = float(main.config["dash_cooldown"])
		main.dash_pressed = false
		main.afterimages.append(main.present_animator.spawn_dash_afterimage(main.fx_root, main.player_node))
	var speed: float = float(main.player_state["class"]["speed"]) * main._test_scale("player_speed_scale")
	if main.dash_timer > 0.0:
		main.dash_timer -= delta
		speed *= 2.8
	main._move_actor(main.player_node, Vector3(main.move_velocity.x, 0.0, main.move_velocity.y), speed, delta, 0.62)
	if main.move_velocity.length() > 0.01:
		main.player_mesh.rotation.y = atan2(main.move_velocity.x, main.move_velocity.y)
	main.present_animator.update(delta, main.player_mesh, main.move_velocity)
	main.present_animator.update_afterimages(main.afterimages, delta)
	var fired: bool = main.player_ctrl.auto_fire(delta, main.player_state, main.player_node, closest_target, spawn_projectile_player, main._test_scale("player_fire_scale"), main._test_scale("player_damage_scale"))
	if fired:
		main.present_animator.trigger_recoil()
	main.player_ctrl.update_player_aura(delta, main.player_state, main.player_node, main.enemies, main.boss_ref, main._test_scale("player_damage_scale"), Callable(main, "_kill_enemy"), Callable(main, "_spawn_hit_fx"), main.ui_mgr.boss_bar, Callable(self, "spawn_aura_damage_number"), Callable(self, "on_boss_killed"))

func update_spawning(delta: float) -> void:
	wave_spawner.update_spawning(delta, Callable(self, "spawn_boss"), Callable(self, "_spawn_board_object"))
func _spawn_board_object() -> void: main.board_obj_handler.spawn_board_object(main)

func begin_wave_clear() -> void:
	main.state = "wave_clear"; main.wave_clear_timer = 2.0
	main.ui_mgr.show_message("WAVE CLEARED", 1.6, Color("69d6ff"))
	for enemy in main.enemies:
		main.combat.spawn_pickup(main.pickup_root, main.pickups, enemy["node"].position, enemy["drop_xp"])
		enemy["node"].queue_free()
	main.enemies.clear()

func closest_target() -> Dictionary:
	return main.enemies_ai.closest_target(main.enemies, main.boss_ref, main.player_node, float(main.player_state["class"]["range"]))

func spawn_projectile_player(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color(main.player_state["class"]["color"]), main.fx_root, main.particles)

func spawn_projectile_hostile(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color("ff617e"), main.fx_root, main.particles)

func spawn_aura_damage_number(wp: Vector3, a: float, c: Color) -> void: main.dmg_numbers.spawn(main.fx_root, wp, a, c)
func on_boss_killed() -> void:
	main.boss_phases.clear(); main.boss_ref["node"].queue_free(); main.boss_ref = {}
	main.ui_mgr.boss_panel.visible = false; end_run(true)
func gain_xp(amt: int) -> void: main.progression.gain_xp(amt, Callable(main, "_trigger_level_up"), Callable(main, "_update_ui"))
func gain_cookies(amt: int) -> void: main.run_cookies += amt
func gain_scroll(scroll_type: String) -> void: main.run_scrolls.append({"scroll_type": scroll_type})
func _boss_summon_minion() -> void:
	var minion_type: String = ["grunt", "rusher"][randi() % 2]
	main.enemies_ai.spawn_enemy(main.actor_root, main.enemies, minion_type,
		float(main.current_wave.get("hp_scale", 1.0)), main.enemy_defs, main.config,
		int(main.current_wave.get("enemy_phase_level", 1)), float(main.current_wave.get("speed_mult", 1.0)))
func _on_boss_phase_changed(_phase: int) -> void: MAIN_HELPERS.boss_phase_sting(main)
func _enemy_telegraph(etype: String, pos: Vector3) -> void: MAIN_HELPERS.enemy_telegraph(main, etype, pos)
func clear_runtime() -> void: RUNTIME_CLEANER.clear(main)
