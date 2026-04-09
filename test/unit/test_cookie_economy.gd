extends GdUnitTestSuite

var _save_script := preload("res://scripts/save_manager.gd")


func test_default_state_has_cookies_field() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_default.json")
	save.reset_state_for_tests()
	save.load_state()
	assert_int(save.get_cookies()).is_equal(0)
	save.reset_state_for_tests()


func test_add_cookies_increments_state() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_add.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(50)
	save.add_cookies(25)
	assert_int(save.get_cookies()).is_equal(75)
	save.reset_state_for_tests()


func test_spend_cookies_deducts_when_sufficient() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_spend.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(100)
	assert_bool(save.spend_cookies(30)).is_true()
	assert_int(save.get_cookies()).is_equal(70)
	save.reset_state_for_tests()


func test_spend_cookies_returns_false_when_insufficient() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_insuff.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(10)
	assert_bool(save.spend_cookies(50)).is_false()
	assert_int(save.get_cookies()).is_equal(10)
	save.reset_state_for_tests()


func test_add_cookies_rejects_negative() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_neg_add.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(100)
	save.add_cookies(-50)
	assert_int(save.get_cookies()).is_equal(100)
	save.reset_state_for_tests()


func test_spend_cookies_rejects_negative() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_neg_spend.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(100)
	assert_bool(save.spend_cookies(-30)).is_false()
	assert_int(save.get_cookies()).is_equal(100)
	save.reset_state_for_tests()


func test_cookies_persist_across_load() -> void:
	var save = auto_free(_save_script.new())
	save.set_save_path_for_tests("user://gdunit_cookie_persist.json")
	save.reset_state_for_tests()
	save.load_state()
	save.add_cookies(42)

	var reloaded = auto_free(_save_script.new())
	reloaded.set_save_path_for_tests("user://gdunit_cookie_persist.json")
	reloaded.load_state()
	assert_int(reloaded.get_cookies()).is_equal(42)
	reloaded.reset_state_for_tests()
