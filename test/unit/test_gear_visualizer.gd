extends GdUnitTestSuite

const VIZ := preload("res://scripts/gear_visualizer.gd")
const FLAIR_VIZ := preload("res://scripts/gear_flair_visualizer.gd")


func _make_gear_sys() -> GearSystem:
	return GearSystem.new()


func _valid_item(slot: String, rarity: int = 1, flair: Array = []) -> Dictionary:
	return {
		"id": "test_%s_%d" % [slot, rarity],
		"name": "Test %s" % slot,
		"slot": slot,
		"rarity": rarity,
		"stats": {"damage_mult": 0.05},
		"flair": flair,
		"flavor": "test flavor",
		"color": "#ff8822",
	}


func test_attach_with_null_gear_system_is_noop() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	VIZ.attach(visual, null)
	assert_int(visual.get_child_count()).is_equal(0)


func test_attach_with_empty_equipped_adds_nothing() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	VIZ.attach(visual, _make_gear_sys())
	assert_int(visual.get_child_count()).is_equal(0)


func test_attach_weapon_mod_creates_gear_node() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var gs := _make_gear_sys()
	gs.equip(_valid_item("weapon_mod"))
	VIZ.attach(visual, gs)
	assert_int(visual.get_child_count()).is_equal(1)
	assert_str(visual.get_child(0).name).is_equal("Gear_weapon_mod")
	assert_int(visual.get_child(0).get_child_count()).is_equal(1)


func test_attach_all_four_slots() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var gs := _make_gear_sys()
	for slot in GearSystem.SLOTS:
		gs.equip(_valid_item(slot, 2))
	VIZ.attach(visual, gs)
	assert_int(visual.get_child_count()).is_equal(GearSystem.SLOTS.size())


func test_attach_legendary_with_flair_adds_extra_visuals() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var gs := _make_gear_sys()
	var flair := [
		{"type": "orbiting_particle", "count": 3, "radius": 0.6, "color": "#88ddff"},
		{"type": "halo_ring", "radius": 0.9, "color": "#ffd700"},
	]
	gs.equip(_valid_item("bow_accessory", 5, flair))
	VIZ.attach(visual, gs)
	# One Gear_ node + 3 orbit spheres + 1 halo = 5 direct children
	assert_int(visual.get_child_count()).is_equal(5)


func test_flair_visualizer_unknown_type_is_ignored() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	FLAIR_VIZ.attach_flair(visual, [{"type": "does_not_exist", "color": "#ffffff"}])
	assert_int(visual.get_child_count()).is_equal(0)


func test_flair_visualizer_non_dict_entries_skipped() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	FLAIR_VIZ.attach_flair(visual, ["not_a_dict", 42, null])
	assert_int(visual.get_child_count()).is_equal(0)


func test_flair_visualizer_multiple_types_stack() -> void:
	var visual: Node3D = auto_free(Node3D.new())
	add_child(visual)
	var flair := [
		{"type": "frost_crystals", "count": 3, "color": "#ccf0ff"},
		{"type": "ember_glow", "color": "#ff6622"},
		{"type": "sparkle_burst", "count": 4, "color": "#ffd700"},
	]
	FLAIR_VIZ.attach_flair(visual, flair)
	# 3 frost + 1 ember + 4 sparkle = 8 children
	assert_int(visual.get_child_count()).is_equal(8)
