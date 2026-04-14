extends RefCounted
class_name EnemyTelegraphFx


static func spawn(root: Node3D, materials: RefCounted, enemy_type: String, pos: Vector3) -> void:
	if root == null or materials == null:
		return
	var spec := _spec(enemy_type)
	var fx := Node3D.new()
	fx.name = "EnemyTelegraph_%s" % enemy_type
	fx.position = Vector3(pos.x, 0.08, pos.z)
	fx.scale = Vector3.ONE * 0.72
	fx.add_child(_disc(spec))
	fx.add_child(_hazard_band(spec.color, spec.radius * 1.8, 45.0))
	fx.add_child(_hazard_band(spec.accent, spec.radius * 1.3, -45.0))
	fx.add_child(_ring(spec.color, spec.radius, 0.12, 0.22, spec.energy))
	fx.add_child(_ring(spec.accent, spec.radius * 0.72, 0.09, 0.26, spec.energy * 0.82))
	for spoke in range(4):
		fx.add_child(_spoke(spec.accent, spec.radius * 0.95, float(spoke) * PI * 0.5))
		fx.add_child(_chevron(spec.color, spec.radius * 0.58, float(spoke) * PI * 0.5 + PI * 0.25))
	fx.add_child(_core(spec))
	root.add_child(fx)
	var pulse := fx.create_tween()
	pulse.set_parallel(true)
	pulse.tween_property(fx, "scale", Vector3.ONE * 1.28, spec.life).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	pulse.tween_property(fx, "rotation:y", PI * 0.32, spec.life)
	var cleanup := fx.create_tween()
	cleanup.tween_interval(spec.life)
	cleanup.tween_callback(fx.queue_free)


static func _disc(spec: Dictionary) -> MeshInstance3D:
	var disc := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2.ONE * spec.radius * 3.2
	disc.mesh = mesh
	disc.rotation_degrees.x = -90.0
	disc.material_override = _fx_material(spec.color, 0.36, 1.9)
	return disc


static func _ring(color: Color, radius: float, width: float, alpha: float, energy: float) -> MeshInstance3D:
	var ring := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = radius
	torus.inner_radius = maxf(radius - width, 0.05)
	ring.mesh = torus
	ring.rotation_degrees.x = 90.0
	ring.material_override = _fx_material(color, alpha, energy)
	return ring


static func _hazard_band(color: Color, length: float, angle_deg: float) -> MeshInstance3D:
	var band := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.26, 0.03, length)
	band.mesh = box
	band.position.y = 0.01
	band.rotation_degrees = Vector3(0.0, angle_deg, 0.0)
	band.material_override = _fx_material(color, 0.42, 2.35)
	return band


static func _spoke(color: Color, radius: float, angle: float) -> MeshInstance3D:
	var spoke := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.28, 0.04, 1.44)
	spoke.mesh = box
	spoke.position = Vector3(cos(angle) * radius, 0.02, sin(angle) * radius)
	spoke.rotation_degrees = Vector3(0.0, rad_to_deg(angle), 0.0)
	spoke.material_override = _fx_material(color, 0.46, 2.15)
	return spoke


static func _chevron(color: Color, radius: float, angle: float) -> MeshInstance3D:
	var chevron := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.44, 0.04, 0.82)
	chevron.mesh = box
	chevron.position = Vector3(cos(angle) * radius, 0.03, sin(angle) * radius)
	chevron.rotation_degrees = Vector3(0.0, rad_to_deg(angle), 26.0)
	chevron.material_override = _fx_material(color, 0.48, 2.35)
	return chevron


static func _core(spec: Dictionary) -> MeshInstance3D:
	var core := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(0.92, 0.06, 0.92)
	core.mesh = box
	core.position.y = 0.05
	core.rotation_degrees = Vector3(0.0, 45.0, 0.0)
	core.material_override = _fx_material(spec.accent, 0.62, spec.energy * 1.05)
	return core


static func _fx_material(color: Color, alpha: float, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.no_depth_test = true
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	return mat


static func _spec(enemy_type: String) -> Dictionary:
	var base := {"color": Color("ff4c67"), "accent": Color("ffd86e"), "radius": 1.8, "energy": 2.45, "life": 0.52}
	match enemy_type:
		"rusher":
			base = {"color": Color("ff7a2d"), "accent": Color("ffd86e"), "radius": 1.55, "energy": 2.6, "life": 0.42}
		"tank":
			base = {"color": Color("ff9f38"), "accent": Color("fff1b3"), "radius": 2.1, "energy": 2.3, "life": 0.56}
		"elf":
			base = {"color": Color("70ff5d"), "accent": Color("00ffcc"), "radius": 1.72, "energy": 2.45, "life": 0.5}
		"santa":
			base = {"color": Color("ff4669"), "accent": Color("ffd86e"), "radius": 2.0, "energy": 2.7, "life": 0.54}
		"bumble":
			base = {"color": Color("69d6ff"), "accent": Color("e8f8ff"), "radius": 1.98, "energy": 2.5, "life": 0.54}
		"boss":
			base = {"color": Color("ff2244"), "accent": Color("ffd86e"), "radius": 2.5, "energy": 3.2, "life": 0.62}
	return base
