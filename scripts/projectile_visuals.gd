extends RefCounted
class_name ProjectileVisuals

static var _cache: Dictionary = {}


static func build(node: Node3D, materials: RefCounted, color: Color, hostile: bool, scale_value: float) -> void:
	var accent := Color("ffd86e") if hostile else color.lightened(0.28)
	node.add_child(_head(materials, color, scale_value, hostile))
	node.add_child(_beam(color, scale_value, 9.6, 1.12, 0.46, 2.8))
	node.add_child(_beam(accent, scale_value, 6.8, 0.54, 0.72, 3.2))
	node.add_child(_ribbon(accent, scale_value, 7.2, 38.0))
	node.add_child(_ribbon(color, scale_value, 5.4, -38.0))
	node.add_child(_tip(accent, scale_value, hostile))


static func _head(materials: RefCounted, color: Color, scale_value: float, hostile: bool) -> MeshInstance3D:
	var head := MeshInstance3D.new()
	head.name = "ProjectileHead"
	var sphere := SphereMesh.new()
	sphere.radius = scale_value * (1.12 if hostile else 1.0)
	sphere.height = scale_value * 2.3
	head.mesh = sphere
	head.material_override = materials.emissive_material(color, 3.2 if hostile else 3.0, 0.04)
	return head


static func _beam(color: Color, scale_value: float, length_scale: float, width_scale: float, alpha: float, energy: float) -> MeshInstance3D:
	var beam := MeshInstance3D.new()
	beam.name = "ProjectileBeam"
	var box := BoxMesh.new()
	box.size = Vector3(scale_value * width_scale, scale_value * 0.72, scale_value * length_scale)
	beam.mesh = box
	beam.position = Vector3(0, 0, scale_value * (length_scale * 0.42))
	beam.material_override = _mat(color, alpha, energy)
	return beam


static func _ribbon(color: Color, scale_value: float, length_scale: float, tilt: float) -> MeshInstance3D:
	var ribbon := MeshInstance3D.new()
	ribbon.name = "ProjectileRibbon"
	var box := BoxMesh.new()
	box.size = Vector3(scale_value * 0.32, scale_value * 0.32, scale_value * length_scale)
	ribbon.mesh = box
	ribbon.position = Vector3(0, 0, scale_value * (length_scale * 0.36))
	ribbon.rotation_degrees = Vector3(0.0, 0.0, tilt)
	ribbon.material_override = _mat(color, 0.72, 3.3)
	return ribbon


static func _tip(color: Color, scale_value: float, hostile: bool) -> MeshInstance3D:
	var tip := MeshInstance3D.new()
	tip.name = "ProjectileTip"
	if not hostile:
		var ring: TorusMesh = TorusMesh.new()
		ring.outer_radius = scale_value * 1.7
		ring.inner_radius = scale_value * 1.18
		tip.mesh = ring
		tip.rotation_degrees.x = 90.0
	else:
		var barb: CylinderMesh = CylinderMesh.new()
		barb.top_radius = 0.0
		barb.bottom_radius = scale_value * 0.68
		barb.height = scale_value * 1.6
		tip.mesh = barb
		tip.position = Vector3(0, 0, -scale_value * 0.34)
		tip.rotation_degrees.x = 90.0
	tip.material_override = _mat(color, 0.76, 3.4)
	return tip


static func _mat(color: Color, alpha: float, energy: float) -> StandardMaterial3D:
	var key := "%s:%.2f:%.2f" % [color.to_html(false), alpha, energy]
	if _cache.has(key):
		return _cache[key]
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.no_depth_test = true
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	_cache[key] = mat
	return mat
