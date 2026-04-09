extends RefCounted

## Helper functions extracted from main.gd to keep it under 200 LOC.
## These are thin wrappers that access main's state directly.

const COAL_ACTIVATOR := preload("res://scripts/coal_activator.gd")
static var _coal_activator: RefCounted


static func activate_coal(main: Node, idx: int) -> void:
	if _coal_activator == null:
		_coal_activator = COAL_ACTIVATOR.new()
	_coal_activator.activate(main, idx)
	var sm: Node = main._save_manager()
	if sm != null:
		sm.set_coal(main.coal_queue)
	if main.ui_mgr != null and not main.ui_mgr.coal_sidebar_state.is_empty():
		main.ui_mgr.refresh_coal_sidebar(main.coal_queue)


static func kill_enemy(main: Node, enemy_index: int) -> void:
	var enemy: Dictionary = main.enemies[enemy_index]
	main.combat.spawn_pickup(main.pickup_root, main.pickups, enemy["node"].position, enemy["drop_xp"])
	var cookie_val := int(enemy.get("drop_cookies", 0))
	if cookie_val > 0:
		main.combat.spawn_pickup(main.pickup_root, main.pickups,
			enemy["node"].position + Vector3(0.5, 0, 0.5), cookie_val, "cookie")
	main.combat.spawn_hit_fx(main.fx_root, main.vfx, enemy["node"].position, enemy["color"])
	main.particles.spawn_death_burst(main.fx_root, enemy["node"].position,
		enemy["color"], float(enemy["node"].scale.x))
	enemy["node"].queue_free()
	main.enemies.remove_at(enemy_index)
	main.progression.record_kill()
	if main.ui_mgr != null: main.ui_mgr.register_combo_kill()
	var sm: Node = main._save_manager()
	if sm != null and sm.has_method("record_kill"):
		sm.record_kill()


static func on_class_button_pressed(main: Node, button: Button) -> void:
	main.current_class_id = String(button.get_meta("class_id", ""))
	if main.ui_mgr.difficulty_panel != null:
		main.ui_mgr.start_screen.visible = false
		main.ui_mgr.difficulty_panel.visible = true
	else:
		main.start_run(main.current_class_id)


static func on_difficulty_selected(main: Node, tier: int, permadeath_flag: bool) -> void:
	main.difficulty_tier = clampi(tier, 1, 6)
	main.permadeath = permadeath_flag
	if main.ui_mgr.difficulty_panel != null:
		main.ui_mgr.difficulty_panel.visible = false
	var sm: Node = main._save_manager()
	if sm != null:
		sm.set_preference("difficulty_tier", main.difficulty_tier)
		sm.set_preference("permadeath", main.permadeath)
	main.start_run(main.current_class_id)


static func load_equipped_gear(main: Node, sm: Node) -> void:
	if main.gear_sys == null:
		return
	for slot in GearSystem.SLOTS:
		main.gear_sys.equipped[slot] = {}
	if sm == null:
		return
	var equipped: Dictionary = sm.get_equipped_gear()
	for slot in GearSystem.SLOTS:
		var item: Variant = equipped.get(slot, {})
		if item is Dictionary and not item.is_empty() and String(item.get("slot", slot)) == slot:
			main.gear_sys.equip(item)


const _DEF_PAIRS: Array = [
	["config", "res://declarations/config/config.json"],
	["enemy_defs", "res://declarations/enemies/enemies.json"],
	["upgrade_defs", "res://declarations/upgrades/upgrades.json"],
	["present_defs", "res://declarations/presents/presents.json"],
]


static func load_definitions(main: Node) -> void:
	var wb: Variant = preload("res://scripts/world_builder.gd")
	for pair in _DEF_PAIRS:
		main.set(pair[0], wb.read_json(pair[1]))


static func apply_upgrade(main: Node, upgrade_id: String) -> void:
	main.progression.apply_upgrade(upgrade_id, main.player_state)
	main.ui_mgr.level_screen.visible = false
	if main.progression.xp >= main.progression.xp_needed:
		main._trigger_level_up()
		return
	main.state = "playing"
	main._update_ui()


static func handle_input(main: Node, event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		if event.physical_keycode == KEY_ESCAPE: main.ui_mgr.toggle_pause(main.get_tree())
		elif event.physical_keycode == KEY_TAB: main.ui_mgr.open_settings()
	var s := {"dash_pressed": main.dash_pressed, "touch_active": main.touch_active, "touch_origin": main.touch_origin, "touch_position": main.touch_position, "input_move": main.input_move}
	main.player_ctrl.handle_input(event, Vector2(main.get_viewport().size), s)
	main.dash_pressed = s.get("dash_pressed", main.dash_pressed)
	main.touch_active = s.get("touch_active", main.touch_active)
	main.touch_origin = s.get("touch_origin", main.touch_origin)
	main.touch_position = s.get("touch_position", main.touch_position)
	main.input_move = s.get("input_move", main.input_move)
	if s.get("show_joystick", false): main.ui_mgr.show_joystick(s["joystick_base"], s["joystick_knob"])
	if s.get("hide_joystick", false): main.ui_mgr.hide_joystick()


static func trigger_level_up(main: Node) -> void:
	main.progression.trigger_level_up(func(st: String) -> void: main.state = st, main.upgrade_defs, main.test_mode, Callable(main, "_apply_upgrade"), Callable(main, "_on_upgrade_button_pressed"))


static func boss_phase_sting(main: Node) -> void:
	if main.audio_mgr != null: main.audio_mgr.play_boss_sting()
	if main.screen_shake != null: main.screen_shake.add_trauma(0.8)


static func enemy_telegraph(main: Node, etype: String, pos: Vector3) -> void:
	if main.audio_mgr != null: main.audio_mgr.play_enemy_telegraph(etype, pos)


static func end_run_audio(main: Node, win: bool) -> void:
	if main.audio_mgr == null: return
	if win: main.audio_mgr.play_victory()
	else: main.audio_mgr.play_death()
	main.audio_mgr.stop_ambient()


static func apply_reduced_motion(main: Node, sm: Node) -> void:
	var reduced: bool = false
	if sm != null and sm.has_method("get_preference"):
		reduced = bool(sm.get_preference("reduced_motion", false))
	if main.screen_shake != null: main.screen_shake.configure(reduced)
	if main.flair_animator != null and main.flair_animator.has_method("configure"): main.flair_animator.configure(reduced)
	if main.present_animator != null and main.present_animator.has_method("configure"): main.present_animator.configure(reduced)


static func finalize_end_screen(main: Node, win: bool) -> void:
	var ui: RefCounted = main.ui_mgr
	ui.end_screen.visible = true
	ui.end_title.text = "CAMPAIGN SECURED" if win else "OVERWHELMED"
	ui.end_title.modulate = Color("69d6ff") if win else Color("ff617e")
	ui.end_message.text = "Krampus-Prime purged." if win else "Operator down."
	ui.end_waves.text = "Waves cleared: %d" % maxi(1, main.current_wave_index + 1)
