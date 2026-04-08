extends GdUnitTestSuite

const PARTICLE_EFFECTS := preload("res://scripts/particle_effects.gd")

var _particles: RefCounted
var _root: Node3D


func before_test() -> void:
	_particles = PARTICLE_EFFECTS.new()
	_root = Node3D.new()
	add_child(_root)


func after_test() -> void:
	if _particles != null:
		_particles.clear()
	if _root != null and is_instance_valid(_root):
		_root.queue_free()


func test_spawn_death_burst_creates_nodes() -> void:
	var before := _root.get_child_count()
	_particles.spawn_death_burst(_root, Vector3.ZERO, Color("ff617e"), 1.0)
	var after := _root.get_child_count()
	assert_int(after).is_greater(before)
	assert_int(_particles.active_count()).is_greater(10)


func test_update_removes_expired() -> void:
	_particles.spawn_death_burst(_root, Vector3.ZERO, Color("8cff8e"), 1.0)
	assert_int(_particles.active_count()).is_greater(0)
	# Drive update past the longest particle lifetime.
	for _i in range(40):
		_particles.update(0.1)
	assert_int(_particles.active_count()).is_equal(0)


func test_spawn_muzzle_flash_respects_direction() -> void:
	var origin := Vector3(0, 1, 0)
	var direction := Vector3(1, 0, 0)
	_particles.spawn_muzzle_flash(_root, origin, direction, Color("fff6c2"))
	assert_int(_particles.active_count()).is_greater(0)
	# Capture initial average x position of active particles, advance, and
	# verify the mean moved in the +X direction (respecting the flash vector).
	var initial_sum := 0.0
	for child in _root.get_children():
		if child is MeshInstance3D:
			initial_sum += (child as MeshInstance3D).position.x
	for _i in range(3):
		_particles.update(0.02)
	var later_sum := 0.0
	for child in _root.get_children():
		if child is MeshInstance3D and is_instance_valid(child):
			later_sum += (child as MeshInstance3D).position.x
	assert_float(later_sum).is_greater(initial_sum)


func test_spawn_pickup_sparkle_creates_rising_particles() -> void:
	_particles.spawn_pickup_sparkle(_root, Vector3.ZERO)
	assert_int(_particles.active_count()).is_equal(5)


func test_clear_removes_all_active_particles() -> void:
	_particles.spawn_death_burst(_root, Vector3.ZERO, Color.WHITE, 1.0)
	_particles.spawn_muzzle_flash(_root, Vector3.ZERO, Vector3.FORWARD, Color.WHITE)
	assert_int(_particles.active_count()).is_greater(0)
	_particles.clear()
	assert_int(_particles.active_count()).is_equal(0)
