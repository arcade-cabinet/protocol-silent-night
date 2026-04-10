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
	assert_str(JSON.stringify(board_a["obstacles"])).is_equal(JSON.stringify(board_b["obstacles"]))
	assert_str(JSON.stringify(board_a["landmarks"])).is_equal(JSON.stringify(board_b["landmarks"]))


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
	assert_int(board["obstacles"].size()).is_greater(0)
	assert_int(board["landmarks"].size()).is_greater(0)

	for drift in board["drifts"]:
		var world: Vector2 = drift["world"]
		assert_float(world.length()).is_greater(safe_radius)
		assert_float(world.length()).is_less(arena_radius)

	for ridge in board["ridges"]:
		var world: Vector2 = ridge["world"]
		assert_float(world.length()).is_greater(arena_radius)


func test_obstacles_respect_safe_radius() -> void:
	var generator = _generator_script.new()
	var config := {
		"arena_radius": 17.8,
		"player_spawn_safe_radius": 5.5
	}
	var board: Dictionary = generator.generate_board(1225, config)
	var safe_radius: float = board["safe_radius"]
	var obstacle_safe_margin: float = safe_radius + 1.5

	assert_int(board["obstacles"].size()).is_greater_equal(4)
	assert_int(board["obstacles"].size()).is_less_equal(8)

	for obstacle in board["obstacles"]:
		var world: Vector2 = obstacle["world"]
		assert_float(world.length()).is_greater_equal(obstacle_safe_margin)

	# Verify no two obstacles overlap (minimum 2.0 distance)
	var obstacles: Array = board["obstacles"]
	for i in range(obstacles.size()):
		for j in range(i + 1, obstacles.size()):
			var dist: float = (obstacles[i]["world"] as Vector2).distance_to(obstacles[j]["world"] as Vector2)
			assert_float(dist).is_greater_equal(2.0)


func test_generate_board_has_no_zone_mask_key() -> void:
	var generator = _generator_script.new()
	var board: Dictionary = generator.generate_board(42, {"arena_radius": 18.0})
	# zone_mask was dead code (shader handles radial zones); removed in review pass
	assert_bool(board.has("zone_mask")).is_false()
	assert_bool(board.has("drifts")).is_true()
	assert_bool(board.has("ridges")).is_true()
