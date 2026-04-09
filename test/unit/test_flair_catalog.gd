extends GdUnitTestSuite

const CATALOG := preload("res://scripts/flair_catalog.gd")
const SAVE := preload("res://scripts/save_manager.gd")


func _make_save() -> Node:
	var save = auto_free(SAVE.new())
	save.set_save_path_for_tests("user://gdunit_flair_test.json")
	save.reset_state_for_tests()
	save.load_state()
	return save


func test_baseline_pool_returned_for_null_save() -> void:
	var pool: Array = CATALOG.get_unlocked(null)
	assert_int(pool.size()).is_greater(0)
	for piece in pool:
		assert_str(String(piece.get("type", ""))).is_not_empty()


func test_zero_threshold_pieces_always_unlocked() -> void:
	var save: Node = _make_save()
	var pool: Array = CATALOG.get_unlocked(save)
	var has_orbiting := false
	for piece in pool:
		if String(piece.get("type", "")) == "orbiting_particle":
			has_orbiting = true
			break
	assert_bool(has_orbiting).is_true()


func test_high_threshold_pieces_locked_initially() -> void:
	var save: Node = _make_save()
	var pool: Array = CATALOG.get_unlocked(save)
	var has_halo := false
	for piece in pool:
		if String(piece.get("type", "")) == "halo_ring":
			has_halo = true
			break
	assert_bool(has_halo).is_false()


func test_kills_unlock_pulsing_glow_at_50() -> void:
	var save: Node = _make_save()
	save.record_kill(50)
	var pool: Array = CATALOG.get_unlocked(save)
	var has_pulsing := false
	for piece in pool:
		if String(piece.get("type", "")) == "pulsing_glow":
			has_pulsing = true
			break
	assert_bool(has_pulsing).is_true()


func test_campaign_clear_unlocks_frost_and_ember() -> void:
	var save: Node = _make_save()
	save.record_campaign_clear()
	var pool: Array = CATALOG.get_unlocked(save)
	var types: Array = []
	for piece in pool:
		types.append(String(piece.get("type", "")))
	assert_bool(types.has("frost_crystals")).is_true()
	assert_bool(types.has("ember_glow")).is_true()


func test_unlocked_pieces_match_gear_system_types() -> void:
	var save: Node = _make_save()
	for _i in range(20):
		save.record_kill()
		save.record_run_start()
		save.register_wave_reached(_i + 1)
	for _i in range(15):
		save.record_campaign_clear()
	var pool: Array = CATALOG.get_unlocked(save)
	for piece in pool:
		var type_str: String = String(piece.get("type", ""))
		assert_bool(type_str in GearSystem.VALID_FLAIR_TYPES).is_true()
