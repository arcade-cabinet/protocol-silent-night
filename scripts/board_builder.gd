extends RefCounted

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func build_board_foundation(board_root: Node3D, arena_radius: float) -> void:
	var half_w := arena_radius * 1.6
	var half_h := arena_radius
	var outer_field := MeshInstance3D.new()
	var outer_mesh := PlaneMesh.new()
	outer_mesh.size = Vector2((half_w + 10.0) * 2.0, (half_h + 10.0) * 2.0)
	outer_field.mesh = outer_mesh
	outer_field.position = Vector3(0, -0.02, 0)
	outer_field.material_override = materials.outer_field_material(arena_radius)
	board_root.add_child(outer_field)
	
	var arena := MeshInstance3D.new()
	var arena_mesh := PlaneMesh.new()
	arena_mesh.size = Vector2(half_w * 2.0, half_h * 2.0)
	arena.mesh = arena_mesh
	arena.material_override = materials.arena_surface_material(arena_radius)
	board_root.add_child(arena)


func build_snow_drifts(board_root: Node3D, board_data: BoardLayout) -> void:
	var snow_material: Material = materials.material_for_zone("snow")
	for drift in board_data.drifts:
		var node := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		var radius := float(drift.get("radius", 1.8))
		mesh.top_radius = radius
		mesh.bottom_radius = radius * 0.94
		mesh.height = 0.06
		node.mesh = mesh
		node.position = Vector3(float(drift["world"].x), 0.04, float(drift["world"].y))
		node.scale = Vector3(float(drift.get("stretch", 1.0)), 1.0, 1.0 / maxf(float(drift.get("stretch", 1.0)), 0.01))
		node.rotation.y = float(drift.get("rotation", 0.0))
		node.material_override = snow_material
		board_root.add_child(node)


func build_outer_ridge(board_root: Node3D, _board_data: BoardLayout) -> void:
	# Low snowbanks and festive hazard stakes hold the board without reading as debug ice walls.
	var arena_radius: float = 18.0 # Should probably come from config but keeping consistent with prev
	var half_w := arena_radius * 1.6
	var half_h := arena_radius
	var snow_material: Material = materials.material_for_zone("snow")
	var accents := [Color("ff2244"), Color("ffd700"), Color("1f9f58")]
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var perimeter: Array = [
		[Vector2(-half_w, -half_h), Vector2(half_w, -half_h)],
		[Vector2(-half_w, half_h), Vector2(half_w, half_h)],
		[Vector2(-half_w, -half_h), Vector2(-half_w, half_h)],
		[Vector2(half_w, -half_h), Vector2(half_w, half_h)]
	]
	for segment in perimeter:
		var start: Vector2 = segment[0]
		var end: Vector2 = segment[1]
		var dist := start.distance_to(end)
		var steps := int(dist / 2.5)
		for i in range(steps):
			var t := float(i) / float(steps)
			var pos := start.lerp(end, t)
			var drift := MeshInstance3D.new()
			var drift_mesh := CylinderMesh.new()
			var radius := rng.randf_range(0.95, 1.75)
			drift_mesh.top_radius = radius * 0.9
			drift_mesh.bottom_radius = radius * 1.18
			drift_mesh.height = rng.randf_range(0.35, 0.9)
			drift.mesh = drift_mesh
			drift.position = Vector3(pos.x, drift_mesh.height * 0.28, pos.y)
			drift.rotation.y = rng.randf() * TAU
			drift.material_override = snow_material
			board_root.add_child(drift)
			if i % 4 == 0:
				var post := MeshInstance3D.new()
				var post_mesh := CylinderMesh.new()
				post_mesh.top_radius = 0.12
				post_mesh.bottom_radius = 0.18
				post_mesh.height = rng.randf_range(1.1, 1.8)
				post.mesh = post_mesh
				post.position = Vector3(pos.x, post_mesh.height * 0.5 + 0.15, pos.y)
				post.material_override = materials.emissive_material(accents[int(i / 4) % accents.size()], 1.45, 0.32)
				board_root.add_child(post)
