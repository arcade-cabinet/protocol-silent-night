extends SceneTree

const PRESENT_FACTORY := preload("res://scripts/present_factory.gd")
const SILHOUETTES := preload("res://scripts/enemy_silhouette_kit.gd")
const ENEMY_DEFS_PATH := "res://declarations/enemies/enemies.json"

var _factory := PRESENT_FACTORY.new()
var _defs: Dictionary = {}
var _shot_dir := "res://.artifacts/screenshots"
var _scene_root: Node3D


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(844, 390))
	_defs = JSON.parse_string(FileAccess.get_file_as_string(ENEMY_DEFS_PATH))
	_scene_root = Node3D.new()
	_scene_root.name = "EnemySilhouetteShowcase"
	root.add_child(_scene_root)
	_build_environment()
	_build_stage()
	_spawn_enemy("elf", Vector3(-2.5, 0.58, -0.15))
	_spawn_enemy("santa", Vector3(0.0, 0.58, 0.0))
	_spawn_enemy("bumble", Vector3(2.7, 0.58, 0.15))
	call_deferred("_capture")


func _capture() -> void:
	await _wait_frames(4)
	var image := root.get_viewport().get_texture().get_image()
	image.save_png("%s/enemy_silhouettes_mobile.png" % _shot_dir)
	quit(0)


func _build_environment() -> void:
	var camera := Camera3D.new()
	camera.projection = Camera3D.PROJECTION_ORTHOGONAL
	camera.size = 5.0
	_scene_root.add_child(camera)
	camera.look_at_from_position(Vector3(0, 8.0, 11.0), Vector3(0, 0.8, 0), Vector3.UP)
	var env := WorldEnvironment.new()
	env.environment = Environment.new()
	env.environment.background_mode = Environment.BG_COLOR
	env.environment.background_color = Color("090d13")
	_scene_root.add_child(env)
	var light := DirectionalLight3D.new()
	light.position = Vector3(0, 6, 4)
	light.rotation_degrees = Vector3(-48, -18, 0)
	light.light_color = Color("e7f1ff")
	light.light_energy = 1.35
	light.shadow_enabled = false
	_scene_root.add_child(light)


func _build_stage() -> void:
	var floor := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(8.8, 4.8)
	floor.mesh = plane
	floor.position = Vector3(0, 0.02, 0)
	floor.material_override = _stage_material(Color("233248"), 0.0)
	_scene_root.add_child(floor)
	for lane in [-2.6, 0.0, 2.6]:
		var stripe := MeshInstance3D.new()
		var stripe_mesh := PlaneMesh.new()
		stripe_mesh.size = Vector2(1.1, 0.18)
		stripe.mesh = stripe_mesh
		stripe.position = Vector3(lane, 0.03, 1.08)
		stripe.material_override = _stage_material(Color("ffe164"), 1.4)
		_scene_root.add_child(stripe)
		var glow := MeshInstance3D.new()
		var glow_mesh := PlaneMesh.new()
		glow_mesh.size = Vector2(1.55, 1.55)
		glow.mesh = glow_mesh
		glow.position = Vector3(lane, 0.025, 0.0)
		glow.material_override = _glow_material(Color("314863"), 0.22)
		_scene_root.add_child(glow)


func _spawn_enemy(enemy_type: String, pos: Vector3) -> void:
	var def: Dictionary = _defs[enemy_type]
	var enemy_root := Node3D.new()
	enemy_root.name = "Showcase_%s" % enemy_type
	var visual: Node3D = _factory.build_present(def)
	SILHOUETTES.decorate_enemy(visual, enemy_type, def)
	enemy_root.add_child(visual)
	enemy_root.position = pos
	_scene_root.add_child(enemy_root)


func _wait_frames(count: int) -> void:
	for _i in range(count):
		await process_frame


func _stage_material(color: Color, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.78
	mat.metallic = 0.08
	if energy > 0.0:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = energy
	return mat


func _glow_material(color: Color, alpha: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	return mat
