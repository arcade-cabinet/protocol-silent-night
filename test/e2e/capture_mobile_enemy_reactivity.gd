extends SceneTree

const PRESENT_FACTORY := preload("res://scripts/present_factory.gd")
const SILHOUETTES := preload("res://scripts/enemy_silhouette_kit.gd")
const REACT := preload("res://scripts/enemy_reactivity.gd")
const ENEMY_DEFS_PATH := "res://declarations/enemies/enemies.json"

var _factory := PRESENT_FACTORY.new()
var _defs: Dictionary = {}
var _shot_dir := "res://.artifacts/screenshots"
var _scene_root: Node3D
var _vfx: Array = []


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_defs = JSON.parse_string(FileAccess.get_file_as_string(ENEMY_DEFS_PATH))
	_scene_root = Node3D.new()
	root.add_child(_scene_root)
	_build_environment()
	_build_stage()
	call_deferred("_build_showcase")


func _build_showcase() -> void:
	_spawn_hit_react("elf", Vector3(-3.6, 0.58, 0.0), Vector3(1, 0, 0))
	_spawn_death_echo("santa", Vector3(0.0, 0.58, 0.0))
	_spawn_hit_react("boss", Vector3(3.6, 0.18, 0.0), Vector3(-1, 0, 0))
	call_deferred("_capture")


func _capture() -> void:
	await _wait_frames(4)
	var image := root.get_viewport().get_texture().get_image()
	image.save_png("%s/enemy_reactivity_mobile.png" % _shot_dir)
	quit(0)


func _build_environment() -> void:
	var camera := Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 5.8
	_scene_root.add_child(camera)
	camera.look_at_from_position(Vector3(0, 8.4, 11.8), Vector3(0, 0.8, 0), Vector3.UP)
	var env := WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color("090d13")
	_scene_root.add_child(env)
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-48, -18, 0)
	light.light_color = Color("e7f1ff")
	light.light_energy = 1.35
	light.shadow_enabled = false
	_scene_root.add_child(light)


func _build_stage() -> void:
	var floor := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(10.8, 4.6)
	floor.mesh = plane
	floor.position = Vector3(0, 0.02, 0)
	floor.material_override = _mat(Color("233248"), 0.0)
	_scene_root.add_child(floor)
	for lane in [-3.6, 0.0, 3.6]:
		var stripe := MeshInstance3D.new()
		var stripe_mesh := PlaneMesh.new()
		stripe_mesh.size = Vector2(1.05, 0.18)
		stripe.mesh = stripe_mesh
		stripe.position = Vector3(lane, 0.03, 1.12)
		stripe.material_override = _mat(Color("ffe164"), 1.4)
		_scene_root.add_child(stripe)


func _spawn_hit_react(enemy_type: String, pos: Vector3, direction: Vector3) -> void:
	var enemy_root := Node3D.new()
	var target := {"node": enemy_root}
	if enemy_type == "boss":
		enemy_root.add_child(SILHOUETTES.build_boss_fallback(Color("ff3a61")))
	else:
		var def: Dictionary = _defs[enemy_type]
		var visual: Node3D = _factory.build_present(def)
		SILHOUETTES.decorate_enemy(visual, enemy_type, def)
		enemy_root.add_child(visual)
	_scene_root.add_child(enemy_root)
	enemy_root.position = pos
	REACT.register_hit(target, direction, 0.9)
	if enemy_type == "boss":
		REACT.update_boss(target, 0.05)
	else:
		REACT.update_enemy(target, 0.05)


func _spawn_death_echo(enemy_type: String, pos: Vector3) -> void:
	var source := Node3D.new()
	var def: Dictionary = _defs[enemy_type]
	var visual: Node3D = _factory.build_present(def)
	SILHOUETTES.decorate_enemy(visual, enemy_type, def)
	source.add_child(visual)
	_scene_root.add_child(source)
	source.position = pos
	REACT.spawn_death_echo(_scene_root, _vfx, {"node": source, "hit_sign": -1.0})
	source.visible = false
	for fx in _vfx:
		fx["life"] = 0.18
		var node := fx["node"] as Node3D
		node.position += Vector3(0, -0.1, 0)
		node.rotation_degrees.z = -22.0
		node.scale = Vector3(0.95, 0.42, 0.95)


func _wait_frames(count: int) -> void:
	for _i in range(count):
		await process_frame


func _mat(color: Color, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.78
	if energy > 0.0:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = energy
	return mat
