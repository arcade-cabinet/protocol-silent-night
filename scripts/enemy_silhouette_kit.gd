extends RefCounted
class_name EnemySilhouetteKit


static func decorate_enemy(root: Node3D, enemy_type: String, def: Dictionary) -> void:
	if root.get_node_or_null("EnemySilhouette") != null:
		return
	var rig := Node3D.new()
	rig.name = "EnemySilhouette"
	match enemy_type:
		"grunt":
			_grunt(rig, Color("ff4c67"))
		"rusher":
			_rusher(rig, Color("ff7a2d"))
		"tank":
			_tank(rig, Color("ffb14d"))
		"elf":
			_elf(rig, Color(def.get("bow_color", "#00ffcc")), Color(def.get("arm_color", "#f0ffe8")))
		"santa":
			_santa(rig, Color(def.get("bow_color", "#ffd700")), Color(def.get("base_color", "#cc2244")))
		"bumble":
			_bumble(rig, Color(def.get("bow_color", "#69d6ff")), Color(def.get("base_color", "#ffffff")))
	root.add_child(rig)


static func build_boss_fallback(color: Color) -> Node3D:
	var root := Node3D.new()
	root.name = "BossFallback"
	var shell := _box("Chest", Vector3(2.4, 2.1, 1.8), Vector3(0, 0.55, 0), color.darkened(0.45), 0.0)
	root.add_child(shell)
	var muzzle := _box("JawRam", Vector3(1.55, 0.7, 1.4), Vector3(0, 0.1, 0.95), Color("26060b"), 0.0)
	root.add_child(muzzle)
	var glow := _ring("CrownHalo", 1.2, 0.12, Vector3(0, 1.82, 0), Color("ffd86e"), 2.0)
	glow.rotation_degrees = Vector3(90, 0, 0)
	root.add_child(glow)
	for side in [-1.0, 1.0]:
		root.add_child(_horn("Horn%d" % int(side), side, color))
		root.add_child(_stack("Stack%d" % int(side), Vector3(side * 1.0, 1.0, -0.35), Color("ffd86e")))
	return root


static func _grunt(root: Node3D, accent: Color) -> void:
	root.add_child(_box("TagBlade", Vector3(0.2, 0.95, 0.12), Vector3(0.44, 0.52, 0), accent, 0.9, Vector3(0, 0, 28)))
	root.add_child(_ring("AntennaLoop", 0.22, 0.03, Vector3(-0.18, 1.05, 0), accent, 1.1))


static func _rusher(root: Node3D, accent: Color) -> void:
	for side in [-1.0, 1.0]:
		root.add_child(_box("Horn%d" % int(side), Vector3(0.14, 0.62, 0.16), Vector3(side * 0.28, 0.96, 0.08), accent, 1.2, Vector3(0, 0, side * 38)))
	root.add_child(_box("TailFin", Vector3(0.18, 0.7, 0.12), Vector3(0, 0.42, -0.42), accent.darkened(0.15), 0.8, Vector3(28, 0, 0)))


static func _tank(root: Node3D, accent: Color) -> void:
	root.add_child(_box("RamPlow", Vector3(1.05, 0.34, 0.42), Vector3(0, 0.06, 0.48), accent.darkened(0.25), 0.0, Vector3(-18, 0, 0)))
	for side in [-1.0, 1.0]:
		root.add_child(_box("Shoulder%d" % int(side), Vector3(0.24, 0.3, 0.82), Vector3(side * 0.56, 0.58, 0), accent, 0.65))
	root.add_child(_box("Spine", Vector3(0.22, 0.18, 1.0), Vector3(0, 0.95, -0.02), Color("fff1b3"), 0.9))


static func _elf(root: Node3D, accent: Color, skin: Color) -> void:
	var mohawk := Node3D.new()
	mohawk.name = "Mohawk"
	for idx in range(4):
		mohawk.add_child(_box("Fin%d" % idx, Vector3(0.12, 0.34 + idx * 0.04, 0.06), Vector3(0, 0.86 + idx * 0.12, -0.16 + idx * 0.12), accent, 1.4))
	root.add_child(mohawk)
	for side in [-1.0, 1.0]:
		root.add_child(_ring("Piercing%d" % int(side), 0.07, 0.018, Vector3(side * 0.2, 0.5, 0.33), skin, 0.75))
	root.add_child(_box("BackRig", Vector3(0.18, 0.7, 0.46), Vector3(0, 0.56, -0.34), accent.darkened(0.4), 0.6))


static func _santa(root: Node3D, accent: Color, body: Color) -> void:
	var cage := Node3D.new()
	cage.name = "SiegeCage"
	cage.add_child(_box("Crossbar", Vector3(1.2, 0.12, 0.12), Vector3(0, 0.98, 0.34), accent, 1.0))
	for side in [-1.0, 1.0]:
		cage.add_child(_box("Rail%d" % int(side), Vector3(0.12, 1.0, 0.12), Vector3(side * 0.56, 0.48, 0.34), accent, 1.0))
		cage.add_child(_stack("Stack%d" % int(side), Vector3(side * 0.52, 1.0, -0.18), accent))
	root.add_child(cage)
	root.add_child(_box("Ram", Vector3(1.02, 0.34, 0.28), Vector3(0, 0.08, 0.6), body.darkened(0.6), 0.0, Vector3(-14, 0, 0)))


static func _bumble(root: Node3D, accent: Color, body: Color) -> void:
	var rack := Node3D.new()
	rack.name = "AntlerRack"
	for side in [-1.0, 1.0]:
		rack.add_child(_box("Beam%d" % int(side), Vector3(0.12, 0.92, 0.12), Vector3(side * 0.52, 1.05, 0), accent, 1.0, Vector3(0, 0, side * 28)))
		rack.add_child(_box("TineA%d" % int(side), Vector3(0.42, 0.1, 0.1), Vector3(side * 0.74, 1.36, 0.05), accent, 1.0, Vector3(0, 0, side * 32)))
		rack.add_child(_box("TineB%d" % int(side), Vector3(0.34, 0.1, 0.1), Vector3(side * 0.67, 1.12, -0.08), accent, 1.0, Vector3(0, 0, side * 18)))
	root.add_child(rack)
	root.add_child(_box("ShoulderShell", Vector3(1.32, 0.28, 0.94), Vector3(0, 0.84, -0.04), body.darkened(0.35), 0.0))


static func _horn(name: String, side: float, color: Color) -> Node3D:
	var horn := Node3D.new()
	horn.name = name
	horn.add_child(_box("Base", Vector3(0.28, 0.7, 0.2), Vector3(side * 1.05, 1.42, 0.16), color.darkened(0.25), 0.4, Vector3(0, 0, side * 24)))
	horn.add_child(_box("Tip", Vector3(0.62, 0.12, 0.12), Vector3(side * 1.45, 1.8, 0.26), Color("ffd86e"), 1.0, Vector3(0, 0, side * 28)))
	return horn


static func _stack(name: String, pos: Vector3, accent: Color) -> Node3D:
	var stack := Node3D.new()
	stack.name = name
	stack.add_child(_cyl("Pipe", 0.08, 0.46, pos, Color("1c1414"), 0.0))
	stack.add_child(_ring("Glow", 0.12, 0.025, pos + Vector3(0, 0.27, 0), accent, 1.1))
	return stack


static func _box(name: String, size: Vector3, pos: Vector3, color: Color, energy: float = 0.0, rot: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.name = name
	var mesh := BoxMesh.new()
	mesh.size = size
	node.mesh = mesh
	node.position = pos
	node.rotation_degrees = rot
	node.material_override = _mat(color, energy)
	return node


static func _cyl(name: String, radius: float, height: float, pos: Vector3, color: Color, energy: float = 0.0) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.name = name
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius
	mesh.bottom_radius = radius
	mesh.height = height
	node.mesh = mesh
	node.position = pos
	node.material_override = _mat(color, energy)
	return node


static func _ring(name: String, radius: float, thickness: float, pos: Vector3, color: Color, energy: float) -> MeshInstance3D:
	var node := MeshInstance3D.new()
	node.name = name
	var mesh := TorusMesh.new()
	mesh.outer_radius = radius
	mesh.inner_radius = thickness
	node.mesh = mesh
	node.position = pos
	node.rotation_degrees = Vector3(90, 0, 0)
	node.material_override = _mat(color, energy)
	return node


static func _mat(color: Color, energy: float = 0.0) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.15
	mat.roughness = 0.42
	if energy > 0.0:
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = energy
	return mat
