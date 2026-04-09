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
