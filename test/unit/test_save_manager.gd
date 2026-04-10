extends GdUnitTestSuite

var _save_script := preload("res://scripts/save_manager.gd")


func test_unlock_persists_to_disk() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_unlock_test.json")
	save.reset_state_for_tests()
	save.load_state()

	assert_bool(save.is_unlocked("elf")).is_true()
	assert_bool(save.is_unlocked("santa")).is_false()
	assert_bool(save.unlock("santa")).is_true()

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_unlock_test.json")
	reloaded.load_state()
	assert_bool(reloaded.is_unlocked("santa")).is_true()
	assert_int(int(reloaded.state["best_wave"])).is_equal(0)

	reloaded.reset_state_for_tests()


func test_register_wave_reached_tracks_best_wave() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_best_wave_test.json")
	save.reset_state_for_tests()
	save.load_state()

	save.register_wave_reached(3)
	save.register_wave_reached(2)
	save.register_wave_reached(7)

	assert_int(int(save.state["best_wave"])).is_equal(7)
	save.reset_state_for_tests()


func test_achievements_increment_and_persist() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_achievements_test.json")
	save.reset_state_for_tests()
	save.load_state()

	assert_int(save.get_achievement("total_kills")).is_equal(0)
	save.record_kill()
	save.record_kill()
	save.record_kill(5)
	assert_int(save.get_achievement("total_kills")).is_equal(7)

	save.record_run_start()
	save.record_campaign_clear()
	assert_int(save.get_achievement("total_runs")).is_equal(1)
	assert_int(save.get_achievement("campaign_clears")).is_equal(1)

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_achievements_test.json")
	reloaded.load_state()
	assert_int(reloaded.get_achievement("total_kills")).is_equal(7)

	reloaded.reset_state_for_tests()


func test_coal_queue_persists_across_reload() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_coal_test.json")
	save.reset_state_for_tests()
	save.load_state()

	assert_array(save.get_coal()).is_empty()
	save.set_coal(["fortune", "spray", "hurl"])

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_coal_test.json")
	reloaded.load_state()
	var loaded: Array = reloaded.get_coal()
	assert_int(loaded.size()).is_equal(3)
	assert_str(String(loaded[0])).is_equal("fortune")

	reloaded.set_coal([])
	assert_array(reloaded.get_coal()).is_empty()
	reloaded.reset_state_for_tests()


func test_equipped_gear_persists_across_reload() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_gear_persist_test.json")
	save.reset_state_for_tests()
	save.load_state()

	assert_dict(save.get_equipped_gear()).is_empty()
	save.set_equipped_gear({
		"weapon_mod": {"id": "w1", "name": "Test", "slot": "weapon_mod", "rarity": 2, "stats": {"damage_mult": 0.07}, "flair": [], "flavor": "t"},
		"tag_charm": {},
	})

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_gear_persist_test.json")
	reloaded.load_state()
	var loaded: Dictionary = reloaded.get_equipped_gear()
	assert_bool(loaded.has("weapon_mod")).is_true()
	var weapon: Dictionary = loaded["weapon_mod"]
	assert_str(String(weapon.get("name", ""))).is_equal("Test")
	reloaded.reset_state_for_tests()


func test_register_level_reached_tracks_best_level() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_best_level_test.json")
	save.reset_state_for_tests()
	save.load_state()

	assert_int(int(save.state.get("best_level", 0))).is_equal(0)
	save.register_level_reached(5)
	save.register_level_reached(3)
	save.register_level_reached(12)
	save.register_level_reached(9)
	assert_int(int(save.state["best_level"])).is_equal(12)

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_best_level_test.json")
	reloaded.load_state()
	assert_int(int(reloaded.state["best_level"])).is_equal(12)
	reloaded.reset_state_for_tests()


func test_merge_dict_rejects_unknown_top_level_keys() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_merge_injection_test.json")
	save.reset_state_for_tests()

	# Simulate a tampered save with an injected top-level key.
	var tampered_json := JSON.stringify({
		"unlocked": {"elf": true, "santa": true},
		"best_wave": 7,
		"best_level": 3,
		"injected_root_key": "malicious_value",
		"achievements": {"total_kills": 1, "total_runs": 1, "total_waves_cleared": 1, "campaign_clears": 0},
		"preferences": {"difficulty_tier": 1, "permadeath": false, "last_present": "holly_striker"},
		"cookies": 0,
		"coal": [],
		"gear_inventory": [],
		"equipped_gear": {},
	})
	var file := FileAccess.open(save.save_path, FileAccess.WRITE)
	file.store_string(tampered_json)
	file = null

	save.load_state()
	assert_bool(save.state.has("injected_root_key")).is_false()
	assert_bool(save.is_unlocked("santa")).is_true()
	assert_int(int(save.state["best_wave"])).is_equal(7)
	save.reset_state_for_tests()

func test_record_run_start_increments() -> void:
	var sm = preload("res://scripts/save_manager.gd").new()
	sm.set_save_path_for_tests("user://test_save_manager.json")
	sm.reset_state_for_tests()
	sm.record_run_start()
	assert_int(sm.get_achievement("total_runs")).is_equal(1)

func test_record_campaign_clear_increments() -> void:
	var sm = preload("res://scripts/save_manager.gd").new()
	sm.set_save_path_for_tests("user://test_save_manager.json")
	sm.reset_state_for_tests()
	sm.record_campaign_clear()
	assert_int(sm.get_achievement("campaign_clears")).is_equal(1)
