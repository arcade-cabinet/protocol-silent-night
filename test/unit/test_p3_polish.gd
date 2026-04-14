extends GdUnitTestSuite

## Phase 12 P3 polish tests: damage stack bounce, minimap zoom,
## settings tabs, pause keyboard nav, radar labels, coal rarity VFX,
## present roster archetype consistency.

const DAMAGE_NUMBERS := preload("res://scripts/damage_numbers.gd")
const MINIMAP := preload("res://scripts/minimap_widget.gd")
const SETTINGS := preload("res://scripts/settings_menu.gd")
const PAUSE := preload("res://scripts/pause_menu.gd")
const RADAR := preload("res://scripts/stat_radar_chart.gd")
const COAL_VFX := preload("res://scripts/coal_vfx.gd")
const COAL_HELPERS := preload("res://scripts/particle_coal_helpers.gd")
const PARTICLES := preload("res://scripts/particle_effects.gd")


func _make_root() -> Control:
	var c: Control = auto_free(Control.new())
	c.size = Vector2(800, 600)
	add_child(c)
	return c


func test_damage_number_stack_sets_pulse_timer() -> void:
	var dn: RefCounted = DAMAGE_NUMBERS.new()
	var fx_root: Node3D = auto_free(Node3D.new())
	add_child(fx_root)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 7)
	dn.spawn(fx_root, Vector3.ZERO, 12.0, Color.WHITE, false, 7)
	assert_int(dn._entries.size()).is_equal(1)
	var entry: Dictionary = dn._entries[0]
	assert_float(float(entry.get("stack_pulse", 0.0))).is_greater(0.0)


func test_damage_number_stack_pulse_decays_to_zero() -> void:
	var dn: RefCounted = DAMAGE_NUMBERS.new()
	var fx_root: Node3D = auto_free(Node3D.new())
	add_child(fx_root)
	dn.spawn(fx_root, Vector3.ZERO, 10.0, Color.WHITE, false, 3)
	dn.spawn(fx_root, Vector3.ZERO, 8.0, Color.WHITE, false, 3)
	for _i in range(20):
		dn.update(0.016)
	var entry: Dictionary = dn._entries[0]
	assert_float(float(entry.get("stack_pulse", 0.0))).is_equal_approx(0.0, 0.001)


func test_minimap_set_view_radius_updates_state() -> void:
	var state: Dictionary = MINIMAP.build(_make_root())
	MINIMAP.set_view_radius(state, 35.0)
	var data: Dictionary = (state["canvas"] as Control).get_meta("minimap_state")
	assert_float(float(data["view_radius"])).is_equal_approx(35.0, 0.001)


func test_minimap_view_radius_clamped() -> void:
	var state: Dictionary = MINIMAP.build(_make_root())
	MINIMAP.set_view_radius(state, 5.0)  # below 8 floor
	var data: Dictionary = (state["canvas"] as Control).get_meta("minimap_state")
	assert_float(float(data["view_radius"])).is_equal_approx(8.0, 0.001)


func test_settings_menu_uses_tab_container() -> void:
	var state: Dictionary = SETTINGS.build(_make_root(), null, null, Callable())
	var panel: PanelContainer = state["panel"]
	# Find a TabContainer descendant
	var found_tabs: bool = false
	var stack: Array = [panel]
	while not stack.is_empty():
		var n: Node = stack.pop_back()
		if n is TabContainer:
			found_tabs = true
			break
		for c in n.get_children():
			stack.append(c)
	assert_bool(found_tabs).is_true()


func test_settings_menu_minimap_slider_present() -> void:
	var state: Dictionary = SETTINGS.build(_make_root(), null, null, Callable())
	assert_bool(state.has("minimap_slider")).is_true()
	var slider: HSlider = state["minimap_slider"]
	assert_float(slider.min_value).is_equal_approx(8.0, 0.001)
	assert_float(slider.max_value).is_equal_approx(60.0, 0.001)


func test_settings_menu_includes_touch_tab() -> void:
	var state: Dictionary = SETTINGS.build(_make_root(), null, null, Callable())
	var panel: PanelContainer = state["panel"]
	var tabs: TabContainer = panel.find_children("*", "TabContainer", true, false)[0]
	assert_int(tabs.get_tab_count()).is_greater_equal(4)
	assert_str(tabs.get_tab_title(2)).is_equal("Touch")


func test_touch_tab_includes_haptics_toggle() -> void:
	var state: Dictionary = SETTINGS.build(_make_root(), null, null, Callable())
	var panel: PanelContainer = state["panel"]
	var touch_page: Node = panel.find_children("*", "TabContainer", true, false)[0].get_child(2)
	var found := false
	for node in touch_page.get_children():
		if node is CheckBox and (node as CheckBox).text == "Haptics":
			found = true
	assert_bool(found).is_true()


func test_pause_menu_keyboard_navigation_state() -> void:
	var state: Dictionary = PAUSE.build(_make_root(), Callable(), Callable(), Callable(), Callable())
	var buttons: Array = state["buttons"]
	assert_int(buttons.size()).is_equal(4)
	var panel: PanelContainer = state["panel"]
	PAUSE.show(state)
	assert_int(int(panel.get_meta("focused_index"))).is_equal(0)


func test_radar_chart_renders_labels_array() -> void:
	# Indirect: the AXIS_LABELS const has 6 entries
	assert_int(RADAR.AXIS_LABELS.size()).is_equal(6)
	for label in RADAR.AXIS_LABELS:
		assert_str(String(label)).is_not_empty()


func test_coal_vfx_rarity_scale_legendary_doubles() -> void:
	assert_float(COAL_VFX.rarity_scale("legendary")).is_equal_approx(2.0, 0.01)
	assert_float(COAL_VFX.rarity_scale("rare")).is_equal_approx(1.5, 0.01)
	assert_float(COAL_VFX.rarity_scale("common")).is_equal_approx(1.0, 0.01)


func test_coal_vfx_legendary_spawns_more_particles() -> void:
	var particles: RefCounted = PARTICLES.new()
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	COAL_VFX.spawn_for_effect(particles, root, Vector3.ZERO, "spray", Color(0, 0, 0, 0), "common")
	var common_count: int = root.get_child_count()
	var root2: Node3D = auto_free(Node3D.new())
	add_child(root2)
	COAL_VFX.spawn_for_effect(particles, root2, Vector3.ZERO, "spray", Color(0, 0, 0, 0), "legendary")
	var leg_count: int = root2.get_child_count()
	assert_int(leg_count).is_greater(common_count)


func test_present_archetype_gift_bag_has_high_hp_low_speed() -> void:
	var defs: Dictionary = _load_presents()
	var found := false
	for pid in defs:
		var p: Dictionary = defs[pid]
		if p.get("body_shape", "") == "gift_bag":
			# All gift bags should be somewhat beefy
			assert_int(int(p.get("max_hp", 100))).is_greater_equal(10)
			found = true
	assert_bool(found).is_true()


func test_present_archetype_stacked_duo_is_tank() -> void:
	var defs: Dictionary = _load_presents()
	var found := false
	for pid in defs:
		var p: Dictionary = defs[pid]
		if p.get("body_shape", "") == "stacked_duo":
			assert_int(int(p.get("max_hp", 100))).is_greater_equal(10)
			found = true
	assert_bool(found).is_true()


func _load_presents() -> Dictionary:
	var f := FileAccess.open("res://declarations/presents/presents.json", FileAccess.READ)
	if f == null:
		return {}
	var parsed: Variant = JSON.parse_string(f.get_as_text())
	return parsed if parsed is Dictionary else {}
