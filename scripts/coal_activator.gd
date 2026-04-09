extends RefCounted

## Resolves a coal effect descriptor against live game state.
## Coal_queue entries are effect_id strings; activation rolls the descriptor
## via CoalEffects.apply_effect and applies it to enemies / player / cookies.

const COAL_EFFECTS := preload("res://scripts/coal_effects.gd")
const COAL_VFX := preload("res://scripts/coal_vfx.gd")

var rng := RandomNumberGenerator.new()


func _init() -> void:
	rng.seed = int(Time.get_ticks_usec()) ^ 0xC0A1


func activate(main: Node, idx: int) -> void:
	if idx < 0 or idx >= main.coal_queue.size():
		return
	var entry = main.coal_queue[idx]
	var effect_id := String(entry) if not (entry is Dictionary) else String(entry.get("effect_id", ""))
	var rarity: String = String(entry.get("rarity", "common")) if entry is Dictionary else "common"
	var descriptor: Dictionary = COAL_EFFECTS.apply_effect(effect_id, rng, rarity)
	if not bool(descriptor.get("ok", false)):
		return
	if not _apply(main, descriptor, effect_id):
		return
	main.coal_queue.remove_at(idx)
	if main.ui_mgr != null:
		main.ui_mgr.show_message(String(descriptor.get("message", "COAL!")), 1.4, Color(String(descriptor.get("color", "#ffffff"))))
	if main.audio_mgr != null and main.audio_mgr.has_method("play_coal"):
		main.audio_mgr.play_coal(effect_id)


func _apply(main: Node, d: Dictionary, effect_id: String) -> bool:
	var kind := String(d.get("kind", ""))
	var ok: bool = false
	match kind:
		"aoe_damage", "explosion", "aura":
			_damage_enemies_in_radius(main, float(d.get("damage", 0.0)), float(d.get("radius", 3.0)))
			if kind == "explosion":
				main._damage_player(float(d.get("self_damage", 0.0)))
			ok = true
		"single_target":
			_damage_closest(main, float(d.get("damage", 0.0)))
			ok = true
		"self_damage":
			main._damage_player(float(d.get("damage", 0.0)))
			ok = true
		"cookie_bonus":
			main.run_cookies += int(d.get("cookies", 0))
			main._update_ui()
			ok = true
	if ok and main.player_node != null and main.particles != null and main.fx_root != null:
		COAL_VFX.spawn_for_effect(main.particles, main.fx_root, main.player_node.position, effect_id, Color(0, 0, 0, 0))
	if ok and main.screen_shake != null:
		var trauma_amounts: Dictionary = {"backfire": 0.9, "hurl": 0.6, "spray": 0.4, "embers": 0.25, "poison": 0.15, "fortune": 0.1}
		main.screen_shake.add_trauma(float(trauma_amounts.get(effect_id, 0.3)))
	return ok


func _damage_enemies_in_radius(main: Node, dmg: float, radius: float) -> void:
	if main.player_node == null or dmg <= 0.0:
		return
	var origin: Vector3 = main.player_node.position
	for i in range(main.enemies.size() - 1, -1, -1):
		var enemy: Dictionary = main.enemies[i]
		if origin.distance_to(enemy["node"].position) <= radius:
			enemy["hp"] = float(enemy.get("hp", 0.0)) - dmg
			if float(enemy["hp"]) <= 0.0:
				main._kill_enemy(i)


func _damage_closest(main: Node, dmg: float) -> void:
	if main.player_node == null or main.enemies.is_empty() or dmg <= 0.0:
		return
	var origin: Vector3 = main.player_node.position
	var best_idx := -1
	var best_d := INF
	for i in range(main.enemies.size()):
		var d := origin.distance_to(main.enemies[i]["node"].position)
		if d < best_d:
			best_d = d
			best_idx = i
	if best_idx >= 0:
		var enemy: Dictionary = main.enemies[best_idx]
		enemy["hp"] = float(enemy.get("hp", 0.0)) - dmg
		if float(enemy["hp"]) <= 0.0:
			main._kill_enemy(best_idx)
