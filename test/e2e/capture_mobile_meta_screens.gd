extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")
const SCREENS := preload("res://scripts/between_match_screens.gd")
const MARKET := preload("res://scripts/market_screen.gd")

var _main: Node = null
var _save_manager: Node = null
var _shot_dir := "res://.artifacts/screenshots"


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://mobile_meta_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await _settle_frames(2)
	_hide_base_screens()
	await _capture_results()
	await _capture_scrolls()
	await _capture_market()
	_save_manager.reset_state_for_tests()
	quit(0)


func _capture_results() -> void:
	SCREENS.update_results(_main.between_match.results_state, {
		"level": 14,
		"kills": 286,
		"cookies": 112,
		"scrolls": 7,
	})
	_show_panel(_main.between_match.results_state["panel"])
	await _capture("results_mobile.png", 3)


func _capture_scrolls() -> void:
	SCREENS.populate_scroll_grid(_main.between_match.scroll_state, [
		{"type": "nice", "cookies": 15},
		{"type": "naughty", "effect_id": "fortune_blight", "rarity": "rare"},
		{"type": "nice", "cookies": 15},
		{"type": "naughty", "effect_id": "jammed_dash", "rarity": "epic"},
		{"type": "nice", "cookies": 15},
		{"type": "nice", "cookies": 15},
		{"type": "naughty", "effect_id": "sour_wrapping", "rarity": "common"},
	])
	_show_panel(_main.between_match.scroll_state["panel"])
	await _capture("scroll_mobile.png", 3)


func _capture_market() -> void:
	MARKET.refresh_market(_main.between_match.market_state, [
		{
			"id": "m1", "name": "Burning Candy Barrel of Fury", "slot": "weapon_mod",
			"rarity": 4, "stats": {"damage_mult": 0.17, "bullet_speed_mult": 0.14},
			"flavor": "Peppermint recoil and ember spit.",
			"color": "#ff6622"
		},
		{
			"id": "m2", "name": "Gilded Riot Bow of Fortune", "slot": "bow_accessory",
			"rarity": 5, "stats": {"crit_chance": 0.12, "cookie_bonus": 0.16},
			"flavor": "Every shot rings like a stolen sleigh bell.",
			"color": "#ffd700"
		},
		{
			"id": "m3", "name": "Frozen Wrap of Evasion", "slot": "wrapping_upgrade",
			"rarity": 3, "stats": {"dash_cooldown_mult": 0.1, "hp_flat": 24},
			"flavor": "Cold foil, fast feet, no mercy.",
			"color": "#aaddff"
		},
	], 145)
	_show_panel(_main.between_match.market_state["panel"])
	await _capture("market_mobile.png", 6)


func _capture(file_name: String, settle_frames: int) -> void:
	await _settle_frames(settle_frames)
	await _main.capture_screenshot("%s/%s" % [_shot_dir, file_name])
	_hide_meta_panels()


func _hide_base_screens() -> void:
	_main.ui_mgr.title_screen.visible = false
	_main.ui_mgr.start_screen.visible = false
	_main.ui_mgr.progress_screen.visible = false
	_main.ui_mgr.show_message("", 0.0)


func _show_panel(panel: PanelContainer) -> void:
	_hide_meta_panels()
	panel.visible = true


func _hide_meta_panels() -> void:
	_main.between_match.results_state["panel"].visible = false
	_main.between_match.scroll_state["panel"].visible = false
	_main.between_match.market_state["panel"].visible = false


func _settle_frames(count: int) -> void:
	for _i in range(count):
		await process_frame


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
