extends RefCounted


static func build_world(main: Node3D) -> void:
	var world_environment := WorldEnvironment.new()
	world_environment.name = "WorldEnvironment"
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("09121b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("a5bbd2")
	env.ambient_light_energy = 0.7
	env.fog_enabled = true
	env.fog_light_color = Color("2d4762")
	env.fog_light_energy = 0.2
	env.fog_density = 0.0022
	env.glow_enabled = true
	env.glow_intensity = 0.65
	world_environment.environment = env
	main.add_child(world_environment)

	var camera := Camera3D.new()
	camera.name = "GameCamera"
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 42.0
	camera.position = Vector3(0, 30.0, 0.01)
	camera.rotation_degrees = Vector3(-90, 0, 0)
	main.add_child(camera)
	main.camera = camera

	var directional_light := DirectionalLight3D.new()
	directional_light.name = "DirLight"
	directional_light.light_color = Color("d6ecff")
	directional_light.light_energy = 1.25
	directional_light.shadow_enabled = true
	directional_light.rotation_degrees = Vector3(-58, -34, 0)
	main.add_child(directional_light)

	var runtime_root := Node3D.new()
	runtime_root.name = "Runtime"
	main.add_child(runtime_root)
	main.runtime_root = runtime_root

	var board_root := Node3D.new()
	board_root.name = "Board"
	runtime_root.add_child(board_root)
	main.board_root = board_root

	var actor_root := Node3D.new()
	actor_root.name = "Actors"
	runtime_root.add_child(actor_root)
	main.actor_root = actor_root

	var projectile_root := Node3D.new()
	projectile_root.name = "Projectiles"
	runtime_root.add_child(projectile_root)
	main.projectile_root = projectile_root

	var pickup_root := Node3D.new()
	pickup_root.name = "Pickups"
	runtime_root.add_child(pickup_root)
	main.pickup_root = pickup_root

	var fx_root := Node3D.new()
	fx_root.name = "Fx"
	runtime_root.add_child(fx_root)
	main.fx_root = fx_root

	var audio_root := Node.new()
	audio_root.name = "Audio"
	runtime_root.add_child(audio_root)


static func can_occupy(world_position: Vector3, radius: float, arena_radius: float, obstacle_colliders: Array) -> bool:
	var half_w := arena_radius * 1.6 - 1.2
	var half_h := arena_radius - 1.2
	if absf(world_position.x) > half_w - radius or absf(world_position.z) > half_h - radius:
		return false
	var world_flat := Vector2(world_position.x, world_position.z)
	for collider in obstacle_colliders:
		if world_flat.distance_to(collider["world"]) < float(collider["radius"]) + radius:
			return false
	return true


static func move_actor(node: Node3D, direction: Vector3, speed: float, delta: float, radius: float, arena_radius: float, obstacle_colliders: Array) -> void:
	if direction.length_squared() <= 0.0001:
		return
	var next_position := node.position + direction * speed * delta
	if can_occupy(next_position, radius, arena_radius, obstacle_colliders):
		node.position = next_position
		return
	var flat_direction := Vector2(direction.x, direction.z)
	if flat_direction.length_squared() <= 0.0001:
		return
	var slide_axis := Vector2(-flat_direction.y, flat_direction.x).normalized()
	for slide in [slide_axis, -slide_axis]:
		var slide_position := node.position + Vector3(slide.x, 0.0, slide.y) * speed * delta * 0.72
		if can_occupy(slide_position, radius, arena_radius, obstacle_colliders):
			node.position = slide_position
			return


static func read_json(path: String) -> Variant:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("Failed to open %s" % path)
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed == null:
		push_error("Failed to parse %s" % path)
		return {}
	return parsed


static func update_camera(camera: Camera3D, player_node: Node3D, state: String, _config: Dictionary, delta: float, shake_magnitude: float = 0.0) -> float:
	if camera == null:
		return 0.0
	var target := Vector3.ZERO
	if player_node != null and state != "menu":
		target = player_node.position
	var target_position := Vector3(target.x, 30.0, target.z + 0.01)
	if shake_magnitude > 0.0:
		target_position.x += randf_range(-1.0, 1.0) * shake_magnitude
		target_position.z += randf_range(-1.0, 1.0) * shake_magnitude
	camera.position = camera.position.lerp(target_position, clampf(delta * 5.0, 0.0, 1.0))
	return maxf(0.0, shake_magnitude - delta * 2.2)
