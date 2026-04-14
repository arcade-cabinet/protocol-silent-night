extends RefCounted

## Static helpers for board generation and menu transitions.

const WORLD_BUILDER := preload("res://scripts/world_builder.gd")

const EVENT_HELPERS := preload("res://scripts/game_event_helpers.gd")
const SUSPENDED_RUN := preload("res://scripts/suspended_run.gd")


static func build_board(main: Node) -> void:
	main.obstacle_colliders.clear()
	main.board_data = main.board_generator.generate_board(int(main.config.get("board_seed", 1225)) + main.progression.level, main.config)
	var layout: BoardLayout = main.board_data
	main.board_builder.build_board_foundation(main.board_root, float(main.config.get("arena_radius", 18.0)))
	main.board_builder.build_snow_drifts(main.board_root, layout)
	main.board_builder.build_outer_ridge(main.board_root, layout)
	for obstacle in layout.obstacles:
		main.obstacles_builder.make_obstacle(main.board_root, obstacle, main.obstacle_colliders)
	for landmark in layout.landmarks:
		main.obstacles_builder.make_landmark(main.board_root, landmark)


static func return_to_menu(main: Node) -> void:
	main.state = "menu"
	if main.weather_director != null: main.weather_director.set_intensity(0, 10, 1)
	main.move_velocity = Vector2.ZERO
	main.input_move = Vector2.ZERO
	main.touch_active = false
	main.dash_pressed = false
	var ui: RefCounted = main.ui_mgr
	ui.end_screen.visible = false
	ui.level_screen.visible = false
	ui.dash_button.visible = false
	ui.hud_root.visible = false
	ui.start_screen.visible = true
	ui.boss_panel.visible = false
	if ui.difficulty_panel != null:
		ui.difficulty_panel.visible = false
	ui.hide_joystick()
	SUSPENDED_RUN.clear(main._save_manager())
	EVENT_HELPERS.clear_runtime(main)
	main._refresh_start_screen()
