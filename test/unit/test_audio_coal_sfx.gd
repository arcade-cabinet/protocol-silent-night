extends GdUnitTestSuite

const AUDIO_MANAGER := preload("res://scripts/audio_manager.gd")
const SFX := preload("res://scripts/procedural_sfx.gd")


func test_procedural_sfx_new_helpers_return_streams() -> void:
	var s: RefCounted = SFX.new()
	assert_object(s.make_whip(0.2)).is_not_null()
	assert_object(s.make_bubble(0.3)).is_not_null()
	assert_object(s.make_crackle(0.3)).is_not_null()
	assert_object(s.make_chime_arp([440.0, 554.37, 659.25], 0.4)).is_not_null()
	assert_object(s.make_noise_burst(0.2, 8.0, 0.5)).is_not_null()


func test_audio_manager_attach_caches_all_coal_sounds() -> void:
	var mgr: RefCounted = AUDIO_MANAGER.new()
	var host: Node = auto_free(Node.new())
	add_child(host)
	mgr.attach(host, null)
	for kind in ["spray", "hurl", "poison", "embers", "backfire", "fortune"]:
		assert_bool(mgr._cache.has("coal_%s" % kind)).is_true()


func test_play_coal_unknown_kind_is_noop() -> void:
	var mgr: RefCounted = AUDIO_MANAGER.new()
	var host: Node = auto_free(Node.new())
	add_child(host)
	mgr.attach(host, null)
	mgr.play_coal("not_a_kind")
	# no crash = pass
	assert_bool(true).is_true()
