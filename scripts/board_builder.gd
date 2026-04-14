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
	var drift_material: Material = materials.flat_material(Color("c8d6e2"))
	for drift in board_data.drifts:
		var node := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		var radius := float(drift.get("radius", 1.8))
		mesh.top_radius = radius * 0.92
		mesh.bottom_radius = radius
		mesh.height = 0.035
		node.mesh = mesh
		node.position = Vector3(float(drift["world"].x), 0.025, float(drift["world"].y))
		var stretch := float(drift.get("stretch", 1.0))
		node.scale = Vector3(stretch * 1.2, 1.0, clampf(1.0 / maxf(stretch * 1.6, 0.01), 0.22, 0.58))
		node.rotation.y = float(drift.get("rotation", 0.0))
		node.material_override = drift_material
		board_root.add_child(node)


func build_outer_ridge(board_root: Node3D, board_data: BoardLayout) -> void:
	# Build elongated snowbanks from ridge samples so the perimeter reads as drift lines,
	# not as a repeated row of ice pucks.
	var snow_material: Material = materials.material_for_zone("snow")
	var accents := [Color("ff2244"), Color("ffd700"), Color("1f9f58")]
	var ridges: Array = board_data.ridges if not board_data.ridges.is_empty() else _fallback_ridges()
	for ridge_index in range(ridges.size()):
		var ridge: Dictionary = ridges[ridge_index]
		var world: Vector2 = ridge["world"]
		var mound := MeshInstance3D.new()
		var mound_mesh := CylinderMesh.new()
		var radius := float(ridge.get("radius", 1.8))
		var height := clampf(float(ridge.get("height", 3.6)) * 0.12, 0.36, 0.95)
		mound_mesh.top_radius = radius * 0.76
		mound_mesh.bottom_radius = radius
		mound_mesh.height = height
		mound.mesh = mound_mesh
		mound.position = Vector3(world.x, height * 0.32, world.y)
		mound.scale = Vector3(clampf(radius * 1.15, 1.4, 3.2), 1.0, 0.58)
		mound.rotation.y = world.angle() + PI * 0.5
		mound.material_override = snow_material
		board_root.add_child(mound)
		if ridge_index % 3 == 0:
			_add_hazard_pair(board_root, world, world.angle() + PI * 0.5, accents[int(ridge_index / 3) % accents.size()])


func _add_hazard_pair(board_root: Node3D, world: Vector2, tangent_angle: float, accent: Color) -> void:
	var tangent := Vector2.RIGHT.rotated(tangent_angle)
	for offset in [-0.8, 0.8]:
		var post := MeshInstance3D.new()
		var post_mesh := CylinderMesh.new()
		post_mesh.top_radius = 0.1
		post_mesh.bottom_radius = 0.15
		post_mesh.height = 1.15
		post.mesh = post_mesh
		post.position = Vector3(world.x + tangent.x * offset, 0.72, world.y + tangent.y * offset)
		post.material_override = materials.flat_material(Color("2b1716"))
		board_root.add_child(post)
		var cap := MeshInstance3D.new()
		var cap_mesh := SphereMesh.new()
		cap_mesh.radius = 0.16
		cap_mesh.height = 0.32
		cap.mesh = cap_mesh
		cap.position = post.position + Vector3(0.0, 0.52, 0.0)
		cap.material_override = materials.emissive_material(accent, 1.3, 0.35)
		board_root.add_child(cap)


func _fallback_ridges() -> Array:
	var ridges: Array = []
	var arena_radius := 18.0
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	for ridge_index in range(18):
		var angle := TAU * float(ridge_index) / 18.0 + rng.randf_range(-0.08, 0.08)
		ridges.append({
			"world": Vector2.RIGHT.rotated(angle) * (arena_radius + rng.randf_range(2.4, 5.8)),
			"radius": rng.randf_range(1.0, 2.4),
			"height": rng.randf_range(2.4, 7.0),
		})
	return ridges
