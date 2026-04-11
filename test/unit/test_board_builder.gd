extends GdUnitTestSuite

const BOARD_BUILDER := preload("res://scripts/board_builder.gd")


class StubMaterials:
	extends RefCounted
	func flat_material(_color: Color) -> Material:
		return null
	func arena_surface_material(_radius: float) -> Material:
		return null
	func material_for_zone(_zone: String) -> Material:
		return null
	func snow_material() -> Material:
		return null


var _builder: RefCounted
var _root: Node3D


func before_test() -> void:
	_builder = BOARD_BUILDER.new(StubMaterials.new(), null)
	_root = Node3D.new()
	add_child(_root)


func after_test() -> void:
	if _root != null and is_instance_valid(_root):
		_root.queue_free()


func test_build_board_foundation_adds_surface_and_border_nodes() -> void:
	_builder.build_board_foundation(_root, 8.0)
	# outer_field + arena_surface = 2
	assert_int(_root.get_child_count()).is_equal(2)
	var first: MeshInstance3D = _root.get_child(0) as MeshInstance3D
	assert_object(first).is_not_null()


func test_build_snow_drifts_adds_one_node_per_drift() -> void:
	var layout := BoardLayout.new()
	layout.drifts = [
		{"world": Vector2(2.0, 1.5), "radius": 1.8, "stretch": 1.0, "rotation": 0.0},
		{"world": Vector2(-3.0, 2.0), "radius": 1.4, "stretch": 1.2, "rotation": 0.5},
		{"world": Vector2(0.5, -4.0), "radius": 2.0, "stretch": 0.9, "rotation": 1.1},
	]
	_builder.build_snow_drifts(_root, layout)
	assert_int(_root.get_child_count()).is_equal(3)


func test_build_snow_drifts_empty_board_adds_nothing() -> void:
	_builder.build_snow_drifts(_root, BoardLayout.new())
	assert_int(_root.get_child_count()).is_equal(0)


func test_build_outer_ridge_adds_nodes() -> void:
	# 4 perimeter segments × steps each.
	_builder.build_outer_ridge(_root, BoardLayout.new())
	assert_int(_root.get_child_count()).is_greater(10)


func test_build_outer_ridge_is_deterministic() -> void:
	var root_a := Node3D.new()
	add_child(root_a)
	var root_b := Node3D.new()
	add_child(root_b)

	_builder.build_outer_ridge(root_a, BoardLayout.new())
	_builder.build_outer_ridge(root_b, BoardLayout.new())

	assert_int(root_a.get_child_count()).is_equal(root_b.get_child_count())
	for i in range(root_a.get_child_count()):
		var ca: MeshInstance3D = root_a.get_child(i) as MeshInstance3D
		var cb: MeshInstance3D = root_b.get_child(i) as MeshInstance3D
		assert_float(ca.position.x).is_equal_approx(cb.position.x, 0.001)
		assert_float(ca.position.z).is_equal_approx(cb.position.z, 0.001)

	root_a.queue_free()
	root_b.queue_free()
