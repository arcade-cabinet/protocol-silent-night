extends RefCounted

## Procedural destructible board objects: frozen mailbox, gift cache,
## chimney vent. Built from primitives + themed materials.
## Drop scrolls when destroyed.

const OBJECT_TYPES := ["frozen_mailbox", "gift_cache", "chimney_vent"]

var materials: RefCounted


func _init(material_factory: RefCounted) -> void:
	materials = material_factory


func spawn_board_object(board_root: Node3D, board_objects: Array,
		arena_radius: float, rng: RandomNumberGenerator) -> Dictionary:
	var object_type: String = OBJECT_TYPES[rng.randi() % OBJECT_TYPES.size()]
	var node := Node3D.new()
	node.name = "BoardObj_%s" % object_type
	var half_w := arena_radius * 1.6 - 2.0
	var half_h := arena_radius - 2.0
	var margin := 3.0
	node.position = Vector3(
		rng.randf_range(-half_w + margin, half_w - margin),
		0.3,
		rng.randf_range(-half_h + margin, half_h - margin)
	)
	_build_visual(node, object_type)
	board_root.add_child(node)
	var obj := {
		"node": node, "type": object_type,
		"hp": 30.0, "max_hp": 30.0,
		"world": Vector2(node.position.x, node.position.z),
		"radius": 0.9,
		"hp_bar": node.get_node_or_null("HPBar"),
	}
	board_objects.append(obj)
	return obj


func _build_visual(node: Node3D, object_type: String) -> void:
	match object_type:
		"frozen_mailbox": _build_mailbox(node)
		"gift_cache": _build_gift_cache(node)
		"chimney_vent": _build_chimney_vent(node)
	_add_health_bar(node)


func _build_mailbox(node: Node3D) -> void:
	node.set_meta("obj_type", "mailbox")
	var body := MeshInstance3D.new()
	var body_mesh := BoxMesh.new()
	body_mesh.size = Vector3(0.4, 0.8, 0.4)
	body.mesh = body_mesh
	body.position = Vector3(0.0, 0.4, 0.0)
	body.material_override = materials.emissive_material(Color("6aa8d4"), 0.6, 0.35)
	node.add_child(body)
	var mouth := MeshInstance3D.new()
	var mouth_mesh := BoxMesh.new()
	mouth_mesh.size = Vector3(0.18, 0.08, 0.06)
	mouth.mesh = mouth_mesh
	mouth.position = Vector3(0.0, 0.32, 0.23)
	mouth.material_override = materials.flat_material(Color("0d1b2e"))
	node.add_child(mouth)
	var frost := MeshInstance3D.new()
	var frost_mesh := SphereMesh.new()
	frost_mesh.radius = 0.1
	frost_mesh.height = 0.2
	frost.mesh = frost_mesh
	frost.position = Vector3(0.12, 0.72, 0.1)
	frost.material_override = materials.emissive_material(Color("d8f4ff"), 0.9, 0.15)
	node.add_child(frost)


func _build_gift_cache(node: Node3D) -> void:
	node.set_meta("obj_type", "gift_cache")
	var base := MeshInstance3D.new()
	var base_mesh := BoxMesh.new()
	base_mesh.size = Vector3(1.0, 0.35, 1.0)
	base.mesh = base_mesh
	base.position = Vector3(0.0, 0.17, 0.0)
	base.material_override = materials.emissive_material(Color("d6365a"), 0.8, 0.3)
	node.add_child(base)
	var ribbon_h := MeshInstance3D.new()
	var rh_mesh := BoxMesh.new()
	rh_mesh.size = Vector3(1.05, 0.06, 0.14)
	ribbon_h.mesh = rh_mesh
	ribbon_h.position = Vector3(0.0, 0.38, 0.0)
	ribbon_h.material_override = materials.emissive_material(Color("ffd700"), 1.4, 0.2)
	node.add_child(ribbon_h)
	var ribbon_z := MeshInstance3D.new()
	var rz_mesh := BoxMesh.new()
	rz_mesh.size = Vector3(0.14, 0.06, 1.05)
	ribbon_z.mesh = rz_mesh
	ribbon_z.position = Vector3(0.0, 0.38, 0.0)
	ribbon_z.material_override = materials.emissive_material(Color("ffd700"), 1.4, 0.2)
	node.add_child(ribbon_z)


func _build_chimney_vent(node: Node3D) -> void:
	node.set_meta("obj_type", "chimney")
	var stack := MeshInstance3D.new()
	var stack_mesh := CylinderMesh.new()
	stack_mesh.top_radius = 0.45
	stack_mesh.bottom_radius = 0.45
	stack_mesh.height = 0.9
	stack.mesh = stack_mesh
	stack.position = Vector3(0.0, 0.2, 0.0)
	stack.material_override = materials.flat_material(Color("2a1a14"))
	node.add_child(stack)
	var glow := MeshInstance3D.new()
	var glow_mesh := SphereMesh.new()
	glow_mesh.radius = 0.12
	glow_mesh.height = 0.24
	glow.mesh = glow_mesh
	glow.position = Vector3(0.0, 0.72, 0.0)
	glow.material_override = materials.emissive_material(Color("ff6622"), 2.2, 0.1)
	node.add_child(glow)
	var smoke := CPUParticles3D.new()
	smoke.emitting = true
	smoke.amount = 10
	smoke.lifetime = 1.2
	smoke.direction = Vector3(0.0, 1.0, 0.0)
	smoke.spread = 12.0
	smoke.initial_velocity_min = 0.3
	smoke.initial_velocity_max = 0.5
	smoke.position = Vector3(0.0, 0.76, 0.0)
	node.add_child(smoke)


func _add_health_bar(node: Node3D) -> void:
	var bar := MeshInstance3D.new()
	bar.name = "HPBar"
	var quad := QuadMesh.new()
	quad.size = Vector2(0.8, 0.08)
	bar.mesh = quad
	bar.position = Vector3(0.0, 1.8, 0.0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("44ff77")
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	bar.material_override = mat
	node.add_child(bar)
