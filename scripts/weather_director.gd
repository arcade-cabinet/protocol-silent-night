extends RefCounted
class_name WeatherDirector

var _env: Environment
var _dir_light: DirectionalLight3D
var _snow: GPUParticles3D

var _target_fog_color: Color
var _target_fog_density: float
var _target_light_color: Color
var _target_light_energy: float
var _target_ambient_color: Color

var _base_fog_color := Color("2d4762")
var _base_fog_density := 0.0022
var _base_light_color := Color("d6ecff")
var _base_light_energy := 1.25
var _base_ambient_color := Color("a5bbd2")

var _intensity := 0.0

func _init(main: Node3D) -> void:
	var we: WorldEnvironment = main.get_node("WorldEnvironment")
	_env = we.environment
	_dir_light = main.get_node("DirLight")
	
	_target_fog_color = _base_fog_color
	_target_fog_density = _base_fog_density
	_target_light_color = _base_light_color
	_target_light_energy = _base_light_energy
	_target_ambient_color = _base_ambient_color
	
	_snow = GPUParticles3D.new()
	_snow.name = "WeatherSnow"
	_snow.amount = 400
	_snow.lifetime = 2.8
	_snow.visibility_aabb = AABB(Vector3(-45, -30, -45), Vector3(90, 60, 90))
	_snow.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	_snow.position = Vector3(0, 20.0, 0)
	
	var mat := ParticleProcessMaterial.new()
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_BOX
	mat.emission_box_extents = Vector3(45.0, 0.0, 45.0)
	mat.direction = Vector3(0.4, -1.0, 0.2).normalized()
	mat.spread = 15.0
	mat.initial_velocity_min = 6.0
	mat.initial_velocity_max = 12.0
	mat.gravity = Vector3(0, -9.8, 0)
	mat.color = Color("cde2f0")
	mat.scale_min = 0.6
	mat.scale_max = 1.4
	
	_snow.process_material = mat
	
	var quad := QuadMesh.new()
	quad.size = Vector2(0.2, 0.2)
	var sm := StandardMaterial3D.new()
	sm.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	sm.albedo_color = Color.WHITE
	sm.billboard_mode = StandardMaterial3D.BILLBOARD_ENABLED
	sm.billboard_keep_scale = true
	quad.material = sm
	
	_snow.draw_pass_1 = quad
	main.add_child(_snow)


func set_intensity(wave: int, max_waves: int, difficulty: int) -> void:
	# Modulo 10 for endless cycles, scaling up each loop
	var cycle: int = wave / 10
	var local_wave: int = wave % 10 if wave % 10 != 0 else 10
	if wave == 0: local_wave = 0; cycle = 0
	_intensity = clampf(float(local_wave) / float(maxi(max_waves, 1)), 0.0, 1.0)
	var diff_mult := 1.0 + float(difficulty - 1) * 0.1 + float(cycle) * 0.25 # Endless cycles increase intensity exponentially
	
	var boss_color := Color("4a1219")
	var boss_ambient := Color("85363e")
	var boss_light := Color("ffccd2")
	
	_target_fog_color = _base_fog_color.lerp(boss_color, _intensity)
	_target_ambient_color = _base_ambient_color.lerp(boss_ambient, _intensity)
	_target_light_color = _base_light_color.lerp(boss_light, _intensity)
	
	_target_fog_density = _base_fog_density + _intensity * 0.006 * diff_mult
	_target_light_energy = _base_light_energy * (1.0 - _intensity * 0.3)
	
	# Scale snow amount dynamically (0..1 -> 400..2500)
	var target_amount := int(400 + _intensity * 2100 * diff_mult)
	if _snow.amount != target_amount:
		_snow.amount = target_amount
		
	# Increase wind speed with intensity
	var mat: ParticleProcessMaterial = _snow.process_material
	var wind_dir := Vector3(0.4 + _intensity * 1.5, -1.0, 0.2 + _intensity * 0.8).normalized()
	mat.direction = wind_dir
	mat.initial_velocity_min = 6.0 + _intensity * 6.0
	mat.initial_velocity_max = 12.0 + _intensity * 12.0
	mat.color = Color("cde2f0").lerp(Color("ffcccc"), _intensity * 0.6)

func tick(delta: float) -> void:
	if _env.fog_density != _target_fog_density:
		_env.fog_density = lerpf(_env.fog_density, _target_fog_density, delta * 0.5)
	if _env.fog_light_color != _target_fog_color:
		_env.fog_light_color = _env.fog_light_color.lerp(_target_fog_color, delta * 0.5)
	if _env.ambient_light_color != _target_ambient_color:
		_env.ambient_light_color = _env.ambient_light_color.lerp(_target_ambient_color, delta * 0.5)
	if _dir_light.light_color != _target_light_color:
		_dir_light.light_color = _dir_light.light_color.lerp(_target_light_color, delta * 0.5)
	if _dir_light.light_energy != _target_light_energy:
		_dir_light.light_energy = lerpf(_dir_light.light_energy, _target_light_energy, delta * 0.5)

