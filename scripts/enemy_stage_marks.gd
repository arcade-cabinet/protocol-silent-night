extends RefCounted
class_name EnemyStageMarks


static func attach_enemy_markers(root: Node3D, materials: RefCounted, color: Color, scale_value: float, enemy_type: String) -> void:
	var marks := Node3D.new()
	marks.name = "ThreatMarks"
	marks.add_child(_glow_disc(color, scale_value * 1.9, 0.16))
	marks.add_child(_ring(materials, color, scale_value * 0.55, 0.06, 2.0))
	if enemy_type in ["tank", "elf", "santa", "bumble"]:
		marks.add_child(_ring(materials, _accent_for(enemy_type), scale_value * 0.82, 0.045, 1.5))
	root.add_child(marks)


static func attach_boss_markers(root: Node3D, materials: RefCounted, color: Color) -> void:
	var marks := Node3D.new()
	marks.name = "ThreatMarks"
	marks.add_child(_glow_disc(Color("3a0812"), 5.8, 0.22))
	marks.add_child(_ring(materials, color, 1.95, 0.12, 2.7))
	marks.add_child(_ring(materials, Color("ffd86e"), 2.45, 0.08, 1.9))
	for idx in range(4):
		var angle := float(idx) * PI * 0.5
		var flare := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = 0.12
		sphere.height = 0.24
		flare.mesh = sphere
		flare.position = Vector3(cos(angle) * 2.45, 0.08, sin(angle) * 2.45)
		flare.material_override = materials.emissive_material(Color("ffd86e"), 2.4, 0.18)
		marks.add_child(flare)
	root.add_child(marks)


static func _glow_disc(color: Color, radius: float, alpha: float) -> MeshInstance3D:
	var disc := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2.ONE * radius * 2.0
	disc.mesh = mesh
	disc.rotation_degrees.x = -90.0
	disc.position.y = 0.04
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = 0.8
	disc.material_override = mat
	return disc


static func _ring(materials: RefCounted, color: Color, outer_radius: float, inner_radius: float, energy: float) -> MeshInstance3D:
	var ring := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = outer_radius
	torus.inner_radius = inner_radius
	ring.mesh = torus
	ring.rotation_degrees.x = 90.0
	ring.position.y = 0.06
	ring.material_override = materials.emissive_material(color, energy, 0.16)
	return ring


static func _accent_for(enemy_type: String) -> Color:
	match enemy_type:
		"tank":
			return Color("ffb14d")
		"elf":
			return Color("88ff22")
		"santa":
			return Color("ffd86e")
		"bumble":
			return Color("69d6ff")
		_:
			return Color("ffffff")
