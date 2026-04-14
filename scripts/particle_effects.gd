extends RefCounted

const COAL_HELPERS := preload("res://scripts/particle_coal_helpers.gd")

# Procedural mesh-based particle system. Safe in headless mode.
# Each entry: { node, velocity, life, max_life, start_scale, gravity, rise }

const MUZZLE_LIFE := 0.15
const BURST_LIFE := 0.55
const SPARKLE_LIFE := 0.70

var _entries: Array = []
var _sphere_cache: SphereMesh = null
var _mat_cache: Dictionary = {}
var _rng: RandomNumberGenerator = RandomNumberGenerator.new()
var reduced_motion: bool = false
var _particle_entry_cap: int = 180
var _muzzle_flash_sparks: int = 4
var _death_burst_particles: int = 12
var _pickup_sparkles: int = 5
var _level_up_particles: int = 25


func configure(reduced: bool) -> void:
	reduced_motion = reduced


func configure_quality(profile: Dictionary) -> void:
	_particle_entry_cap = int(profile.get("particle_entry_cap", 180))
	_muzzle_flash_sparks = int(profile.get("muzzle_flash_sparks", 4))
	_death_burst_particles = int(profile.get("death_burst_particles", 12))
	_pickup_sparkles = int(profile.get("pickup_sparkles", 5))
	_level_up_particles = int(profile.get("level_up_particles", 25))


func _init() -> void:
	_rng.seed = 0xFACE12


func _sphere() -> SphereMesh:
	if _sphere_cache == null:
		_sphere_cache = SphereMesh.new()
		_sphere_cache.radius = 0.12
		_sphere_cache.height = 0.24
		_sphere_cache.radial_segments = 6
		_sphere_cache.rings = 4
	return _sphere_cache


func _make_particle_material(color: Color, energy: float = 2.0) -> StandardMaterial3D:
	var key: String = "%s_%.1f" % [color.to_html(false), energy]
	if _mat_cache.has(key):
		return _mat_cache[key]
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	mat.no_depth_test = false
	_mat_cache[key] = mat
	return mat


func _spawn_node(root: Node3D, position: Vector3, color: Color, scale_value: float, energy: float = 2.0) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.mesh = _sphere()
	node.material_override = _make_particle_material(color, energy)
	node.scale = Vector3.ONE * scale_value
	node.position = position
	root.add_child(node)
	return node


func _track(node: MeshInstance3D, velocity: Vector3, life: float, start_scale: float, gravity: float = 0.0) -> void:
	if _entries.size() >= _particle_entry_cap:
		if node != null and is_instance_valid(node):
			node.queue_free()
		return
	_entries.append({
		"node": node,
		"velocity": velocity,
		"life": life,
		"max_life": life,
		"start_scale": start_scale,
		"gravity": gravity,
	})


func spawn_muzzle_flash(root: Node3D, position: Vector3, direction: Vector3, color: Color) -> void:
	if root == null:
		return
	var forward := direction
	if forward.length_squared() < 0.0001:
		forward = Vector3(0, 0, 1)
	forward = forward.normalized()
	var flash := _spawn_node(root, position + forward * 0.3, color, 0.85, 3.2)
	_track(flash, forward * 1.2, MUZZLE_LIFE, 0.85, 0.0)
	for spark_index in range(_muzzle_flash_sparks):
		var jitter := Vector3(_rng.randf_range(-0.4, 0.4), _rng.randf_range(-0.2, 0.3), _rng.randf_range(-0.4, 0.4))
		var spark_dir := (forward * 2.8 + jitter).normalized()
		var spark := _spawn_node(root, position + forward * 0.2, color.lightened(0.25), 0.35, 2.6)
		_track(spark, spark_dir * 5.5, MUZZLE_LIFE + 0.05, 0.35, 0.0)


func spawn_death_burst(root: Node3D, position: Vector3, color: Color, size: float = 1.0) -> void:
	if root == null or reduced_motion:
		return
	var count := _death_burst_particles
	for index in range(count):
		var angle := float(index) / float(count) * TAU
		var horiz := Vector3(cos(angle), 0.0, sin(angle))
		var up := _rng.randf_range(0.3, 1.1)
		var speed := _rng.randf_range(3.2, 6.0) * size
		var velocity := (horiz * speed + Vector3(0, up * 3.0, 0))
		var particle_scale := _rng.randf_range(0.45, 0.75) * size
		var node := _spawn_node(root, position + Vector3(0, 0.6, 0), color, particle_scale, 2.4)
		_track(node, velocity, BURST_LIFE + _rng.randf_range(-0.1, 0.1), particle_scale, 8.0)
	var core := _spawn_node(root, position + Vector3(0, 0.6, 0), color.lightened(0.3), 1.2 * size, 3.0)
	_track(core, Vector3.ZERO, 0.2, 1.2 * size, 0.0)


func spawn_pickup_sparkle(root: Node3D, position: Vector3) -> void:
	if root == null:
		return
	for index in range(_pickup_sparkles):
		var offset := Vector3(_rng.randf_range(-0.3, 0.3), _rng.randf_range(0.0, 0.3), _rng.randf_range(-0.3, 0.3))
		var rise := Vector3(_rng.randf_range(-0.4, 0.4), _rng.randf_range(1.8, 3.0), _rng.randf_range(-0.4, 0.4))
		var particle_scale := _rng.randf_range(0.18, 0.32)
		var node := _spawn_node(root, position + offset + Vector3(0, 0.4, 0), Color("fff6c2"), particle_scale, 3.0)
		_track(node, rise, SPARKLE_LIFE, particle_scale, -2.2)


func spawn_coal_effect(root: Node3D, pos: Vector3, kind: String, color_override: Color = Color(0, 0, 0, 0)) -> void:
	COAL_HELPERS.spawn_for_kind(self, root, pos, kind, color_override)


func update(delta: float) -> void:
	for index in range(_entries.size() - 1, -1, -1):
		var entry: Dictionary = _entries[index]
		var node: MeshInstance3D = entry["node"]
		if node == null or not is_instance_valid(node):
			_entries.remove_at(index)
			continue
		entry["life"] = float(entry["life"]) - delta
		var life: float = entry["life"]
		if life <= 0.0:
			node.queue_free()
			_entries.remove_at(index)
			continue
		var velocity: Vector3 = entry["velocity"]
		velocity.y -= float(entry["gravity"]) * delta
		entry["velocity"] = velocity
		node.position += velocity * delta
		var t := clampf(life / float(entry["max_life"]), 0.0, 1.0)
		var start_scale: float = float(entry["start_scale"])
		node.scale = Vector3.ONE * lerpf(0.0, start_scale, t)
		var mat: StandardMaterial3D = node.material_override as StandardMaterial3D
		if mat != null:
			var color := mat.albedo_color
			color.a = t
			mat.albedo_color = color
		_entries[index] = entry


func clear() -> void:
	for entry in _entries:
		var node: MeshInstance3D = entry["node"]
		if node != null and is_instance_valid(node):
			node.queue_free()
	_entries.clear()


func active_count() -> int:
	return _entries.size()

func spawn_level_up_burst(root: Node3D, pos: Vector3) -> void:
	for i in range(_level_up_particles):
		var angle := _rng.randf() * TAU
		var radius := _rng.randf_range(1.5, 3.5)
		var h := _rng.randf_range(0.0, 4.0)
		var offset := Vector3(cos(angle) * radius, h, sin(angle) * radius)
		
		var speed := _rng.randf_range(4.0, 8.0)
		var v := Vector3(0, speed, 0) + offset.normalized() * speed * 0.2
		
		var p := _spawn_node(root, pos + offset * 0.2, Color("#ffd700"), _rng.randf_range(0.8, 1.6), 3.0)
		_track(p, v, _rng.randf_range(1.0, 2.5), p.scale.x, -5.0)
