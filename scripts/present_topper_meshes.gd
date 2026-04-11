extends RefCounted

## Builds procedural topper meshes for presents. 8 kinds:
## none / santa_hat / antlers / star / halo / candy_cane / bow_giant / ornament / tree.
## All rendered from Godot primitives + emissive StandardMaterial3D —
## zero texture imports, holidaypunk-safe.


static func build(kind: String, color: Color = Color("#ffffff")) -> Node3D:
	var root := Node3D.new()
	root.name = "Topper_%s" % kind
	match kind:
		"none": pass
		"santa_hat": _santa_hat(root, color)
		"antlers": _antlers(root, color)
		"star": _star(root, color)
		"halo": _halo(root, color)
		"candy_cane": _candy_cane(root, color)
		"bow_giant": _bow_giant(root, color)
		"ornament": _ornament(root, color)
		"tree": _tree(root, color)
	return root


static func _santa_hat(root: Node3D, color: Color) -> void:
	var base: MeshInstance3D = _cyl_mesh(0.28, 0.35, 0.1, Color("#ffffff"))
	base.position = Vector3(0, 0.02, 0)
	root.add_child(base)
	var cone: MeshInstance3D = _cyl_mesh(0.02, 0.32, 0.55, Color("#cc2244"))
	cone.position = Vector3(0.04, 0.35, 0.0)
	cone.rotation_degrees = Vector3(0, 0, -12)
	root.add_child(cone)
	var pom: MeshInstance3D = _sphere_mesh(0.1, Color("#ffffff"))
	pom.position = Vector3(0.08, 0.62, 0.0)
	root.add_child(pom)


static func _antlers(root: Node3D, color: Color) -> void:
	var brown := Color("#7a4e2a")
	for side in [-1.0, 1.0]:
		var trunk: MeshInstance3D = _cyl_mesh(0.04, 0.06, 0.35, brown)
		trunk.position = Vector3(side * 0.12, 0.2, 0)
		trunk.rotation_degrees = Vector3(0, 0, side * 12)
		root.add_child(trunk)
		for i in range(2):
			var prong: MeshInstance3D = _cyl_mesh(0.02, 0.03, 0.18, brown)
			prong.position = Vector3(side * (0.18 + i * 0.04), 0.35 + i * 0.08, 0)
			prong.rotation_degrees = Vector3(0, 0, side * (45 - i * 15))
			root.add_child(prong)


static func _star(root: Node3D, color: Color) -> void:
	var base_color := Color("#ffd700") if color.v < 0.1 else color
	var points := 5
	for i in range(points):
		var angle: float = TAU * float(i) / float(points) - PI / 2.0
		var spike: MeshInstance3D = _box_mesh(Vector3(0.08, 0.26, 0.08), base_color, true, 2.2)
		spike.position = Vector3(cos(angle) * 0.14, 0.18 + sin(angle) * 0.14, 0)
		spike.rotation = Vector3(0, 0, -angle + PI / 2.0)
		root.add_child(spike)
	var core: MeshInstance3D = _sphere_mesh(0.12, base_color, true, 1.8)
	core.position = Vector3(0, 0.18, 0)
	root.add_child(core)


static func _halo(root: Node3D, color: Color) -> void:
	var halo_color := Color("#ffffaa")
	var ring: MeshInstance3D = MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 0.3
	torus.inner_radius = 0.25
	ring.mesh = torus
	ring.position = Vector3(0, 0.35, 0)
	ring.material_override = _emissive_mat(halo_color, 2.4)
	root.add_child(ring)


static func _candy_cane(root: Node3D, color: Color) -> void:
	var shaft: MeshInstance3D = _cyl_mesh(0.05, 0.06, 0.55, Color("#ffffff"))
	shaft.position = Vector3(-0.1, 0.28, 0)
	root.add_child(shaft)
	var hook: MeshInstance3D = MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 0.12
	torus.inner_radius = 0.06
	hook.mesh = torus
	hook.position = Vector3(0, 0.55, 0)
	hook.rotation_degrees = Vector3(90, 0, 0)
	hook.material_override = _flat_mat(Color("#ff2244"))
	root.add_child(hook)


static func _bow_giant(root: Node3D, color: Color) -> void:
	var bow_color := Color("#ffd700") if color.v < 0.1 else color
	var knot: MeshInstance3D = _sphere_mesh(0.12, bow_color, true, 1.6)
	knot.position = Vector3(0, 0.2, 0)
	root.add_child(knot)
	for side in [-1.0, 1.0]:
		var loop: MeshInstance3D = MeshInstance3D.new()
		var torus := TorusMesh.new()
		torus.outer_radius = 0.22
		torus.inner_radius = 0.05
		loop.mesh = torus
		loop.position = Vector3(side * 0.22, 0.22, 0)
		loop.rotation_degrees = Vector3(0, 0, side * 35)
		loop.material_override = _emissive_mat(bow_color, 1.4)
		root.add_child(loop)


static func _ornament(root: Node3D, color: Color) -> void:
	var ball: MeshInstance3D = _sphere_mesh(0.2, color, true, 1.3)
	ball.position = Vector3(0, 0.3, 0)
	root.add_child(ball)
	var cap: MeshInstance3D = _cyl_mesh(0.06, 0.07, 0.08, Color("#aaaaaa"))
	cap.position = Vector3(0, 0.48, 0)
	root.add_child(cap)


static func _box_mesh(size: Vector3, color: Color, emissive: bool = false, energy: float = 1.0) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	inst.mesh = mesh
	inst.material_override = _emissive_mat(color, energy) if emissive else _flat_mat(color)
	return inst


static func _cyl_mesh(top: float, bottom: float, height: float, color: Color) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = top
	mesh.bottom_radius = bottom
	mesh.height = height
	inst.mesh = mesh
	inst.material_override = _flat_mat(color)
	return inst


static func _sphere_mesh(radius: float, color: Color, emissive: bool = false, energy: float = 1.0) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	inst.mesh = mesh
	inst.material_override = _emissive_mat(color, energy) if emissive else _flat_mat(color)
	return inst


static func _flat_mat(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.1
	mat.roughness = 0.5
	return mat


static func _emissive_mat(color: Color, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	return mat

static func _tree(root: Node3D, color: Color) -> void:
	var dark_green := Color("#1a4421")
	var trunk_brown := Color("#4d2d18")
	
	var trunk := _cyl_mesh(0.06, 0.08, 0.15, trunk_brown)
	trunk.position = Vector3(0, 0.07, 0)
	root.add_child(trunk)
	
	for i in range(3):
		var layer := _cyl_mesh(0.0, 0.4 - i * 0.1, 0.25, dark_green)
		layer.position = Vector3(0, 0.2 + i * 0.15, 0)
		root.add_child(layer)
	
	var star := _sphere_mesh(0.06, Color("#ffd700"), true, 1.5)
	star.position = Vector3(0, 0.6, 0)
	root.add_child(star)
