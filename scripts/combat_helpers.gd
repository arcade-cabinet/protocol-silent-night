extends RefCounted

## Static helpers for combat operations to keep game_manager.gd under 200 LOC.

static func spawn_projectile_player(main: Node, origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	var cls: ClassResource = main.player_state.get("class")
	var crit_chance := cls.crit_chance if cls != null else 0.0
	var color_str := cls.color if cls != null else "#ffd700"
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color(color_str), main.fx_root, main.particles, crit_chance)


static func spawn_projectile_hostile(main: Node, origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	main.combat.spawn_projectile(main.projectile_root, main.projectiles, origin, direction, hostile, damage, pierce, speed, scale_value, Color("ff617e"), main.fx_root, main.particles)


static func boss_summon_minion(main: Node) -> void:
	var minion_type: String = ["grunt", "rusher"][randi() % 2]
	main.enemies_ai.spawn_enemy(main.actor_root, main.enemies, minion_type,
		float(main.current_wave.get("hp_scale", 1.0)), main.enemy_defs, main.config,
		int(main.current_wave.get("enemy_phase_level", 1)),
		float(main.current_wave.get("speed_mult", 1.0)), float(main.current_wave.get("damage_scale", 1.0)))


static func closest_target(main: Node) -> Dictionary:
	var cls: ClassResource = main.player_state.get("class")
	var r_limit := cls.range_val if cls != null else 15.0
	return main.enemies_ai.closest_target(main.enemies, main.boss_ref, main.player_node, r_limit)


static func spawn_aura_damage_number(main: Node, wp: Vector3, a: float, c: Color) -> void:
	main.dmg_numbers.spawn(main.fx_root, wp, a, c)
