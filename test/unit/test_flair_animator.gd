extends GdUnitTestSuite

const ANIMATOR := preload("res://scripts/flair_animator.gd")
const FLAIR_VIZ := preload("res://scripts/gear_flair_visualizer.gd")


func _make_animator() -> Node:
	var anim: Node = auto_free(ANIMATOR.new())
	add_child(anim)
	return anim


func _make_target(position: Vector3 = Vector3.ZERO) -> MeshInstance3D:
	var target: MeshInstance3D = auto_free(MeshInstance3D.new())
	var sphere := SphereMesh.new()
	sphere.radius = 0.1
	sphere.height = 0.2
	target.mesh = sphere
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#ff0000")
	mat.emission_enabled = true
	mat.emission = Color("#ff0000")
	target.material_override = mat
	target.position = position
	add_child(target)
	return target


func test_register_stores_entry() -> void:
	var anim := _make_animator()
	var target := _make_target()
	anim.register(target, "wobble_animation", {"amplitude": 0.1, "rate": 2.0})
	assert_int(anim._entries.size()).is_equal(1)


func test_register_null_target_is_noop() -> void:
	var anim := _make_animator()
	anim.register(null, "wobble_animation", {})
	assert_int(anim._entries.size()).is_equal(0)


func test_wobble_animation_changes_y_position() -> void:
	var anim := _make_animator()
	var target := _make_target(Vector3(0, 1.0, 0))
	anim.register(target, "wobble_animation", {"amplitude": 0.5, "rate": 2.0})
	# Advance 0.4 seconds total so sin(0.8) ≈ 0.717 * 0.5 ≈ 0.36
	anim._process(0.4)
	assert_float(target.position.y).is_not_equal(1.0)
	assert_float(absf(target.position.y - 1.0)).is_less_equal(0.55)


func test_color_shift_mutates_albedo() -> void:
	var anim := _make_animator()
	var target := _make_target()
	var original: Color = (target.material_override as StandardMaterial3D).albedo_color
	anim.register(target, "color_shift", {"hue_speed": 1.0, "saturation": 0.9})
	anim._process(0.3)
	var new_color: Color = (target.material_override as StandardMaterial3D).albedo_color
	assert_float(new_color.h).is_not_equal(original.h)


func test_entry_pruned_when_target_freed() -> void:
	var anim := _make_animator()
	var target: MeshInstance3D = MeshInstance3D.new()
	add_child(target)
	anim.register(target, "wobble_animation", {})
	assert_int(anim._entries.size()).is_equal(1)
	target.queue_free()
	await get_tree().process_frame
	anim._process(0.1)
	assert_int(anim._entries.size()).is_equal(0)


func test_trailing_sparks_spawns_child_over_threshold() -> void:
	var anim := _make_animator()
	var parent: Node3D = auto_free(Node3D.new())
	add_child(parent)
	var target: MeshInstance3D = auto_free(MeshInstance3D.new())
	var sphere := SphereMesh.new()
	sphere.radius = 0.1
	target.mesh = sphere
	parent.add_child(target)
	var parent_count_before := parent.get_child_count()
	anim.register(target, "trailing_sparks", {"count": 2, "color": "#ff8822"})
	anim._process(0.2)  # exceeds 0.15 threshold
	assert_int(parent.get_child_count()).is_greater(parent_count_before)


func test_clear_removes_all_entries() -> void:
	var anim := _make_animator()
	var t1 := _make_target()
	var t2 := _make_target()
	anim.register(t1, "wobble_animation", {})
	anim.register(t2, "color_shift", {})
	assert_int(anim._entries.size()).is_equal(2)
	anim.clear()
	assert_int(anim._entries.size()).is_equal(0)


func test_flair_visualizer_registers_animated_types() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var anim := _make_animator()
	var flair := [
		{"type": "wobble_animation", "amplitude": 0.05, "rate": 3.0, "color": "#ff88aa"},
		{"type": "color_shift", "hue_speed": 0.3, "color": "#8844ff"},
		{"type": "trailing_sparks", "count": 2, "color": "#ffd700"},
	]
	FLAIR_VIZ.attach_flair(visual, flair, 1.75, anim)
	# Three marker meshes created on the visual
	assert_int(visual.get_child_count()).is_equal(3)
	# Three entries registered with the animator
	assert_int(anim._entries.size()).is_equal(3)


func test_flair_visualizer_no_animator_still_creates_markers() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var flair := [
		{"type": "wobble_animation", "color": "#ff00ff"},
	]
	FLAIR_VIZ.attach_flair(visual, flair, 1.75, null)
	assert_int(visual.get_child_count()).is_equal(1)
