extends GdUnitTestSuite

const ACTIVATOR := preload("res://scripts/coal_activator.gd")


class StubMain:
	extends Node
	var coal_queue: Array = []
	var enemies: Array = []
	var run_cookies: int = 0
	var player_node: Node3D
	var ui_mgr = null
	var update_ui_called: int = 0
	var damaged_self: float = 0.0
	var killed_indices: Array = []

	func _damage_player(amount: float) -> void:
		damaged_self += amount

	func _kill_enemy(idx: int) -> void:
		killed_indices.append(idx)

	func _update_ui() -> void:
		update_ui_called += 1


func _make_main_with_player(pos: Vector3 = Vector3.ZERO) -> StubMain:
	var m: StubMain = auto_free(StubMain.new())
	var node := Node3D.new()
	node.position = pos
	m.player_node = node
	auto_free(node)
	return m


func _make_enemy(pos: Vector3, hp: float = 50.0) -> Dictionary:
	var node := Node3D.new()
	node.position = pos
	auto_free(node)
	return {"node": node, "hp": hp, "color": Color.RED, "drop_xp": 1}


func test_invalid_index_is_noop() -> void:
	var m := _make_main_with_player()
	var act: RefCounted = ACTIVATOR.new()
	m.coal_queue = ["spray"]
	act.activate(m, 5)
	assert_int(m.coal_queue.size()).is_equal(1)


func test_fortune_adds_cookies_and_pops_queue() -> void:
	var m := _make_main_with_player()
	m.coal_queue = ["fortune"]
	var act: RefCounted = ACTIVATOR.new()
	act.rng.seed = 7
	act.activate(m, 0)
	assert_int(m.coal_queue.size()).is_equal(0)
	assert_int(m.run_cookies).is_greater(0)
	assert_int(m.update_ui_called).is_equal(1)


func test_spray_damages_enemies_in_radius() -> void:
	var m := _make_main_with_player()
	m.coal_queue = ["spray"]
	m.enemies = [
		_make_enemy(Vector3(1.0, 0.0, 0.0), 20.0),
		_make_enemy(Vector3(10.0, 0.0, 0.0), 50.0),
	]
	var act: RefCounted = ACTIVATOR.new()
	act.activate(m, 0)
	assert_float(float(m.enemies[0]["hp"])).is_less(20.0)
	assert_float(float(m.enemies[1]["hp"])).is_equal(50.0)


func test_backfire_damages_player_and_enemies() -> void:
	var m := _make_main_with_player()
	m.coal_queue = ["backfire"]
	m.enemies = [_make_enemy(Vector3(1.0, 0.0, 0.0), 100.0)]
	var act: RefCounted = ACTIVATOR.new()
	act.activate(m, 0)
	assert_float(m.damaged_self).is_greater(0.0)
	assert_float(float(m.enemies[0]["hp"])).is_less(100.0)


func test_hurl_targets_closest_enemy() -> void:
	var m := _make_main_with_player()
	m.coal_queue = ["hurl"]
	m.enemies = [
		_make_enemy(Vector3(8.0, 0.0, 0.0), 100.0),
		_make_enemy(Vector3(2.0, 0.0, 0.0), 100.0),
	]
	var act: RefCounted = ACTIVATOR.new()
	act.activate(m, 0)
	assert_int(m.killed_indices.size()).is_equal(1)
	assert_int(int(m.killed_indices[0])).is_equal(1)


func test_string_entry_supported_for_queue() -> void:
	var m := _make_main_with_player()
	m.coal_queue = ["fortune", "spray"]
	var act: RefCounted = ACTIVATOR.new()
	act.activate(m, 0)
	assert_int(m.coal_queue.size()).is_equal(1)
	assert_str(String(m.coal_queue[0])).is_equal("spray")
