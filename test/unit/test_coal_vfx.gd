extends GdUnitTestSuite

const COAL_VFX := preload("res://scripts/coal_vfx.gd")
const COAL_HELPERS := preload("res://scripts/particle_coal_helpers.gd")
const PARTICLES := preload("res://scripts/particle_effects.gd")


func _make_particles() -> RefCounted:
	return PARTICLES.new()


func _make_root() -> Node3D:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	return root


func test_color_for_kind_returns_known_palette() -> void:
	assert_object(COAL_VFX.color_for_kind("spray")).is_not_null()
	assert_object(COAL_VFX.color_for_kind("unknown")).is_not_null()


func test_spawn_for_effect_each_kind_produces_children() -> void:
	var particles: RefCounted = _make_particles()
	for kind in ["spray", "hurl", "poison", "embers", "backfire", "fortune"]:
		var root := _make_root()
		COAL_VFX.spawn_for_effect(particles, root, Vector3.ZERO, kind, Color(0, 0, 0, 0))
		assert_int(root.get_child_count()).is_greater(0)


func test_spawn_for_effect_null_particles_is_noop() -> void:
	var root := _make_root()
	COAL_VFX.spawn_for_effect(null, root, Vector3.ZERO, "spray", Color.WHITE)
	assert_int(root.get_child_count()).is_equal(0)


func test_spawn_for_effect_null_root_is_noop() -> void:
	var particles: RefCounted = _make_particles()
	COAL_VFX.spawn_for_effect(particles, null, Vector3.ZERO, "hurl", Color.WHITE)
	assert_int(particles.active_count()).is_equal(0)


func test_color_override_respected_when_alpha_positive() -> void:
	var particles: RefCounted = _make_particles()
	var root := _make_root()
	COAL_VFX.spawn_for_effect(particles, root, Vector3.ZERO, "spray", Color(0.5, 0.7, 0.2, 1.0))
	assert_int(root.get_child_count()).is_greater(0)
