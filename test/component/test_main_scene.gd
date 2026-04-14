extends GdUnitTestSuite

var _scene := preload("res://scenes/main.tscn")
var _mobile_session := preload("res://scripts/mobile_session_guard.gd")
var _suspended_run := preload("res://scripts/suspended_run.gd")


func test_scene_starts_run_and_hides_menu() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame

	main.configure_test_mode({
		"invincible": true,
		"auto_collect": true
	})
	main.start_run("holly_striker")
	await get_tree().process_frame

	assert_str(main.state).is_equal("playing")
	assert_bool(main.start_screen.visible).is_false()
	assert_bool(main.dash_button.visible).is_true()
	assert_object(main.player_node).is_not_null()


func test_level_up_overlay_and_upgrade_application() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("holly_striker")
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
	main.start_run("holly_striker")
	await get_tree().process_frame
	main.debug_spawn_boss()
	await get_tree().process_frame

	assert_bool(main.boss_panel.visible).is_true()
	assert_dict(main.boss_ref).is_not_empty()


func test_board_query_matches_continuous_arena_boundary() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("holly_striker")
	await get_tree().process_frame

	assert_str(main.debug_zone_at(Vector3.ZERO)).is_equal("arena")
	var ar := float(main.config["arena_radius"])
	assert_str(main.debug_zone_at(Vector3(ar * 1.6 + 3.0, 0.0, 0.0))).is_equal("void")
	assert_int(main.board_data["drifts"].size()).is_greater(0)
	assert_bool(main.debug_is_blocked(Vector3(ar * 1.6 + 0.5, 0.0, 0.0))).is_true()


func test_present_hover_updates_radar_chart_data() -> void:
	var select_ui: GDScript = preload("res://scripts/present_select_ui.gd")
	var radar_script: GDScript = preload("res://scripts/stat_radar_chart.gd")
	var root_ctrl: Control = auto_free(Control.new())
	add_child(root_ctrl)
	var radar_canvas: Control = radar_script.build(root_ctrl)
	# Build minimal present definitions
	var present_defs: Dictionary = {
		"alpha": {"name": "Alpha", "tagline": "First", "unlock": "default",
				"bow_color": "#ff0000", "hp": 100.0, "speed": 12.0, "damage": 14.0,
				"fire_rate": 0.22, "range": 15.0, "pierce": 1.0},
		"beta":  {"name": "Beta",  "tagline": "Second", "unlock": "default",
				"bow_color": "#00ff00", "hp": 150.0, "speed": 10.0, "damage": 20.0,
				"fire_rate": 0.30, "range": 12.0, "pierce": 2.0},
	}
	var container: HBoxContainer = auto_free(HBoxContainer.new())
	add_child(container)
	select_ui.build_present_buttons(container, present_defs, null, func(_b: Button) -> void: pass, radar_canvas)
	# Simulate hover on the second button
	var buttons: Array[Node] = container.get_children()
	assert_int(buttons.size()).is_equal(2)
	var second_btn: Button = buttons[1] as Button
	second_btn.mouse_entered.emit()
	await get_tree().process_frame
	# Radar canvas should now have values set for beta
	var values: Dictionary = radar_canvas.get_meta("radar_values", {})
	assert_bool(values.has("hp")).is_true()
	assert_str(select_ui._current_preview_id).is_not_empty()


func test_victory_unlocks_bumble_and_returns_to_menu_cleanly() -> void:
	SaveManager.set_save_path_for_tests("user://component_unlocks_test.json")
	SaveManager.reset_state_for_tests()
	SaveManager.load_state()

	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.configure_test_mode({"skip_between_match": true})
	main.start_run("holly_striker")
	await get_tree().process_frame
	main.debug_end_run(true)
	await get_tree().process_frame

	assert_str(main.state).is_equal("win")
	main._return_to_menu()
	await get_tree().process_frame
	assert_str(main.state).is_equal("menu")
	assert_bool(main.title_screen.visible).is_true()
	assert_bool(main.dash_button.visible).is_false()
	SaveManager.reset_state_for_tests()


func test_mobile_back_request_pauses_run_and_clears_touch_state() -> void:
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.start_run("holly_striker")
	await get_tree().process_frame
	main.touch_active = true
	main.input_move = Vector2(1.0, 0.0)
	main.move_velocity = Vector2(0.8, 0.0)
	main.dash_pressed = true

	_mobile_session.handle_notification(main, Node.NOTIFICATION_WM_GO_BACK_REQUEST)

	var pause_state: Dictionary = main.ui_mgr.widgets["pause"]
	assert_bool(main.get_tree().paused).is_true()
	assert_bool((pause_state["panel"] as PanelContainer).visible).is_true()
	assert_bool(main.touch_active).is_false()
	assert_vector(main.input_move).is_equal(Vector2.ZERO)
	assert_vector(main.move_velocity).is_equal(Vector2.ZERO)
	assert_bool(main.dash_pressed).is_false()
	main.ui_mgr.toggle_pause(main.get_tree())


func test_suspended_run_restore_recovers_checkpoint_and_start_affordance() -> void:
	SaveManager.set_save_path_for_tests("user://component_suspended_run_test.json")
	SaveManager.reset_state_for_tests()
	SaveManager.load_state()
	var main = auto_free(_scene.instantiate())
	add_child(main)
	await get_tree().process_frame
	main.configure_test_mode({"fixed_run_seed": 1225})
	main.start_run("holly_striker")
	await get_tree().process_frame
	main.current_wave_index = 2
	main.progression.level = 4
	main.progression.xp = 3
	main.progression.xp_needed = 11
	main.progression.kills = 9
	main.player_state["hp"] = 54.0
	main.player_state["max_hp"] = 120.0
	main.player_state["class"].damage = 37.0
	main.player_state["class"].fire_rate = 0.18
	main.run_cookies = 23
	main.rewraps = 2
	main.level_lookback = [{"bosses_spawned": 0, "scrolls_dropped": 1, "elapsed": 15.0}]
	_suspended_run.capture(main)
	assert_bool(_suspended_run.has_snapshot(SaveManager)).is_true()

	var restored = auto_free(_scene.instantiate())
	add_child(restored)
	await get_tree().process_frame
	var resume_button: Button = restored.start_screen.find_child("ResumeRunButton", true, false)
	assert_bool(resume_button.visible).is_true()
	assert_str(resume_button.text).contains("WAVE 3")
	assert_bool(restored._resume_suspended_run()).is_true()
	await get_tree().process_frame
	assert_str(restored.state).is_equal("playing")
	assert_int(restored.current_wave_index).is_equal(2)
	assert_int(restored.progression.level).is_equal(4)
	assert_int(restored.progression.kills).is_equal(9)
	assert_int(restored.run_cookies).is_equal(23)
	assert_int(restored.rewraps).is_equal(2)
	assert_float(float(restored.player_state["hp"])).is_equal_approx(54.0, 0.001)
	assert_float(float(restored.player_state["class"].damage)).is_equal_approx(37.0, 0.001)
	assert_bool(_suspended_run.has_snapshot(SaveManager)).is_false()
	SaveManager.reset_state_for_tests()
