extends GdUnitTestSuite

var _factory_script := preload("res://scripts/board_object_factory.gd")
var _material_factory_script := preload("res://scripts/material_factory.gd")
var _pixel_renderer_script := preload("res://scripts/pixel_art_renderer.gd")
var _scroll_pickup_script := preload("res://scripts/scroll_pickup.gd")
var _handler_script := preload("res://scripts/board_object_handler.gd")


func _make_factory() -> RefCounted:
	var mat: RefCounted = _material_factory_script.new()
	return _factory_script.new(mat)


func test_board_object_factory_creates_valid_node() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var objects: Array = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var obj: Dictionary = factory.spawn_board_object(root, objects, 18.0, rng)
	assert_int(objects.size()).is_equal(1)
	assert_bool(String(obj["type"]) in ["frozen_mailbox", "gift_cache", "chimney_vent"]).is_true()
	assert_float(obj["hp"]).is_greater(0.0)
	assert_object(obj["node"]).is_not_null()


func test_board_object_types_are_valid() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var objects: Array = []
	for i in range(20):
		var rng := RandomNumberGenerator.new()
		rng.seed = i
		factory.spawn_board_object(root, objects, 18.0, rng)
	for obj in objects:
		assert_bool(String(obj["type"]) in ["frozen_mailbox", "gift_cache", "chimney_vent"]).is_true()


func test_scroll_nice_naughty_ratio() -> void:
	var mat: RefCounted = _material_factory_script.new()
	var pix: RefCounted = _pixel_renderer_script.new()
	var scroll: RefCounted = _scroll_pickup_script.new(mat, pix)
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var pickups: Array = []
	var nice := 0
	var naughty := 0
	for i in range(200):
		var rng := RandomNumberGenerator.new()
		rng.seed = i
		var entry: Dictionary = scroll.spawn_scroll(root, pickups, Vector3.ZERO, rng)
		if entry["scroll_type"] == "nice":
			nice += 1
		else:
			naughty += 1
	assert_int(nice).is_greater(naughty)


func test_board_object_takes_damage_and_drops_scroll() -> void:
	var factory: RefCounted = _make_factory()
	var mat: RefCounted = _material_factory_script.new()
	var pix: RefCounted = _pixel_renderer_script.new()
	var scroll: RefCounted = _scroll_pickup_script.new(mat, pix)
	var handler: RefCounted = _handler_script.new(factory, scroll)
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	var objects: Array = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var obj: Dictionary = factory.spawn_board_object(root, objects, 18.0, rng)
	obj["hp"] = 0.0
	objects[0] = obj
	var pickups: Array = []
	var projectiles: Array = []
	handler.update_board_objects(projectiles, objects, pickup_root, pickups)
	assert_int(objects.size()).is_equal(0)
	assert_int(pickups.size()).is_equal(1)
	assert_str(pickups[0]["type"]).is_equal("scroll")
