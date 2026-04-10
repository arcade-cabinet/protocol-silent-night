extends GdUnitTestSuite
## E2E: full session flow — present select → wave 1 → wave_clear →
## wave 2 → wave_clear → end run → return to menu.
## Uses manual_tick to control simulation time precisely.

var _scene := preload("res://scenes/main.tscn")


func test_full_session_flow() -> void:
	SaveManager.set_save_path_for_tests("user://e2e_session_flow_test.json")
	SaveManager.reset_state_for_tests()
	SaveManager.load_state()

	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame

	main.configure_test_mode({
		"invincible": true,
		"auto_collect": true,
		"auto_choose_upgrade": true,
		"manual_tick": true,
		"skip_between_match": true,
	})
	main.start_run("holly_striker")
	await get_tree().process_frame

	# --- Initial state: playing ---
	assert_str(main.state).is_equal("playing")
	assert_bool(main.start_screen.visible).is_false()
	assert_object(main.player_node).is_not_null()

	# --- Wave 1: drain timer → wave_clear ---
	main.wave_time_remaining = 0.0
	main.debug_tick(0.1)
	await get_tree().process_frame
	assert_str(main.state).is_equal("wave_clear")

	# Tick through 2s wave_clear timer
	var ticks := 0
	while main.state == "wave_clear" and ticks < 60:
		main.debug_tick(0.1)
		ticks += 1
	await get_tree().process_frame
	assert_str(main.state).is_equal("playing")
	assert_int(main.current_wave_index).is_equal(1)  # wave 2 (0-indexed)

	# --- Wave 2: same pattern ---
	main.wave_time_remaining = 0.0
	main.debug_tick(0.1)
	await get_tree().process_frame
	assert_str(main.state).is_equal("wave_clear")

	ticks = 0
	while main.state == "wave_clear" and ticks < 60:
		main.debug_tick(0.1)
		ticks += 1
	await get_tree().process_frame
	assert_str(main.state).is_equal("playing")
	assert_int(main.current_wave_index).is_equal(2)  # wave 3 started

	# --- End run (win) ---
	main.debug_end_run(true)
	await get_tree().process_frame
	assert_str(main.state).is_equal("win")

	# --- Return to menu ---
	main._return_to_menu()
	await get_tree().process_frame
	assert_str(main.state).is_equal("menu")
	assert_bool(main.start_screen.visible).is_true()
	assert_bool(main.dash_button.visible).is_false()
	assert_bool(SaveManager.is_unlocked("bumble")).is_true()

	SaveManager.reset_state_for_tests()
