extends GdUnitTestSuite

const AUDIO_MANAGER := preload("res://scripts/audio_manager.gd")


func test_ensure_buses_creates_all_four() -> void:
	AUDIO_MANAGER._ensure_buses()
	for bus_name in ["Music", "SFX", "Ambient", "UI"]:
		assert_int(AudioServer.get_bus_index(bus_name)).is_greater_equal(0)


func test_ensure_buses_is_idempotent() -> void:
	AUDIO_MANAGER._ensure_buses()
	var first_count: int = AudioServer.bus_count
	AUDIO_MANAGER._ensure_buses()
	assert_int(AudioServer.bus_count).is_equal(first_count)


func test_set_bus_volume_clamps_to_safe_range() -> void:
	AUDIO_MANAGER._ensure_buses()
	var mgr: RefCounted = AUDIO_MANAGER.new()
	mgr.set_bus_volume("SFX", -80.0)
	assert_float(mgr.get_bus_volume("SFX")).is_greater_equal(-60.0)
	mgr.set_bus_volume("SFX", 20.0)
	assert_float(mgr.get_bus_volume("SFX")).is_less_equal(6.0)
	mgr.set_bus_volume("SFX", -12.0)
	assert_float(mgr.get_bus_volume("SFX")).is_equal_approx(-12.0, 0.01)
