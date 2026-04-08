extends RefCounted

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func build_board_foundation(board_root: Node3D, arena_radius: float) -> void:
	var outer_field := MeshInstance3D.new()
	var outer_field_mesh := PlaneMesh.new()
	outer_field_mesh.size = Vector2((arena_radius + 18.0) * 2.0, (arena_radius + 18.0) * 2.0)
	outer_field.mesh = outer_field_mesh
	outer_field.position = Vector3(0, -0.02, 0)
	outer_field.material_override = materials.outer_field_material(arena_radius)
	board_root.add_child(outer_field)

	var slab := MeshInstance3D.new()
	var slab_mesh := CylinderMesh.new()
	slab_mesh.top_radius = arena_radius + 0.45
	slab_mesh.bottom_radius = arena_radius + 0.8
	slab_mesh.height = 0.8
	slab.mesh = slab_mesh
	slab.position = Vector3(0, -0.4, 0)
	slab.material_override = materials.flat_material(Color("213347"))
	board_root.add_child(slab)

	var arena_surface := MeshInstance3D.new()
	var arena_surface_mesh := PlaneMesh.new()
	arena_surface_mesh.size = Vector2((arena_radius + 0.75) * 2.0, (arena_radius + 0.75) * 2.0)
	arena_surface.mesh = arena_surface_mesh
	arena_surface.position = Vector3(0, 0.03, 0)
	arena_surface.material_override = materials.arena_surface_material(arena_radius)
	board_root.add_child(arena_surface)


func build_snow_drifts(board_root: Node3D, board_data: Dictionary) -> void:
	var snow_material: Material = materials.material_for_zone("snow")
	for drift in board_data.get("drifts", []):
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


func build_outer_ridge(board_root: Node3D, board_data: Dictionary) -> void:
	for ridge in board_data.get("ridges", []):
		var body := MeshInstance3D.new()
		var body_mesh := CylinderMesh.new()
		var ridge_radius := float(ridge.get("radius", 1.8))
		var ridge_height := float(ridge.get("height", 4.2))
		body_mesh.top_radius = ridge_radius * 0.82
		body_mesh.bottom_radius = ridge_radius * 1.15
		body_mesh.height = ridge_height
		body.mesh = body_mesh
		body.position = Vector3(float(ridge["world"].x), ridge_height * 0.42 - 0.45, float(ridge["world"].y))
		body.rotation.y = float(ridge.get("rotation", 0.0))
		body.material_override = materials.flat_material(Color("4f6a82"))
		board_root.add_child(body)

		if bool(ridge.get("snow_cap", true)):
			var cap := MeshInstance3D.new()
			var cap_mesh := SphereMesh.new()
			cap_mesh.radius = ridge_radius * 0.62
			cap_mesh.height = ridge_radius * 1.2
			cap.mesh = cap_mesh
			cap.position = body.position + Vector3(0, ridge_height * 0.42, 0)
			cap.material_override = materials.flat_material(Color("edf8ff"))
			board_root.add_child(cap)
