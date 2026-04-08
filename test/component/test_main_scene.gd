extends GdUnitTestSuite

var _scene := preload("res://scenes/main.tscn")


func test_scene_starts_run_and_hides_menu() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame

	main.configure_test_mode({
		"invincible": true,
		"auto_collect": true
	})
	main.start_run("elf")
	await get_tree().process_frame

	assert_str(main.state).is_equal("playing")
	assert_bool(main.start_screen.visible).is_false()
	assert_bool(main.dash_button.visible).is_true()
	assert_object(main.player_node).is_not_null()


func test_level_up_overlay_and_upgrade_application() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("elf")
	await get_tree().process_frame

	var before_damage: float = float(main.player_state["class"]["damage"])
	main.debug_force_level_up()
	await get_tree().process_frame
	assert_bool(main.level_screen.visible).is_true()

	main._apply_upgrade("damage")
	await get_tree().process_frame
	assert_bool(main.level_screen.visible).is_false()
	assert_float(float(main.player_state["class"]["damage"])).is_greater(before_damage)


func test_boss_panel_shows_when_boss_spawns() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("elf")
	await get_tree().process_frame
	main.debug_spawn_boss()
	await get_tree().process_frame

	assert_bool(main.boss_panel.visible).is_true()
	assert_dict(main.boss_ref).is_not_empty()


func test_board_query_matches_continuous_arena_boundary() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("elf")
	await get_tree().process_frame

	assert_str(main.debug_zone_at(Vector3.ZERO)).is_equal("arena")
	assert_str(main.debug_zone_at(Vector3(float(main.config["arena_radius"]) + 3.0, 0.0, 0.0))).is_equal("void")
	assert_int(main.board_data["drifts"].size()).is_greater(0)
	assert_int(main.board_data["ridges"].size()).is_equal(18)
	assert_bool(main.debug_is_blocked(Vector3(float(main.config["arena_radius"]) + 0.5, 0.0, 0.0))).is_true()


func test_victory_unlocks_bumble_and_returns_to_menu_cleanly() -> void:
	SaveManager.set_save_path_for_tests("user://component_unlocks_test.json")
	SaveManager.reset_state_for_tests()
	SaveManager.load_state()

	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("elf")
	await get_tree().process_frame
	main.debug_end_run(true)
	await get_tree().process_frame

	assert_str(main.state).is_equal("win")
	assert_bool(SaveManager.is_unlocked("bumble")).is_true()
	main._return_to_menu()
	await get_tree().process_frame
	assert_str(main.state).is_equal("menu")
	assert_bool(main.start_screen.visible).is_true()
	assert_bool(main.dash_button.visible).is_false()
	SaveManager.reset_state_for_tests()
