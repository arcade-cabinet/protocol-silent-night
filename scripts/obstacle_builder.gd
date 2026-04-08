extends RefCounted

var materials: RefCounted  # MaterialFactory


func _init(material_factory: RefCounted) -> void:
	materials = material_factory


func make_obstacle(board_root: Node3D, obstacle: Dictionary, obstacle_colliders: Array) -> void:
	var node := Node3D.new()
	node.position = Vector3(obstacle["world"].x, 0.55, obstacle["world"].y)
	var mesh_instance := MeshInstance3D.new()
	var obstacle_type := String(obstacle["type"])
	match obstacle_type:
		"gift_stack":
			var box := BoxMesh.new()
			box.size = Vector3(1.1, 1.1, 1.1)
			mesh_instance.mesh = box
			mesh_instance.material_override = materials.flat_material(Color("d6365a"))
			var ribbon := MeshInstance3D.new()
			var ribbon_box := BoxMesh.new()
			ribbon_box.size = Vector3(0.18, 1.18, 1.18)
			ribbon.mesh = ribbon_box
			ribbon.material_override = materials.flat_material(Color("ffd66e"))
			node.add_child(ribbon)
			var bow := MeshInstance3D.new()
			var bow_mesh := TorusMesh.new()
			bow_mesh.outer_radius = 0.26
			bow_mesh.inner_radius = 0.07
			bow.mesh = bow_mesh
			bow.rotation_degrees = Vector3(90, 0, 0)
			bow.position = Vector3(0, 0.62, 0)
			bow.material_override = materials.emissive_material(Color("ffd66e"), 1.2, 0.2)
			node.add_child(bow)
		"bollard_cluster":
			var cylinder := CylinderMesh.new()
			cylinder.top_radius = 0.22
			cylinder.bottom_radius = 0.26
			cylinder.height = 1.2
			mesh_instance.mesh = cylinder
			mesh_instance.material_override = materials.flat_material(Color("74dfff"))
			for offset in [Vector3(0.34, -0.1, 0.18), Vector3(-0.28, 0.0, -0.22)]:
				var side := MeshInstance3D.new()
				var side_mesh := CylinderMesh.new()
				side_mesh.top_radius = 0.15
				side_mesh.bottom_radius = 0.18
				side_mesh.height = 0.86
				side.mesh = side_mesh
				side.position = offset
				side.material_override = materials.flat_material(Color("4ec9ff"))
				node.add_child(side)
		_:
			var crate := BoxMesh.new()
			crate.size = Vector3(1.35, 0.95, 1.35)
			mesh_instance.mesh = crate
			mesh_instance.material_override = materials.flat_material(Color("605b74"))
			var stripe := MeshInstance3D.new()
			var stripe_mesh := BoxMesh.new()
			stripe_mesh.size = Vector3(1.4, 0.12, 0.2)
			stripe.mesh = stripe_mesh
			stripe.position = Vector3(0, 0.18, 0.48)
			stripe.material_override = materials.emissive_material(Color("ffe07a"), 1.0, 0.18)
			node.add_child(stripe)
	node.add_child(mesh_instance)
	board_root.add_child(node)
	obstacle_colliders.append({
		"world": Vector2(node.position.x, node.position.z),
		"radius": obstacle_radius(obstacle_type),
		"type": obstacle_type
	})


func make_landmark(board_root: Node3D, landmark: Dictionary) -> void:
	var node := Node3D.new()
	node.position = Vector3(landmark["world"].x, 0.7, landmark["world"].y)
	match String(landmark["type"]):
		"candy_cane_gate":
			for dir in [-1.0, 1.0]:
				var pole := MeshInstance3D.new()
				var pole_mesh := CylinderMesh.new()
				pole_mesh.top_radius = 0.15
				pole_mesh.bottom_radius = 0.15
				pole_mesh.height = 2.2
				pole.mesh = pole_mesh
				pole.position = Vector3(dir * 0.55, 0.6, 0)
				pole.material_override = materials.flat_material(Color("ff5d7d") if dir < 0.0 else Color("f4fcff"))
				node.add_child(pole)
			var crossbar := MeshInstance3D.new()
			var crossbar_mesh := BoxMesh.new()
			crossbar_mesh.size = Vector3(1.36, 0.18, 0.24)
			crossbar.mesh = crossbar_mesh
			crossbar.position = Vector3(0, 1.55, 0)
			crossbar.material_override = materials.emissive_material(Color("ffe07a"), 1.1, 0.24)
			node.add_child(crossbar)
		"wreath_machine":
			var ring := MeshInstance3D.new()
			var torus := TorusMesh.new()
			torus.outer_radius = 0.75
			torus.inner_radius = 0.16
			ring.mesh = torus
			ring.rotation_degrees = Vector3(90, 0, 0)
			ring.material_override = materials.emissive_material(Color("49d98c"), 1.6, 0.2)
			node.add_child(ring)
			var core := MeshInstance3D.new()
			var core_mesh := CylinderMesh.new()
			core_mesh.top_radius = 0.22
			core_mesh.bottom_radius = 0.28
			core_mesh.height = 1.05
			core.mesh = core_mesh
			core.position = Vector3(0, 0.15, 0)
			core.material_override = materials.flat_material(Color("23313e"))
			node.add_child(core)
		"present_heap":
			for offset in [Vector3(-0.45, 0, 0), Vector3(0.45, 0, 0), Vector3(0, 0.45, 0.4)]:
				var gift := MeshInstance3D.new()
				var gift_mesh := BoxMesh.new()
				gift_mesh.size = Vector3(0.8, 0.8, 0.8)
				gift.mesh = gift_mesh
				gift.position = offset
				gift.material_override = materials.flat_material([Color("d6365a"), Color("49d98c"), Color("ffd66e")][randi() % 3])
				node.add_child(gift)
		"signal_pylon":
			var stem := MeshInstance3D.new()
			var stem_mesh := CylinderMesh.new()
			stem_mesh.top_radius = 0.18
			stem_mesh.bottom_radius = 0.24
			stem_mesh.height = 2.6
			stem.mesh = stem_mesh
			stem.material_override = materials.flat_material(Color("9ec9ff"))
			node.add_child(stem)
			var beacon := MeshInstance3D.new()
			var beacon_mesh := SphereMesh.new()
			beacon_mesh.radius = 0.28
			beacon_mesh.height = 0.56
			beacon.mesh = beacon_mesh
			beacon.position = Vector3(0, 1.1, 0)
			beacon.material_override = materials.emissive_material(Color("ff617e"), 2.0, 0.12)
			node.add_child(beacon)
	board_root.add_child(node)


func obstacle_radius(obstacle_type: String) -> float:
	match obstacle_type:
		"gift_stack":
			return 0.76
		"bollard_cluster":
			return 0.58
		_:
			return 0.84
