extends RefCounted
class_name BoardGenerator


func generate_board(board_seed: int, config: Dictionary) -> Dictionary:
	var rng := RandomNumberGenerator.new()
	rng.seed = board_seed
	var arena_radius := float(config.get("arena_radius", 18.0))
	var safe_radius := float(config.get("player_spawn_safe_radius", 5.0))
	var drifts: Array = []
	var ridges: Array = []

	var drift_count := 5 + rng.randi_range(0, 3)
	for drift_index in range(drift_count):
		var angle := rng.randf() * TAU
		var radius := rng.randf_range(safe_radius * 1.15, arena_radius * 0.8)
		drifts.append({
			"world": Vector2.RIGHT.rotated(angle) * radius,
			"radius": rng.randf_range(1.2, 2.7),
			"stretch": rng.randf_range(0.8, 1.5),
			"rotation": rng.randf_range(0.0, TAU)
		})

	var ridge_count := 18
	for ridge_index in range(ridge_count):
		var angle_step := TAU * float(ridge_index) / float(ridge_count)
		var angle := angle_step + rng.randf_range(-0.08, 0.08)
		var distance := arena_radius + rng.randf_range(2.4, 5.8)
		ridges.append({
			"world": Vector2.RIGHT.rotated(angle) * distance,
			"radius": rng.randf_range(1.0, 2.8),
			"height": rng.randf_range(2.4, 7.0),
			"rotation": rng.randf_range(0.0, TAU),
			"snow_cap": rng.randf() > 0.42
		})

	var obstacle_types := ["gift_stack", "bollard_cluster", "crate"]
	var obstacles: Array = []
	var obstacle_count := rng.randi_range(4, 8)
	var min_obstacle_dist := 2.0
	var obstacle_safe_margin := safe_radius + 1.5
	for obstacle_index in range(obstacle_count):
		var placed := false
		for attempt in range(40):
			var angle := rng.randf() * TAU
			var radius := rng.randf_range(obstacle_safe_margin, arena_radius * 0.85)
			var candidate := Vector2.RIGHT.rotated(angle) * radius
			var too_close := false
			for existing in obstacles:
				if candidate.distance_to(existing["world"]) < min_obstacle_dist:
					too_close = true
					break
			if not too_close:
				obstacles.append({
					"world": candidate,
					"type": obstacle_types[rng.randi_range(0, obstacle_types.size() - 1)]
				})
				placed = true
				break

	var landmark_types := ["candy_cane_gate", "wreath_machine", "present_heap", "signal_pylon"]
	var landmarks: Array = []
	var landmark_count := rng.randi_range(2, 4)
	for landmark_index in range(landmark_count):
		var placed := false
		for attempt in range(40):
			var angle := rng.randf() * TAU
			var radius := rng.randf_range(arena_radius * 0.88, arena_radius + 1.0)
			var candidate := Vector2.RIGHT.rotated(angle) * radius
			var too_close := false
			for existing in landmarks:
				if candidate.distance_to(existing["world"]) < 3.0:
					too_close = true
					break
			if not too_close:
				landmarks.append({
					"world": candidate,
					"type": landmark_types[rng.randi_range(0, landmark_types.size() - 1)]
				})
				placed = true
				break

	return {
		"seed": board_seed,
		"safe_radius": safe_radius,
		"drifts": drifts,
		"ridges": ridges,
		"obstacles": obstacles,
		"landmarks": landmarks
	}
