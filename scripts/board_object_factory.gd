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
	}
	board_objects.append(obj)
	return obj


func _build_visual(node: Node3D, object_type: String) -> void:
	match object_type:
		"frozen_mailbox": _build_mailbox(node)
		"gift_cache": _build_gift_cache(node)
		"chimney_vent": _build_chimney_vent(node)


func _build_mailbox(node: Node3D) -> void:
	node.set_meta("obj_type", "mailbox")
	var post := MeshInstance3D.new()
	var post_mesh := CylinderMesh.new()
	post_mesh.top_radius = 0.1
	post_mesh.bottom_radius = 0.12
	post_mesh.height = 1.0
	post.mesh = post_mesh
	post.position = Vector3(0, -0.2, 0)
	post.material_override = materials.flat_material(Color("3a2a1a"))
	node.add_child(post)
	var box := MeshInstance3D.new()
	var box_mesh := BoxMesh.new()
	box_mesh.size = Vector3(0.9, 0.6, 0.6)
	box.mesh = box_mesh
	box.position = Vector3(0, 0.5, 0)
	box.material_override = materials.emissive_material(Color("6aa8d4"), 0.6, 0.35)
	node.add_child(box)
	var frost := MeshInstance3D.new()
	var frost_mesh := SphereMesh.new()
	frost_mesh.radius = 0.18
	frost_mesh.height = 0.36
	frost.mesh = frost_mesh
	frost.position = Vector3(0.3, 0.75, 0.25)
	frost.material_override = materials.emissive_material(Color("ccf0ff"), 0.9, 0.15)
	node.add_child(frost)


func _build_gift_cache(node: Node3D) -> void:
	node.set_meta("obj_type", "gift_cache")
	var base := MeshInstance3D.new()
	var base_mesh := BoxMesh.new()
	base_mesh.size = Vector3(1.2, 1.0, 1.2)
	base.mesh = base_mesh
	base.position = Vector3(0, 0.3, 0)
	base.material_override = materials.emissive_material(Color("d6365a"), 0.8, 0.3)
	node.add_child(base)
	var ribbon_h := MeshInstance3D.new()
	var rh_mesh := BoxMesh.new()
	rh_mesh.size = Vector3(1.3, 0.15, 0.2)
	ribbon_h.mesh = rh_mesh
	ribbon_h.position = Vector3(0, 0.85, 0)
	ribbon_h.material_override = materials.emissive_material(Color("ffd700"), 1.4, 0.2)
	node.add_child(ribbon_h)
	var bow := MeshInstance3D.new()
	var bow_mesh := TorusMesh.new()
	bow_mesh.outer_radius = 0.25
	bow_mesh.inner_radius = 0.06
	bow.mesh = bow_mesh
	bow.rotation_degrees = Vector3(90, 0, 0)
	bow.position = Vector3(0, 1.0, 0)
	bow.material_override = materials.emissive_material(Color("ffd700"), 1.8, 0.15)
	node.add_child(bow)


func _build_chimney_vent(node: Node3D) -> void:
	node.set_meta("obj_type", "chimney")
	var stack := MeshInstance3D.new()
	var stack_mesh := CylinderMesh.new()
	stack_mesh.top_radius = 0.3
	stack_mesh.bottom_radius = 0.4
	stack_mesh.height = 1.2
	stack.mesh = stack_mesh
	stack.position = Vector3(0, 0.3, 0)
	stack.material_override = materials.flat_material(Color("4a3028"))
	node.add_child(stack)
	var cap := MeshInstance3D.new()
	var cap_mesh := CylinderMesh.new()
	cap_mesh.top_radius = 0.38
	cap_mesh.bottom_radius = 0.38
	cap_mesh.height = 0.08
	cap.mesh = cap_mesh
	cap.position = Vector3(0, 0.95, 0)
	cap.material_override = materials.flat_material(Color("2a1a14"))
	node.add_child(cap)
	var ember := MeshInstance3D.new()
	var ember_mesh := SphereMesh.new()
	ember_mesh.radius = 0.12
	ember_mesh.height = 0.24
	ember.mesh = ember_mesh
	ember.position = Vector3(0, 1.1, 0)
	ember.material_override = materials.emissive_material(Color("ff6622"), 2.2, 0.1)
	node.add_child(ember)
