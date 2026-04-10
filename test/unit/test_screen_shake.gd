extends GdUnitTestSuite

const SHAKE := preload("res://scripts/screen_shake.gd")


func test_add_trauma_increases_state() -> void:
	var shake: RefCounted = SHAKE.new()
	shake.add_trauma(0.5)
	assert_float(shake.trauma).is_equal_approx(0.5, 0.001)


func test_update_decays_trauma_to_zero() -> void:
	var shake: RefCounted = SHAKE.new()
	shake.add_trauma(1.0)
	var cam: Camera3D = auto_free(Camera3D.new())
	add_child(cam)
	for _i in range(60):
		shake.update(0.02, cam)
	assert_float(shake.trauma).is_less_equal(0.01)


func test_trauma_capped_at_max() -> void:
	var shake: RefCounted = SHAKE.new()
	shake.add_trauma(5.0)
	assert_float(shake.trauma).is_less_equal(1.0)


func test_reduced_motion_blocks_trauma() -> void:
	var shake: RefCounted = SHAKE.new()
	shake.configure(true)
	shake.add_trauma(0.8)
	assert_float(shake.trauma).is_equal(0.0)


func test_update_with_null_camera_is_noop() -> void:
	var shake: RefCounted = SHAKE.new()
	shake.add_trauma(0.3)
	shake.update(0.016, null)
	# Should not crash; trauma decay does not happen without camera
	assert_float(shake.trauma).is_equal_approx(0.3, 0.001)


func test_base_offset_captured_from_camera_on_first_update() -> void:
	var shake: RefCounted = SHAKE.new()
	var cam: Camera3D = auto_free(Camera3D.new())
	add_child(cam)
	cam.h_offset = 0.25
	cam.v_offset = -0.1
	# No trauma — first update should capture base and restore it.
	shake.update(0.016, cam)
	assert_float(shake._base_offset.x).is_equal_approx(0.25, 0.001)
	assert_float(shake._base_offset.y).is_equal_approx(-0.1, 0.001)
	# After trauma decays, offsets should return to captured base, not zero.
	shake.add_trauma(1.0)
	for _i in range(80):
		shake.update(0.02, cam)
	assert_float(cam.h_offset).is_equal_approx(0.25, 0.05)
	assert_float(cam.v_offset).is_equal_approx(-0.1, 0.05)
