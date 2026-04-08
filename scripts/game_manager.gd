extends RefCounted

const WAVE_FORMULA := preload("res://scripts/wave_formula.gd")
const WAVE_SPAWNER := preload("res://scripts/wave_spawner.gd")

var main: Node
var wave_spawner: RefCounted

func _init(main_node: Node) -> void:
	main = main_node
	wave_spawner = WAVE_SPAWNER.new(main_node)

func start_run(class_id: String) -> void:
	if not main.class_defs.has(class_id) and not main.present_defs.has(class_id):
		return
	clear_runtime()
	main.current_class_id = class_id
	main.state = "playing"
	main.current_wave_index = -1
	if main.run_seed == 0:
		main.run_seed = int(Time.get_ticks_msec())
	main.progression.reset()
	main.dash_timer = 0.0
	main.dash_cooldown_timer = 0.0
	main.move_velocity = Vector2.ZERO
	main.boss_ref = {}
	build_board()
	spawn_player()
	main._update_ui()
	var ui: RefCounted = main.ui_mgr
	ui.start_screen.visible = false
	ui.level_screen.visible = false
	ui.end_screen.visible = false
	ui.hud_root.visible = true
	ui.dash_button.visible = true
	main.ui_mgr.dash_button.disabled = false
	start_next_wave()

func tick_playing(delta: float) -> void:
	update_player(delta)
	update_spawning(delta)
	main.enemies_ai.update_enemies(delta, main.enemies, main.boss_ref, main.player_node, Callable(main, "_move_actor"), Callable(main, "_damage_player"), spawn_projectile_hostile, main._test_scale("boss_attack_scale"))
	main.combat.update_projectiles(delta, main.projectiles, main.enemies, main.boss_ref, main.player_node, main.obstacle_colliders, main.ui_mgr.boss_bar, main.ui_mgr.boss_panel, Callable(main, "_damage_player"), Callable(main, "_kill_enemy"), on_boss_killed, main.fx_root, main.vfx)
	main.combat.update_pickups(delta, main.pickups, main.player_node, main.config, main.test_mode, gain_xp)
	main.combat.update_vfx(delta, main.vfx)
	if not main.current_wave.get("is_boss_wave", false):
		main.wave_time_remaining = maxf(0.0, main.wave_time_remaining - delta * main._test_scale("wave_scale"))
		if main.wave_time_remaining <= 0.0 and main.state == "playing":
			begin_wave_clear()
		main.ui_mgr.timer_label.text = "%.1f" % main.wave_time_remaining
	else:
		main.ui_mgr.timer_label.text = "BOSS"

func start_next_wave() -> void:
	main.current_wave_index += 1
	var level: int = main.current_wave_index + 1
	main.current_wave = WAVE_FORMULA.generate_wave(main.run_seed, level)
	var save_mgr: Node = main._save_manager()
	main.wave_time_remaining = float(main.current_wave["duration"])
	main.spawn_timer = 0.0
	main.state = "playing"
	main.ui_mgr.wave_label.text = "WAVE %d" % level
	var banner_color := Color("ff4466") if main.current_wave.get("is_boss_wave", false) else Color("edf7ff")
	main.ui_mgr.show_message("WAVE %d" % level, 1.8, banner_color)
	if save_mgr != null and level == 5 and save_mgr.unlock("santa"):
		main.ui_mgr.show_achievement("MECHA-SANTA UNLOCKED")
		main._refresh_start_screen()
	if save_mgr != null:
		save_mgr.register_wave_reached(level)

func spawn_boss(hp_scale: float) -> void:
	main.boss_ref = main.enemies_ai.spawn_boss(main.actor_root, main.boss_ref, main.enemy_defs, main.config, hp_scale, main._test_scale("boss_hp_scale"), main.ui_mgr.boss_panel, main.ui_mgr.boss_bar, main.ui_mgr.show_message)

func end_run(win: bool) -> void:
	main.state = "win" if win else "game_over"
	var ui: RefCounted = main.ui_mgr
	ui.end_screen.visible = true
	ui.hud_root.visible = false
	ui.dash_button.visible = false
	ui.boss_panel.visible = false
	var save_mgr: Node = main._save_manager()
	if win and save_mgr != null and save_mgr.unlock("bumble"):
		ui.show_achievement("THE BUMBLE UNLOCKED")
		main._refresh_start_screen()
	ui.end_title.text = "CAMPAIGN SECURED" if win else "OVERWHELMED"
	ui.end_title.modulate = Color("69d6ff") if win else Color("ff617e")
	ui.end_message.text = "Krampus-Prime purged." if win else "Operator down."
	ui.end_waves.text = "Waves cleared: %d" % max(1, main.current_wave_index + 1)

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
	var result: Dictionary = main.player_ctrl.spawn_player(main.actor_root, main.current_class_id, main.class_defs, main.present_defs)
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
		main.dash_cooldown_timer = float(main.config["dash_cooldown"])
		main.dash_pressed = false
	var speed: float = float(main.player_state["class"]["speed"]) * main._test_scale("player_speed_scale")
	if main.dash_timer > 0.0:
		main.dash_timer -= delta
		speed *= 2.8
	main._move_actor(main.player_node, Vector3(main.move_velocity.x, 0.0, main.move_velocity.y), speed, delta, 0.62)
	if main.move_velocity.length() > 0.01:
		main.player_mesh.rotation.y = atan2(main.move_velocity.x, main.move_velocity.y)
	main.player_ctrl.auto_fire(delta, main.player_state, main.player_node, closest_target, spawn_projectile_player, main._test_scale("player_fire_scale"), main._test_scale("player_damage_scale"))
	main.player_ctrl.update_player_aura(delta, main.player_state, main.player_node, main.enemies, main.boss_ref, main._test_scale("player_damage_scale"), Callable(main, "_kill_enemy"), Callable(main, "_spawn_hit_fx"), main.ui_mgr.boss_bar)

func update_spawning(delta: float) -> void:
	wave_spawner.update_spawning(delta, Callable(self, "spawn_boss"))

func begin_wave_clear() -> void:
	main.state = "wave_clear"
	main.wave_clear_timer = 2.0
	main.ui_mgr.show_message("WAVE CLEARED", 1.6, Color("69d6ff"))
	for enemy in main.enemies:
		main.combat.spawn_pickup(main.pickup_root, main.pickups, enemy["node"].position, enemy["drop_xp"])
		enemy["node"].queue_free()
	main.enemies.clear()

func closest_target() -> Dictionary:
	return main.enemies_ai.closest_target(main.enemies, main.boss_ref, main.player_node, float(main.player_state["class"]["range"]))

func spawn_projectile_player(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color(main.player_state["class"]["color"]))

func spawn_projectile_hostile(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color("ff617e"))

func on_boss_killed() -> void:
	main.boss_ref["node"].queue_free()
	main.boss_ref = {}
	main.ui_mgr.boss_panel.visible = false
	end_run(true)

func gain_xp(amount: int) -> void:
	main.progression.gain_xp(amount, Callable(main, "_trigger_level_up"), Callable(main, "_update_ui"))

func clear_runtime() -> void:
	for array_ref in [main.enemies, main.projectiles, main.pickups, main.vfx]:
		for entry in array_ref:
			if entry.has("node") and entry["node"] != null:
				entry["node"].queue_free()
		array_ref.clear()
	main.obstacle_colliders.clear()
	main.boss_ref = {}
	for child in main.board_root.get_children():
		child.queue_free()
	for child in main.actor_root.get_children():
		child.queue_free()
	if main.player_node != null:
		main.player_node.queue_free()
	main.player_node = null
