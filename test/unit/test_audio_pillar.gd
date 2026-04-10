extends GdUnitTestSuite

## Integration tests for the audio pillar (Tasks 7, 9, 10, 19, 20).

const AUDIO_MANAGER := preload("res://scripts/audio_manager.gd")
const AUDIO_3D_POOL := preload("res://scripts/audio_3d_pool.gd")
const MUSIC_DIRECTOR := preload("res://scripts/music_director.gd")
const PROCEDURAL_MUSIC := preload("res://scripts/procedural_music.gd")


func _attached_mgr() -> RefCounted:
	var mgr: RefCounted = AUDIO_MANAGER.new()
	var host: Node = auto_free(Node.new())
	add_child(host)
	mgr.attach(host, null)
	return mgr


func test_audio_3d_pool_attaches_and_plays() -> void:
	var pool: RefCounted = AUDIO_3D_POOL.new()
	var host: Node = auto_free(Node.new())
	add_child(host)
	pool.attach(host)
	assert_int(host.get_child_count()).is_equal(16)
	assert_int(pool.active_count()).is_equal(0)


func test_ambient_bed_cached_and_playable() -> void:
	var mgr: RefCounted = _attached_mgr()
	assert_bool(mgr._cache.has("ambient_bed")).is_true()
	mgr.play_ambient()
	# no crash + stream assigned
	assert_object(mgr._ambient_player.stream).is_not_null()


func test_stop_ambient_does_not_crash() -> void:
	var mgr: RefCounted = _attached_mgr()
	mgr.play_ambient()
	mgr.stop_ambient()
	assert_bool(true).is_true()


func test_music_director_selects_panic_on_high_enemy_count() -> void:
	var level: String = MUSIC_DIRECTOR._select_level(30, 0.9, false)
	assert_str(level).is_equal("panic")


func test_music_director_selects_calm_on_low_threat() -> void:
	var level: String = MUSIC_DIRECTOR._select_level(3, 0.9, false)
	assert_str(level).is_equal("calm")


func test_music_director_boss_overrides_everything() -> void:
	var level: String = MUSIC_DIRECTOR._select_level(0, 1.0, true)
	assert_str(level).is_equal("boss")


func test_music_director_panic_on_low_hp() -> void:
	var level: String = MUSIC_DIRECTOR._select_level(5, 0.15, false)
	assert_str(level).is_equal("panic")


func test_music_director_tick_applies_intensity() -> void:
	var mgr: RefCounted = _attached_mgr()
	var dir: RefCounted = MUSIC_DIRECTOR.new()
	dir.tick(0.1, mgr, 30, 0.2, false)
	assert_str(String(mgr._current_intensity)).is_equal("panic")


func test_enemy_telegraph_cache_entries_exist() -> void:
	var mgr: RefCounted = _attached_mgr()
	for enemy_type in ["grunt", "rusher", "tank", "krampus"]:
		assert_bool(mgr._cache.has("enemy_telegraph_%s" % enemy_type)).is_true()


func test_play_enemy_telegraph_does_not_crash_unknown_type() -> void:
	var mgr: RefCounted = _attached_mgr()
	mgr.play_enemy_telegraph("nonexistent", Vector3.ZERO)
	assert_bool(true).is_true()


func test_boss_sting_cache_present() -> void:
	var mgr: RefCounted = _attached_mgr()
	assert_bool(mgr._cache.has("boss_sting")).is_true()
	mgr.play_boss_sting()
	assert_bool(true).is_true()


func test_procedural_music_ambient_returns_stream() -> void:
	var stream: AudioStreamWAV = PROCEDURAL_MUSIC.make_ambient_bed(3.0)
	assert_object(stream).is_not_null()
	assert_int(stream.data.size()).is_greater(0)
