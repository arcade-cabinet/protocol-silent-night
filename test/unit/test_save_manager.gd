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
