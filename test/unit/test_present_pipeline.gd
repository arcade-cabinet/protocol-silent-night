extends GdUnitTestSuite

## Integration tests for the present rendering pipeline:
## topper meshes, body factory, accessory meshes, animator idle styles.

const TOPPERS := preload("res://scripts/present_topper_meshes.gd")
const BODY := preload("res://scripts/present_body_factory.gd")
const ACCESSORIES := preload("res://scripts/present_accessory_meshes.gd")
const ANIMATOR := preload("res://scripts/present_animator.gd")
const FACTORY := preload("res://scripts/present_factory.gd")


func _minimal_def(shape: String = "box", topper: String = "none", accessory: String = "none") -> Dictionary:
	return {
		"id": "test", "box_width": 1.0, "box_height": 1.2, "box_depth": 0.9,
		"bow_color": "#ffd700", "arm_color": "#ffffff", "leg_color": "#333333",
		"pattern_color": "#ffffaa", "expression": "determined",
		"body_shape": shape, "topper": topper, "accessory": accessory,
	}


func _make_material() -> Material:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#ff8822")
	return mat


func test_topper_none_returns_empty_node() -> void:
	var node: Node3D = auto_free(TOPPERS.build("none"))
	assert_int(node.get_child_count()).is_equal(0)


func test_topper_all_kinds_produce_meshes() -> void:
	for kind in ["santa_hat", "antlers", "star", "halo", "candy_cane", "bow_giant", "ornament"]:
		var node: Node3D = auto_free(TOPPERS.build(kind, Color.GOLD))
		assert_int(node.get_child_count()).is_greater(0)


func test_body_factory_all_shapes_return_rig_dict() -> void:
	var mat: Material = _make_material()
	for shape in ["box", "cube", "tall_rect", "stacked_duo", "cylinder", "gift_bag"]:
		var rig: Dictionary = BODY.build(shape, _minimal_def(), 1.0, 1.2, 0.9, mat)
		assert_bool(rig.has("root")).is_true()
		assert_bool(rig.has("sockets")).is_true()
		assert_bool(rig.has("anatomy")).is_true()
		assert_bool(rig.has("idle_style")).is_true()
		var root: Node3D = rig["root"]
		auto_free(root)
		assert_int(root.get_child_count()).is_greater(0)


func test_gift_bag_omits_legs_and_uses_hop_idle() -> void:
	var rig: Dictionary = BODY.build("gift_bag", _minimal_def(), 1.0, 1.2, 0.9, _make_material())
	auto_free(rig["root"])
	assert_bool("legs" in rig["anatomy"]).is_false()
	assert_str(String(rig["idle_style"])).is_equal("hop")
	assert_str(String(rig["arm_style"])).is_equal("wavy")
	assert_str(String(rig["leg_style"])).is_equal("none")


func test_stacked_duo_anchors_face_on_top_box() -> void:
	var rig: Dictionary = BODY.build("stacked_duo", _minimal_def(), 1.0, 1.2, 0.9, _make_material())
	auto_free(rig["root"])
	var face_y: float = float(rig["sockets"]["face"].y)
	assert_float(face_y).is_greater(0.6)
	assert_str(String(rig["idle_style"])).is_equal("wobble")


func test_accessory_all_kinds_build_without_crash() -> void:
	for kind in ["scarf", "tag", "ribbon_tail", "glow_aura"]:
		var node: Node3D = auto_free(ACCESSORIES.build(kind, _minimal_def(), 1.0, 1.2, 0.9))
		assert_int(node.get_child_count()).is_greater(0)


func test_accessory_none_empty() -> void:
	var node: Node3D = auto_free(ACCESSORIES.build("none", _minimal_def(), 1.0, 1.2, 0.9))
	assert_int(node.get_child_count()).is_equal(0)


func test_present_factory_end_to_end_gift_bag_has_no_legs() -> void:
	var factory: RefCounted = FACTORY.new()
	var present: Node3D = auto_free(factory.build_present(_minimal_def("gift_bag", "santa_hat", "scarf")))
	assert_object(present).is_not_null()
	assert_bool(present.has_meta("idle_style")).is_true()
	assert_str(String(present.get_meta("idle_style"))).is_equal("hop")


func test_present_factory_end_to_end_all_shapes_build_successfully() -> void:
	var factory: RefCounted = FACTORY.new()
	for shape in ["box", "cube", "tall_rect", "stacked_duo", "cylinder", "gift_bag"]:
		var present: Node3D = auto_free(factory.build_present(_minimal_def(shape)))
		assert_int(present.get_child_count()).is_greater(3)


func test_animator_idle_styles_produce_offsets() -> void:
	var anim: RefCounted = ANIMATOR.new()
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	for style in ["bounce", "sway", "wobble", "hop", "spin"]:
		visual.set_meta("idle_style", style)
		visual.position = Vector3.ZERO
		for _i in range(60):
			anim.update(0.016, visual, Vector2.ZERO)
		# After 60 ticks, y position should differ from baseline (or rotation for spin)
		var moved: bool = absf(visual.position.y - 0.12) > 0.001 or absf(visual.position.x) > 0.001 or absf(visual.rotation.y) > 0.001
		assert_bool(moved).is_true()
