extends GdUnitTestSuite

## Integration test for combat_resolver.update_pickups routing:
## xp / cookie / scroll pickups dispatch to the right callback.

const COMBAT := preload("res://scripts/combat_resolver.gd")
const MAT := preload("res://scripts/material_factory.gd")
const PIX := preload("res://scripts/pixel_art_renderer.gd")
const SCROLL := preload("res://scripts/scroll_pickup.gd")


var _xp_gained: int = 0
var _cookies_gained: int = 0
var _scroll_collected: String = ""


func _reset() -> void:
	_xp_gained = 0
	_cookies_gained = 0
	_scroll_collected = ""


func _on_gain_xp(amt: int) -> void:
	_xp_gained += amt


func _on_gain_cookies(amt: int) -> void:
	_cookies_gained += amt


func _on_gain_scroll(scroll_type: String) -> void:
	_scroll_collected = scroll_type


func _make_combat() -> RefCounted:
	var mat: RefCounted = MAT.new()
	var pix: RefCounted = PIX.new()
	return COMBAT.new(mat, pix)


func _make_player_at(world_pos: Vector3) -> Node3D:
	var player: Node3D = auto_free(Node3D.new())
	player.position = world_pos
	add_child(player)
	return player


func _base_config() -> Dictionary:
	return {"pickup_magnet_radius": 0.5, "pickup_auto_collect_radius": 0.5}


func test_scroll_pickup_routes_to_on_gain_scroll() -> void:
	_reset()
	var combat: RefCounted = _make_combat()
	var scroll: RefCounted = SCROLL.new(MAT.new(), PIX.new())
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	var pickups: Array = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 2
	scroll.spawn_scroll(pickup_root, pickups, Vector3.ZERO, rng)
	var player: Node3D = _make_player_at(Vector3.ZERO)
	combat.update_pickups(0.1, pickups, player, _base_config(), {"auto_collect": true},
		_on_gain_xp, null, null, _on_gain_cookies, _on_gain_scroll)
	assert_int(_xp_gained).is_equal(0)
	assert_int(_cookies_gained).is_equal(0)
	assert_bool(_scroll_collected == "nice" or _scroll_collected == "naughty").is_true()
	assert_int(pickups.size()).is_equal(0)


func test_cookie_pickup_routes_to_on_gain_cookies() -> void:
	_reset()
	var combat: RefCounted = _make_combat()
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	var pickups: Array = []
	combat.spawn_pickup(pickup_root, pickups, Vector3.ZERO, 5, "cookie")
	var player: Node3D = _make_player_at(Vector3.ZERO)
	combat.update_pickups(0.1, pickups, player, _base_config(), {"auto_collect": true},
		_on_gain_xp, null, null, _on_gain_cookies, _on_gain_scroll)
	assert_int(_cookies_gained).is_equal(5)
	assert_int(_xp_gained).is_equal(0)
	assert_str(_scroll_collected).is_empty()


func test_xp_pickup_routes_to_on_gain_xp() -> void:
	_reset()
	var combat: RefCounted = _make_combat()
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	var pickups: Array = []
	combat.spawn_pickup(pickup_root, pickups, Vector3.ZERO, 3)
	var player: Node3D = _make_player_at(Vector3.ZERO)
	combat.update_pickups(0.1, pickups, player, _base_config(), {"auto_collect": true},
		_on_gain_xp, null, null, _on_gain_cookies, _on_gain_scroll)
	assert_int(_xp_gained).is_equal(3)
	assert_int(_cookies_gained).is_equal(0)


func test_boss_on_kill_not_called_twice_when_two_projectiles_hit_same_frame() -> void:
	# Regression: without hp > 0.0 guard, two simultaneous projectiles could both
	# decrement boss hp to <=0 and fire on_boss_killed twice in one update_projectiles call.
	var combat: RefCounted = _make_combat()
	var proj_root: Node3D = auto_free(Node3D.new())
	add_child(proj_root)
	var fx_root: Node3D = auto_free(Node3D.new())
	add_child(fx_root)
	var pn1: MeshInstance3D = MeshInstance3D.new()
	pn1.position = Vector3.ZERO
	proj_root.add_child(pn1)
	var pn2: MeshInstance3D = MeshInstance3D.new()
	pn2.position = Vector3.ZERO
	proj_root.add_child(pn2)
	var projectiles: Array = [
		{"node": pn1, "direction": Vector3.ZERO, "hostile": false, "damage": 100.0, "pierce": 1, "speed": 0.0, "life": 1.0},
		{"node": pn2, "direction": Vector3.ZERO, "hostile": false, "damage": 100.0, "pierce": 1, "speed": 0.0, "life": 1.0},
	]
	var boss_node: Node3D = auto_free(Node3D.new())
	boss_node.position = Vector3.ZERO
	add_child(boss_node)
	var boss_ref: Dictionary = {"node": boss_node, "hp": 50.0, "max_hp": 100.0, "color": Color.RED}
	var boss_bar: ProgressBar = auto_free(ProgressBar.new())
	boss_bar.max_value = 100.0; boss_bar.value = 50.0
	add_child(boss_bar)
	var boss_panel: VBoxContainer = auto_free(VBoxContainer.new())
	add_child(boss_panel)
	var player: Node3D = auto_free(Node3D.new())
	player.position = Vector3(100.0, 0.0, 100.0)
	add_child(player)
	var kill_count: Array = [0]  # Array used as mutable ref across lambda boundary
	var on_killed := func() -> void: kill_count[0] += 1
	combat.update_projectiles(0.016, projectiles, [], boss_ref, player, [],
		boss_bar, boss_panel, Callable(), Callable(), on_killed, fx_root, [])
	assert_int(kill_count[0]).is_equal(1)


func test_scroll_pickup_hovers_before_magnet_range() -> void:
	_reset()
	var combat: RefCounted = _make_combat()
	var scroll: RefCounted = SCROLL.new(MAT.new(), PIX.new())
	var pickup_root: Node3D = auto_free(Node3D.new())
	add_child(pickup_root)
	var pickups: Array = []
	var rng := RandomNumberGenerator.new()
	rng.seed = 7
	var spawned: Dictionary = scroll.spawn_scroll(pickup_root, pickups, Vector3.ZERO, rng)
	var base_y: float = float(spawned["base_y"])
	var player: Node3D = _make_player_at(Vector3(20.0, 0.0, 0.0))
	combat.update_pickups(0.25, pickups, player, _base_config(), {},
		_on_gain_xp, null, null, _on_gain_cookies, _on_gain_scroll)
	assert_int(pickups.size()).is_equal(1)
	assert_float(absf(float(pickups[0]["node"].position.y) - base_y)).is_less_equal(0.13)
