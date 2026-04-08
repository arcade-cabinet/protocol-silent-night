extends GdUnitTestSuite

var _generator_script := preload("res://scripts/board_generator.gd")


func test_generate_board_is_deterministic() -> void:
	var generator = _generator_script.new()
	var config := {
		"arena_radius": 17.8,
		"player_spawn_safe_radius": 5.5
	}
	var board_a: Dictionary = generator.generate_board(99, config)
	var board_b: Dictionary = generator.generate_board(99, config)

	assert_str(JSON.stringify(board_a["drifts"])).is_equal(JSON.stringify(board_b["drifts"]))
	assert_str(JSON.stringify(board_a["ridges"])).is_equal(JSON.stringify(board_b["ridges"]))


func test_generate_board_reserves_player_safe_space_and_builds_outer_ridge() -> void:
	var generator = _generator_script.new()
	var config := {
		"arena_radius": 17.8,
		"player_spawn_safe_radius": 5.5
	}
	var board: Dictionary = generator.generate_board(1225, config)
	var safe_radius: float = board["safe_radius"]
	var arena_radius: float = config["arena_radius"]

	assert_int(board["drifts"].size()).is_greater(4)
	assert_int(board["ridges"].size()).is_equal(18)
	assert_int(board["obstacles"].size()).is_equal(0)

	for drift in board["drifts"]:
		var world: Vector2 = drift["world"]
		assert_float(world.length()).is_greater(safe_radius)
		assert_float(world.length()).is_less(arena_radius)

	for ridge in board["ridges"]:
		var world: Vector2 = ridge["world"]
		assert_float(world.length()).is_greater(arena_radius)
