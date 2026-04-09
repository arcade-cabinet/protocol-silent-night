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
	outer_field.material_override = materials.flat_material(Color("0a1420"))
	board_root.add_child(outer_field)
	var arena_surface := MeshInstance3D.new()
	var arena_mesh := PlaneMesh.new()
	arena_mesh.size = Vector2(half_w * 2.0, half_h * 2.0)
	arena_surface.mesh = arena_mesh
	arena_surface.position = Vector3(0, 0.03, 0)
	arena_surface.material_override = materials.arena_surface_material(arena_radius)
	board_root.add_child(arena_surface)
	_build_border(board_root, half_w, half_h)


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


func build_outer_ridge(_board_root: Node3D, _board_data: Dictionary) -> void:
	pass


func _build_border(root: Node3D, half_w: float, half_h: float) -> void:
	var border_color := Color("1a2a3a")
	var border_thickness := 0.8
	for data in [
		[Vector3(0, 0.2, -half_h - border_thickness * 0.5), Vector3(half_w * 2.0 + border_thickness * 2.0, 0.5, border_thickness)],
		[Vector3(0, 0.2, half_h + border_thickness * 0.5), Vector3(half_w * 2.0 + border_thickness * 2.0, 0.5, border_thickness)],
		[Vector3(-half_w - border_thickness * 0.5, 0.2, 0), Vector3(border_thickness, 0.5, half_h * 2.0)],
		[Vector3(half_w + border_thickness * 0.5, 0.2, 0), Vector3(border_thickness, 0.5, half_h * 2.0)],
	]:
		var wall := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = data[1]
		wall.mesh = box
		wall.position = data[0]
		wall.material_override = materials.flat_material(border_color)
		root.add_child(wall)
