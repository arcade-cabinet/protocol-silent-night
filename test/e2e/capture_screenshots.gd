extends SceneTree

const SAVE_MANAGER_SCRIPT := preload("res://scripts/save_manager.gd")

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"
var _save_manager: Node = null


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(1440, 900))
	_save_manager = _ensure_save_manager()
	_save_manager.set_save_path_for_tests("user://screenshot_capture.json")
	_save_manager.reset_state_for_tests()
	_save_manager.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	await process_frame

	await _main.capture_screenshot("%s/menu.png" % _shot_dir)
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"player_damage_scale": 0.25,
		"player_fire_scale": 3.0
	})
	_save_manager.set_equipped_gear({
		"weapon_mod": {"id": "demo_w", "name": "Frozen Candy Cane", "slot": "weapon_mod", "rarity": 4, "stats": {"damage_mult": 0.15}, "flair": [{"type": "orbiting_particle", "count": 3, "radius": 0.6, "color": "#88ddff"}, {"type": "ember_glow", "color": "#ff6622"}], "flavor": "A peppermint barrel", "color": "#aaddff"},
		"bow_accessory": {"id": "demo_b", "name": "Gilded Jingle Bell", "slot": "bow_accessory", "rarity": 5, "stats": {"crit_chance": 0.08}, "flair": [{"type": "halo_ring", "radius": 0.9, "color": "#ffd700"}, {"type": "sparkle_burst", "count": 4, "color": "#ffd700"}], "flavor": "Rings on every shot", "color": "#ffd700"},
		"tag_charm": {"id": "demo_t", "name": "Lucky Star Tag", "slot": "tag_charm", "rarity": 3, "stats": {"cookie_bonus": 0.1}, "flair": [{"type": "frost_crystals", "count": 3, "color": "#ccf0ff"}], "flavor": "Shines bright", "color": "#ffffaa"},
	})
	_main.start_run("holly_striker")
	for _i in range(120):
		await process_frame
	for _j in range(3):
		_main.dmg_numbers.spawn(_main.fx_root, Vector3(randf_range(-6.0, -4.0), 1.2, randf_range(-4.0, -2.0)), randf_range(8.0, 40.0), Color("ffd166"), _j % 3 == 0)
	_main.particles.spawn_death_burst(_main.fx_root, Vector3(2.2, 0.0, -1.5), Color("ff617e"), 1.2)
	_main.particles.spawn_death_burst(_main.fx_root, Vector3(-3.0, 0.0, 1.8), Color("8cff8e"), 1.0)
	_main.particles.spawn_muzzle_flash(_main.fx_root, Vector3(0.4, 0.9, 0.3), Vector3(1, 0, 0), Color("69d6ff"))
	_main.particles.spawn_pickup_sparkle(_main.fx_root, Vector3(-1.5, 0.2, -2.5))
	var _scroll_rng := RandomNumberGenerator.new()
	_scroll_rng.seed = 101
	_main.scroll_pickup_mgr.spawn_scroll(_main.pickup_root, _main.pickups,
		Vector3(2.5, 0.0, 1.0), _scroll_rng)
	_scroll_rng.seed = 202
	_main.scroll_pickup_mgr.spawn_scroll(_main.pickup_root, _main.pickups,
		Vector3(-2.5, 0.0, -0.5), _scroll_rng)
	_main.coal_queue.append("fortune")
	_main.coal_queue.append("spray")
	_main.ui_mgr.refresh_coal_sidebar(_main.coal_queue)
	_main._update_ui()
	_main.particles.update(0.02)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/gameplay.png" % _shot_dir)

	var prev_cam_size: float = _main.camera.size
	_main.camera.size = 8.0
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/gear_detail.png" % _shot_dir)
	_main.camera.size = prev_cam_size

	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": false
	})
	_main.debug_force_level_up()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/level_up.png" % _shot_dir)

	_main._apply_upgrade("damage")
	_main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true
	})
	_main.debug_spawn_boss()
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/boss.png" % _shot_dir)

	_main.debug_end_run(true)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/victory.png" % _shot_dir)

	_main.debug_end_run(false)
	await process_frame
	await process_frame
	await _main.capture_screenshot("%s/defeat.png" % _shot_dir)

	# Scroll-opening screen with pre-filled results
	_main.run_scrolls = [
		{"scroll_type": "nice"},
		{"scroll_type": "nice"},
		{"scroll_type": "naughty"},
		{"scroll_type": "nice"},
		{"scroll_type": "naughty"},
		{"scroll_type": "naughty"},
		{"scroll_type": "nice"},
	]
	if _main.between_match != null:
		var summary: Dictionary = _main.between_match.open_scrolls()
		_main.between_match.scroll_state["panel"].visible = true
		load("res://scripts/between_match_screens.gd").populate_scroll_grid(
			_main.between_match.scroll_state, summary.get("outcomes", []))
		await process_frame
		await process_frame
		await _main.capture_screenshot("%s/scroll_screen.png" % _shot_dir)
		_main.between_match.scroll_state["panel"].visible = false

		# Market screen with 3D gear previews
		var MARKET_SCREEN := load("res://scripts/market_screen.gd")
		var demo_items := [
			{"id": "m1", "name": "Frozen Candy Barrel", "slot": "weapon_mod", "rarity": 3,
			 "stats": {"damage_mult": 0.12}, "flair": [{"type": "frost_crystals", "count": 3, "color": "#ccf0ff"}],
			 "flavor": "Peppermint power", "color": "#aaddff"},
			{"id": "m2", "name": "Gilded Jingle Bow", "slot": "bow_accessory", "rarity": 5,
			 "stats": {"crit_chance": 0.08}, "flair": [{"type": "halo_ring", "radius": 0.8, "color": "#ffd700"}, {"type": "sparkle_burst", "count": 4, "color": "#ffd700"}],
			 "flavor": "Rings on every shot", "color": "#ffd700"},
			{"id": "m3", "name": "Razor Tag of Fortune", "slot": "tag_charm", "rarity": 2,
			 "stats": {"cookie_bonus": 0.1}, "flair": [{"type": "orbiting_particle", "count": 2, "radius": 0.5, "color": "#88ddff"}],
			 "flavor": "Lucky charm", "color": "#55ff88"},
		]
		MARKET_SCREEN.refresh_market(_main.between_match.market_state, demo_items, 500)
		_main.between_match.market_state["panel"].visible = true
		await process_frame
		await process_frame
		await process_frame
		await _main.capture_screenshot("%s/market.png" % _shot_dir)

	_save_manager.reset_state_for_tests()
	quit(0)


func _ensure_save_manager() -> Node:
	var existing := root.get_node_or_null("SaveManager")
	if existing != null:
		return existing
	var save_manager := SAVE_MANAGER_SCRIPT.new()
	save_manager.name = "SaveManager"
	root.add_child(save_manager)
	return save_manager
