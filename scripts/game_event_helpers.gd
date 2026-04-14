extends RefCounted

## Static helpers for game events and progression to keep game_manager.gd under 200 LOC.

const RUNTIME_CLEANER := preload("res://scripts/runtime_cleaner.gd")

static func begin_wave_clear(main: Node) -> void:
	main.state = "wave_clear"
	main.wave_clear_timer = 2.0
	main.ui_mgr.show_message("WAVE CLEARED", 1.6, Color("69d6ff"))
	for enemy in main.enemies:
		if is_instance_valid(enemy.get("node")):
			main.combat.spawn_pickup(main.pickup_root, main.pickups, enemy["node"].position, enemy["drop_xp"])
			enemy["node"].queue_free()
	main.enemies.clear()


static func on_boss_killed(main: Node) -> void:
	if main.state != "playing":
		return
	main.boss_phases.clear()
	if is_instance_valid(main.boss_ref.get("node")):
		preload("res://scripts/enemy_reactivity.gd").spawn_death_echo(main.fx_root, main.vfx, main.boss_ref)
		main.boss_ref["node"].queue_free()
	main.boss_ref = {}
	main.ui_mgr.boss_panel.visible = false
	var is_campaign_clear: bool = (main.current_wave_index + 1) >= 10
	if is_campaign_clear and main.endless_mode:
		# Massive bonus for clearing a boss in endless mode
		gain_xp(main, 500)
		gain_cookies(main, 100)
		main.ui_mgr.show_message("BOSS DEFEATED. SURVIVAL CONTINUES.", 3.0, Color("ffd700"))
		begin_wave_clear(main)
	elif is_campaign_clear:
		main.game_mgr.end_run(true)
	else:
		begin_wave_clear(main)


static func end_run(main: Node, win: bool) -> void:
	var helpers: RefCounted = preload("res://scripts/main_helpers.gd")
	main.state = "win" if win else "game_over"
	helpers.end_run_audio(main, win)
	if win and main.player_node != null:
		main.particles.spawn_death_burst(main.fx_root, main.player_node.position, Color("ffd700"), 2.5)
	var ui: RefCounted = main.ui_mgr
	ui.hud_root.visible = false
	ui.dash_button.visible = false
	ui.boss_panel.visible = false
	var sm: Node = main._save_manager()
	if sm != null:
		sm.suspend_autosave()
		if main.run_cookies > 0:
			sm.add_cookies(main.run_cookies)
		sm.set_coal(main.coal_queue)
		if win:
			sm.record_campaign_clear()
		sm.resume_autosave()
	if bool(main.test_mode.get("skip_between_match", false)) or main.between_match == null:
		helpers.finalize_end_screen(main, win)
	else:
		main.between_match.start_flow()


static func gain_xp(main: Node, amt: int) -> void:
	var wave_mult := 1.0 + float(maxi(0, main.current_wave_index)) * 0.08
	var cls: ClassResource = main.player_state.get("class")
	var bonus := cls.xp_bonus if cls != null else 0.0
	main.progression.gain_xp(int(roundi(float(amt) * wave_mult * (1.0 + bonus))), Callable(main, "_trigger_level_up"), Callable(main, "_update_ui"))


static func gain_cookies(main: Node, amt: int) -> void:
	var cls: ClassResource = main.player_state.get("class")
	var bonus := cls.cookie_bonus if cls != null else 0.0
	main.run_cookies += int(roundi(float(amt) * (1.0 + bonus)))


static func on_boss_phase_changed(main: Node) -> void:
	var helpers: RefCounted = preload("res://scripts/main_helpers.gd")
	helpers.boss_phase_sting(main)


static func enemy_telegraph(main: Node, etype: String, pos: Vector3) -> void:
	var helpers: RefCounted = preload("res://scripts/main_helpers.gd")
	helpers.enemy_telegraph(main, etype, pos)


static func clear_runtime(main: Node) -> void:
	RUNTIME_CLEANER.clear(main)
