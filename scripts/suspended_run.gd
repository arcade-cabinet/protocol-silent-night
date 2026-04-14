extends RefCounted

const BOARD_HELPERS := preload("res://scripts/board_helpers.gd")
const EVENT_HELPERS := preload("res://scripts/game_event_helpers.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")
const WAVE_FORMULA := preload("res://scripts/wave_formula.gd")

const CLASS_KEYS := [
	"id", "name", "max_hp", "speed", "fire_rate", "damage", "range_val", "bullet_speed",
	"bullet_scale", "shot_count", "spread", "pierce", "color", "dash_cooldown",
	"contact_damage_reduction", "xp_bonus", "cookie_bonus", "crit_chance",
]
const PLAYER_KEYS := ["hp", "max_hp", "last_shot", "aura_level", "aura_timer", "damage_stacks", "fire_rate_stacks"]


static func capture(main: Node) -> void:
	var save_manager := _save_manager(main)
	if save_manager == null or not _can_capture(main):
		return
	save_manager.state["suspended_run"] = _snapshot(main)
	save_manager.save_state()


static func clear(save_manager: Node) -> void:
	if save_manager == null:
		return
	save_manager.state["suspended_run"] = {}
	save_manager.save_state()


static func has_snapshot(save_manager: Node) -> bool:
	return not _snapshot_dict(save_manager).is_empty()


static func restore(main: Node) -> bool:
	var save_manager := _save_manager(main)
	var snapshot := _snapshot_dict(save_manager)
	if save_manager == null or snapshot.is_empty():
		return false
	var class_id := String(snapshot.get("class_id", ""))
	if not main.present_defs.has(class_id):
		clear(save_manager)
		return false
	EVENT_HELPERS.clear_runtime(main)
	main.current_class_id = class_id
	main.state = "playing"
	main.current_wave_index = maxi(-1, int(snapshot.get("resume_level", 1)) - 2)
	main.run_seed = int(snapshot.get("run_seed", 0))
	seed(main.run_seed)
	main.game_mgr.wave_spawner.configure_seed(main.run_seed)
	main.board_obj_handler.configure_seed(main.run_seed)
	main.particles._rng.seed = main.run_seed ^ 0xFACE12
	main.screen_shake._rng.seed = main.run_seed ^ 0x5AE1
	main.screen_shake.reset()
	main.progression.reset()
	_apply_progression(main.progression, snapshot.get("progression", {}))
	main.dash_timer = 0.0
	main.dash_cooldown_timer = 0.0
	main.move_velocity = Vector2.ZERO
	main.input_move = Vector2.ZERO
	main.touch_active = false
	main.dash_pressed = false
	main.boss_ref = {}
	main.level_lookback = _array_copy(snapshot.get("level_lookback", []))
	main.game_mgr.frame_budget.reset()
	main.difficulty_tier = int(snapshot.get("difficulty_tier", 1))
	main.permadeath = bool(snapshot.get("permadeath", false))
	main.endless_mode = bool(snapshot.get("endless_mode", false))
	main.rewraps = int(snapshot.get("rewraps", 0))
	main.run_cookies = int(snapshot.get("run_cookies", 0))
	main.run_scrolls = _array_copy(snapshot.get("run_scrolls", []))
	main.coal_queue = _array_copy(snapshot.get("coal_queue", []))
	MAIN_HELPERS.load_equipped_gear(main, save_manager)
	MAIN_HELPERS.apply_reduced_motion(main, save_manager)
	BOARD_HELPERS.build_board(main)
	main.game_mgr.spawn_player()
	_apply_player(main.player_state, snapshot.get("player_state", {}))
	main._update_ui()
	MAIN_HELPERS.show_gameplay_ui(main)
	_configure_wave(main, int(snapshot.get("resume_level", 1)), save_manager)
	clear(save_manager)
	return true


static func summary(save_manager: Node, present_defs: Dictionary = {}) -> Dictionary:
	var snapshot := _snapshot_dict(save_manager)
	if snapshot.is_empty():
		return {}
	var class_id := String(snapshot.get("class_id", ""))
	var present_name := String(present_defs.get(class_id, {}).get("name", class_id))
	return {"class_id": class_id, "present_name": present_name, "resume_level": int(snapshot.get("resume_level", 1))}


static func _snapshot(main: Node) -> Dictionary:
	return {
		"class_id": String(main.current_class_id),
		"run_seed": int(main.run_seed),
		"resume_level": _resume_level(main),
		"difficulty_tier": int(main.difficulty_tier),
		"permadeath": bool(main.permadeath),
		"endless_mode": bool(main.endless_mode),
		"rewraps": int(main.rewraps),
		"run_cookies": int(main.run_cookies),
		"run_scrolls": _array_copy(main.run_scrolls),
		"coal_queue": _array_copy(main.coal_queue),
		"level_lookback": _array_copy(main.level_lookback),
		"progression": {"level": int(main.progression.level), "xp": int(main.progression.xp), "xp_needed": int(main.progression.xp_needed), "kills": int(main.progression.kills)},
		"player_state": _player_state(main.player_state),
	}


static func _player_state(player_state: Dictionary) -> Dictionary:
	var snapshot := {}
	var cls: Variant = player_state.get("class")
	for key in PLAYER_KEYS:
		snapshot[key] = player_state.get(key, 0)
	snapshot["class"] = _class_state(cls)
	return snapshot


static func _class_state(cls: Variant) -> Dictionary:
	var snapshot := {}
	if cls == null:
		return snapshot
	for key in CLASS_KEYS:
		snapshot[key] = cls.get(key)
	return snapshot


static func _apply_progression(progression: RefCounted, snapshot: Dictionary) -> void:
	progression.level = int(snapshot.get("level", 1))
	progression.xp = int(snapshot.get("xp", 0))
	progression.xp_needed = int(snapshot.get("xp_needed", 5))
	progression.kills = int(snapshot.get("kills", 0))


static func _apply_player(player_state: Dictionary, snapshot: Dictionary) -> void:
	var cls: Variant = player_state.get("class")
	var cls_snapshot: Dictionary = snapshot.get("class", {})
	for key in CLASS_KEYS:
		if cls != null and cls_snapshot.has(key):
			cls.set(key, cls_snapshot[key])
	for key in PLAYER_KEYS:
		if snapshot.has(key):
			player_state[key] = snapshot[key]


static func _configure_wave(main: Node, resume_level: int, save_manager: Node) -> void:
	main.current_wave_index = maxi(0, resume_level - 1)
	if main.weather_director != null:
		main.weather_director.set_intensity(resume_level, 10, main.difficulty_tier)
	main.current_wave = WAVE_FORMULA.generate_wave(main.run_seed, resume_level, main.level_lookback, main.difficulty_tier)
	main.game_mgr.wave_spawner.reset_for_level()
	main.wave_time_remaining = float(main.current_wave.get("countdown", 120.0))
	main.spawn_timer = 0.0
	main.state = "playing"
	main.ui_mgr.wave_label.text = "LEVEL %d" % resume_level
	main.ui_mgr.timer_label.text = "%.0f" % main.wave_time_remaining
	main.ui_mgr.show_message("RUN RESTORED · WAVE %d" % resume_level, 1.8, Color("69d6ff"))
	if main.audio_mgr != null:
		main.audio_mgr.play_wave_banner()
		if main.current_wave.get("is_boss_wave", false):
			main.audio_mgr.play_music("boss")
	if save_manager != null:
		save_manager.register_wave_reached(resume_level)
		save_manager.register_level_reached(resume_level)
	for _i in range(int(main.config.get("board_objects_per_level", 2))):
		main.game_mgr._spawn_board_object()


static func _resume_level(main: Node) -> int:
	return maxi(1, int(main.current_wave_index) + (2 if String(main.state) == "wave_clear" else 1))


static func _snapshot_dict(save_manager: Node) -> Dictionary:
	if save_manager == null:
		return {}
	var raw: Variant = save_manager.state.get("suspended_run", {})
	return raw.duplicate(true) if raw is Dictionary and not raw.is_empty() else {}


static func _can_capture(main: Node) -> bool:
	return main != null and String(main.get("state")) in ["playing", "wave_clear", "level_up"]


static func _save_manager(main: Node) -> Node:
	return main._save_manager() if main != null and main.has_method("_save_manager") else null


static func _array_copy(value: Variant) -> Array:
	return value.duplicate(true) if value is Array else []
