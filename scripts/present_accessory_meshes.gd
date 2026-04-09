extends RefCounted

## Optional procedural accessories for present characters.
## Kinds: none / scarf / tag / ribbon_tail / glow_aura.
## Roughly 50-70% of presents have one per tasteful distribution.


static func build(kind: String, def: Dictionary, w: float, h: float, d: float) -> Node3D:
	var root := Node3D.new()
	root.name = "Accessory_%s" % kind
	match kind:
		"none": pass
		"scarf": _scarf(root, def, w, h, d)
		"tag": _tag(root, def, w, h, d)
		"ribbon_tail": _ribbon_tail(root, def, w, h, d)
		"glow_aura": _glow_aura(root, def, w, h, d)
	return root


static func _scarf(root: Node3D, def: Dictionary, w: float, h: float, d: float) -> void:
	var scarf_color := Color(String(def.get("arm_color", "#aa3344")))
	var band := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(w * 1.15, 0.14, d * 1.15)
	band.mesh = mesh
	band.position = Vector3(0, h * 0.88, 0)
	band.material_override = _flat(scarf_color)
	root.add_child(band)
	var tail := MeshInstance3D.new()
	var tail_mesh := BoxMesh.new()
	tail_mesh.size = Vector3(0.22, 0.45, 0.08)
	tail.mesh = tail_mesh
	tail.position = Vector3(w * 0.35, h * 0.65, d * 0.45)
	tail.rotation_degrees = Vector3(0, 0, -12)
	tail.material_override = _flat(scarf_color)
	root.add_child(tail)


static func _tag(root: Node3D, def: Dictionary, w: float, h: float, d: float) -> void:
	var tag_color := Color(String(def.get("pattern_color", "#ffffaa")))
	var quad_inst := MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(0.32, 0.2)
	quad_inst.mesh = quad
	quad_inst.position = Vector3(w * 0.55, h * 0.7, 0.0)
	quad_inst.rotation_degrees = Vector3(0, 0, -15)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#f5f0dd")
	mat.emission_enabled = true
	mat.emission = tag_color
	mat.emission_energy_multiplier = 0.5
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	quad_inst.material_override = mat
	root.add_child(quad_inst)
	var string := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.012
	cyl.bottom_radius = 0.012
	cyl.height = 0.3
	string.mesh = cyl
	string.position = Vector3(w * 0.5, h * 0.85, 0.0)
	string.rotation_degrees = Vector3(0, 0, -20)
	string.material_override = _flat(Color("#aaaaaa"))
	root.add_child(string)


static func _ribbon_tail(root: Node3D, def: Dictionary, w: float, h: float, d: float) -> void:
	var ribbon_color := Color(String(def.get("bow_color", "#ffd700")))
	for side in [-1.0, 1.0]:
		for i in range(3):
			var seg := MeshInstance3D.new()
			var mesh := BoxMesh.new()
			mesh.size = Vector3(0.12, 0.2, 0.04)
			seg.mesh = mesh
			seg.position = Vector3(side * (w * 0.22 + i * 0.05), h + 0.1 + i * 0.22, 0.0)
			seg.rotation_degrees = Vector3(0, 0, side * (12 + i * 8))
			seg.material_override = _emissive(ribbon_color, 1.3)
			root.add_child(seg)


static func _glow_aura(root: Node3D, def: Dictionary, w: float, h: float, d: float) -> void:
	var glow_color := Color(String(def.get("pattern_color", "#ffffff")))
	var shell := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = maxf(w, d) * 0.85
	mesh.height = mesh.radius * 2.0
	shell.mesh = mesh
	shell.position = Vector3(0, h * 0.5, 0)
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(glow_color.r, glow_color.g, glow_color.b, 0.18)
	mat.emission_enabled = true
	mat.emission = glow_color
	mat.emission_energy_multiplier = 0.8
	shell.material_override = mat
	root.add_child(shell)


static func _flat(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.5
	return mat


static func _emissive(color: Color, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	return mat
