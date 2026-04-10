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


func test_board_object_types_have_obj_type_meta() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	# Force-spawn one of each type using deterministic seeds
	var type_meta_found: Dictionary = {}
	for seed_val in range(200):
		var rng := RandomNumberGenerator.new()
		rng.seed = seed_val
		var objects: Array = []
		var obj: Dictionary = factory.spawn_board_object(root, objects, 18.0, rng)
		var meta: String = obj["node"].get_meta("obj_type", "")
		if meta != "":
			type_meta_found[meta] = true
		if type_meta_found.size() == 3:
			break
	assert_bool(type_meta_found.has("mailbox")).is_true()
	assert_bool(type_meta_found.has("gift_cache")).is_true()
	assert_bool(type_meta_found.has("chimney")).is_true()


func test_board_object_has_mesh_instance_child() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	for seed_val in range(10):
		var rng := RandomNumberGenerator.new()
		rng.seed = seed_val
		var objects: Array = []
		var obj: Dictionary = factory.spawn_board_object(root, objects, 18.0, rng)
		var node: Node3D = obj["node"]
		var has_mesh := false
		for child in node.get_children():
			if child is MeshInstance3D:
				has_mesh = true
				break
		assert_bool(has_mesh).is_true()


func test_each_board_object_type_meta_direct() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	for pair: Array in [
			["frozen_mailbox", "mailbox"],
			["gift_cache", "gift_cache"],
			["chimney_vent", "chimney"]]:
		var node: Node3D = auto_free(Node3D.new())
		add_child(node)
		factory._build_visual(node, pair[0])
		assert_str(node.get_meta("obj_type", "")).is_equal(pair[1])


func test_board_objects_have_health_bar() -> void:
	var factory: RefCounted = _make_factory()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var objects: Array = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var obj: Dictionary = factory.spawn_board_object(root, objects, 18.0, rng)
	assert_bool(obj.has("hp_bar")).is_true()
	assert_object(obj["hp_bar"]).is_not_null()


func test_projectile_pierce_written_back_after_hitting_board_object() -> void:
	# Regression: board_object_handler was decrementing projectile pierce but not
	# writing the dict back — surviving projectiles kept their original pierce count.
	var factory: RefCounted = _make_factory()
	var mat: RefCounted = _material_factory_script.new()
	var pix: RefCounted = _pixel_renderer_script.new()
	var scroll: RefCounted = _scroll_pickup_script.new(mat, pix)
	var handler: RefCounted = _handler_script.new(factory, scroll)
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var obj_node: Node3D = auto_free(Node3D.new())
	obj_node.position = Vector3.ZERO
	add_child(obj_node)
	var proj_node: MeshInstance3D = auto_free(MeshInstance3D.new())
	proj_node.position = Vector3(0.5, 0.0, 0.0)  # within 1.2 hit radius
	add_child(proj_node)
	var board_objects: Array = [{"node": obj_node, "hp": 100.0, "max_hp": 100.0}]
	var proj: Dictionary = {"node": proj_node, "hostile": false, "damage": 10.0, "pierce": 2}
	var projectiles: Array = [proj]
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	handler.update_board_objects(projectiles, board_objects, pickup_root, [])
	assert_int(projectiles.size()).is_equal(1)           # projectile survives (pierce=2→1)
	assert_int(int(projectiles[0]["pierce"])).is_equal(1) # pierce decremented and written back


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
