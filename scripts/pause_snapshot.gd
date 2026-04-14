extends RefCounted

const TOUCH_DOCTRINE := preload("res://scripts/touch_doctrine.gd")


static func build(main: Node) -> Dictionary:
	if main == null or not main.get("player_state") is Dictionary:
		return {}
	var player_state: Dictionary = main.get("player_state")
	var cls: Variant = player_state.get("class")
	if cls == null:
		return {}
	var doctrine: Dictionary = TOUCH_DOCTRINE.resolve(cls)
	var title := "%s · %s" % [String(cls.name).to_upper(), String(doctrine["label"]).to_upper()]
	var boss_ref: Variant = main.get("boss_ref")
	var enemies: Variant = main.get("enemies")
	var boss_live: bool = boss_ref is Dictionary and not boss_ref.is_empty()
	var threat := "BOSS LIVE" if boss_live else "%d HOSTILES" % int(enemies.size() if enemies is Array else 0)
	var detail := "%s · %s LOCK · %s" % [String(doctrine["dash_label"]), String(doctrine["lock_prefix"]), threat]
	var hint := "Wave %d · %.0fs left" % [maxi(1, int(main.get("current_wave_index")) + 1), float(main.get("wave_time_remaining"))]
	var gm: Variant = main.get("game_mgr")
	if gm != null and gm.has_method("frame_budget_summary"):
		var budget: Dictionary = gm.frame_budget_summary()
		if bool(budget.get("has_data", false)):
			hint += " · %.0f FPS %s" % [float(budget.get("fps", 0.0)), String(budget.get("rating", "cold")).to_upper()]
	return {"title": title, "detail": detail, "hint": hint}
