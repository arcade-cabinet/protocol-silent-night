extends SceneTree

## Visual test: spawns one present character and captures a screenshot.
## Run: godot --path . -s res://test/e2e/capture_present_test.gd

var _root_3d: Node3D
var _shot_dir := "res://.artifacts/screenshots"


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(1440, 900))
	_root_3d = Node3D.new()
	root.add_child(_root_3d)
	_build_stage()
	_spawn_present()
	call_deferred("_capture")


func _build_stage() -> void:
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("0a1119")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("a5bbd2")
	environment.ambient_light_energy = 0.8
	environment.glow_enabled = true
	environment.glow_intensity = 0.5
	env.environment = environment
	_root_3d.add_child(env)

	var camera := Camera3D.new()
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = 40.0
	camera.position = Vector3(0, 18.0, 8.0)
	camera.look_at_from_position(camera.position, Vector3(0, 0.0, -5.5), Vector3.UP)
	_root_3d.add_child(camera)

	var key_light := DirectionalLight3D.new()
	key_light.light_color = Color("d6ecff")
	key_light.light_energy = 1.4
	key_light.shadow_enabled = true
	key_light.rotation_degrees = Vector3(-50, -30, 0)
	_root_3d.add_child(key_light)

	var fill := DirectionalLight3D.new()
	fill.light_color = Color("ffd4a8")
	fill.light_energy = 0.4
	fill.rotation_degrees = Vector3(-25, 140, 0)
	_root_3d.add_child(fill)

	var floor_mesh := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(8, 8)
	floor_mesh.mesh = plane
	floor_mesh.position = Vector3(0, -0.35, 0)
	var floor_mat := StandardMaterial3D.new()
	floor_mat.albedo_color = Color("1a2a3a")
	floor_mat.roughness = 0.85
	floor_mesh.material_override = floor_mat
	_root_3d.add_child(floor_mesh)


func _spawn_present() -> void:
	var factory := PresentFactory.new()
	var file := FileAccess.open("res://declarations/presents/presents.json", FileAccess.READ)
	if file != null:
		var all_defs: Dictionary = JSON.parse_string(file.get_as_text())
		if all_defs != null:
			var keys := all_defs.keys()
			for i in range(keys.size()):
				var def: Dictionary = all_defs[keys[i]]
				var present := factory.build_present(def)
				var col: int = i % 5
				var row: int = i / 5
				present.position = Vector3(
					(float(col) - 2.0) * 2.4,
					0,
					float(row) * -2.8
				)
				_root_3d.add_child(present)
			return
	var defs := [
		{
			"id": "holly_striker", "name": "Holly Striker",
			"base_color": "#cc2244", "pattern_color": "#ffd700",
			"pattern_type": 4, "pattern_scale": 3.5, "metallic": 0.2,
			"roughness": 0.5, "bow_color": "#ffd700",
			"arm_color": "#f5f0e8", "arm_length": 0.55, "arm_thickness": 0.09,
			"leg_color": "#1a1a1a", "leg_length": 0.38, "leg_thickness": 0.1,
			"box_width": 1.0, "box_height": 1.15, "box_depth": 0.85,
			"expression": "determined",
		},
		{
			"id": "frostbite", "name": "Frostbite",
			"base_color": "#1a6699", "pattern_color": "#e8f4ff",
			"pattern_type": 5, "pattern_scale": 4.0, "metallic": 0.45,
			"roughness": 0.3, "bow_color": "#55ddff",
			"arm_color": "#b8ddff", "arm_length": 0.4, "arm_thickness": 0.07,
			"leg_color": "#0d3344", "leg_length": 0.32, "leg_thickness": 0.08,
			"box_width": 0.75, "box_height": 0.85, "box_depth": 0.7,
			"expression": "stoic",
		},
		{
			"id": "jingle_tank", "name": "Jingle Tank",
			"base_color": "#2d8844", "pattern_color": "#ffdd44",
			"pattern_type": 3, "pattern_scale": 5.0, "metallic": 0.08,
			"roughness": 0.7, "bow_color": "#ff4466",
			"arm_color": "#ddd8c8", "arm_length": 0.65, "arm_thickness": 0.12,
			"leg_color": "#2a2a2a", "leg_length": 0.42, "leg_thickness": 0.14,
			"box_width": 1.3, "box_height": 1.4, "box_depth": 1.1,
			"expression": "angry",
		},
		{
			"id": "tinsel_rush", "name": "Tinsel Rush",
			"base_color": "#9922cc", "pattern_color": "#ffaadd",
			"pattern_type": 2, "pattern_scale": 6.0, "metallic": 0.6,
			"roughness": 0.2, "bow_color": "#ff88cc",
			"arm_color": "#f0e0f0", "arm_length": 0.48, "arm_thickness": 0.06,
			"leg_color": "#3a1a4a", "leg_length": 0.34, "leg_thickness": 0.07,
			"box_width": 0.7, "box_height": 0.8, "box_depth": 0.65,
			"expression": "manic",
		},
		{
			"id": "coal_breaker", "name": "Coal Breaker",
			"base_color": "#1a1a1a", "pattern_color": "#ff3344",
			"pattern_type": 1, "pattern_scale": 8.0, "metallic": 0.35,
			"roughness": 0.4, "bow_color": "#ff0044",
			"arm_color": "#888888", "arm_length": 0.58, "arm_thickness": 0.11,
			"leg_color": "#333333", "leg_length": 0.4, "leg_thickness": 0.12,
			"box_width": 1.1, "box_height": 1.25, "box_depth": 0.95,
			"expression": "cheerful",
		},
	]
	for i in range(defs.size()):
		var present := factory.build_present(defs[i])
		present.position = Vector3((float(i) - 2.0) * 2.2, 0, 0)
		_root_3d.add_child(present)


func _capture() -> void:
	await process_frame
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var image := root.get_viewport().get_texture().get_image()
	var path := ProjectSettings.globalize_path("%s/present_test.png" % _shot_dir)
	var dir_path := path.get_base_dir()
	DirAccess.make_dir_recursive_absolute(dir_path)
	image.save_png(path)
	quit(0)
