extends GdUnitTestSuite

## Phase 5 widget tests. Each widget builds in a test-friendly
## Control root and exposes deterministic state for assertion.

const MINIMAP := preload("res://scripts/minimap_widget.gd")
const COMBO := preload("res://scripts/combo_counter.gd")
const THREAT := preload("res://scripts/threat_indicator.gd")
const DAMAGE_NUMBERS := preload("res://scripts/damage_numbers.gd")
const MAGNET_RING := preload("res://scripts/pickup_magnet_ring.gd")
const SETTINGS := preload("res://scripts/settings_menu.gd")
const PAUSE := preload("res://scripts/pause_menu.gd")
const RADAR := preload("res://scripts/stat_radar_chart.gd")


func _make_control() -> Control:
	var c: Control = auto_free(Control.new())
	c.size = Vector2(800, 600)
	add_child(c)
	return c


# Minimap

func test_minimap_build_returns_panel_and_canvas() -> void:
	var state: Dictionary = MINIMAP.build(_make_control())
	assert_object(state["panel"]).is_not_null()
	assert_object(state["canvas"]).is_not_null()


func test_minimap_refresh_stores_world_state() -> void:
	var state: Dictionary = MINIMAP.build(_make_control())
	var enemy_node: Node3D = auto_free(Node3D.new())
	enemy_node.position = Vector3(4, 0, 3)
	add_child(enemy_node)
	var enemies: Array = [{"node": enemy_node}]
	MINIMAP.refresh(state, Vector2(0, 0), enemies, [], null)
	var data: Dictionary = (state["canvas"] as Control).get_meta("minimap_state")
	assert_int(data["enemies"].size()).is_equal(1)


# Combo counter

func test_combo_register_kill_increments_and_tiers() -> void:
	var c: RefCounted = COMBO.new()
	for _i in range(16):
		c.register_kill()
	var result: Dictionary = c.get_state()
	assert_int(int(result["count"])).is_equal(16)
	assert_int(int(result["tier"])).is_equal(3)


func test_combo_resets_after_timeout() -> void:
	var c: RefCounted = COMBO.new()
	c.register_kill()
	c.register_kill()
	for _i in range(300):
		c.tick(0.02)
	var result: Dictionary = c.get_state()
	assert_int(int(result["count"])).is_equal(0)


func test_combo_tier_colors_distinct() -> void:
	var c0: Color = COMBO.tier_color(0)
	var c3: Color = COMBO.tier_color(3)
	assert_bool(c0 != c3).is_true()


# Threat indicator

func test_threat_indicator_hidden_when_boss_close() -> void:
	var state: Dictionary = THREAT.build(_make_control())
	THREAT.update(state, Vector3.ZERO, Vector3.ZERO, Vector2(800, 600), "red")
	var data: Dictionary = (state["canvas"] as Control).get_meta("indicator_state")
	assert_bool(bool(data["visible"])).is_false()


func test_threat_indicator_visible_when_boss_far() -> void:
	var state: Dictionary = THREAT.build(_make_control())
	THREAT.update(state, Vector3(30, 0, 30), Vector3.ZERO, Vector2(800, 600), "red")
	var data: Dictionary = (state["canvas"] as Control).get_meta("indicator_state")
	assert_bool(bool(data["visible"])).is_true()


# Damage number stacking

func test_damage_number_stacking_aggregates_same_target() -> void:
	var dn: RefCounted = DAMAGE_NUMBERS.new()
	var fx_root: Node3D = auto_free(Node3D.new())
	add_child(fx_root)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 7)
	dn.spawn(fx_root, Vector3.ZERO, 15.0, Color.WHITE, false, 7)
	dn.spawn(fx_root, Vector3.ZERO, 20.0, Color.WHITE, false, 7)
	# Only one Label3D should exist under fx_root (accumulated to 45)
	assert_int(fx_root.get_child_count()).is_equal(1)
	assert_int(dn._entries.size()).is_equal(1)
	assert_float(float(dn._entries[0]["accumulated"])).is_equal_approx(45.0, 0.01)


func test_damage_number_distinct_targets_spawn_separate() -> void:
	var dn: RefCounted = DAMAGE_NUMBERS.new()
	var fx_root: Node3D = auto_free(Node3D.new())
	add_child(fx_root)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 1)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 2)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 3)
	assert_int(fx_root.get_child_count()).is_equal(3)


# Pickup magnet ring

func test_magnet_ring_hidden_when_radius_equals_base() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var ring: MeshInstance3D = MAGNET_RING.build(root)
	MAGNET_RING.update(ring, Vector3.ZERO, 1.0, 1.0, 0.0)
	assert_bool(ring.visible).is_false()


func test_magnet_ring_visible_when_radius_greater() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var ring: MeshInstance3D = MAGNET_RING.build(root)
	MAGNET_RING.update(ring, Vector3.ZERO, 3.5, 1.0, 0.5)
	assert_bool(ring.visible).is_true()


# Settings + Pause menus

func test_settings_menu_builds_with_sliders_for_all_buses() -> void:
	var state: Dictionary = SETTINGS.build(_make_control(), null, null, Callable())
	var sliders: Dictionary = state["sliders"]
	for bus_name in ["Master", "Music", "SFX", "Ambient", "UI"]:
		assert_bool(sliders.has(bus_name)).is_true()


func test_pause_menu_builds_with_hidden_panel() -> void:
	var state: Dictionary = PAUSE.build(_make_control(), Callable(), Callable(), Callable(), Callable())
	var panel: PanelContainer = state["panel"]
	assert_bool(panel.visible).is_false()
	PAUSE.show(state)
	assert_bool(panel.visible).is_true()


# Stat radar chart

func test_stat_radar_chart_builds_and_updates() -> void:
	var canvas: Control = RADAR.build(_make_control())
	RADAR.update(canvas, {"hp": 120.0, "speed": 12.0, "damage": 14.0, "fire_rate": 0.22, "range": 15.0, "pierce": 1.0})
	var values: Dictionary = canvas.get_meta("radar_values", {})
	assert_int(values.size()).is_equal(6)
	assert_float(float(values["hp"])).is_greater(0.0)
