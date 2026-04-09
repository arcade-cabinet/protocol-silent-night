extends RefCounted

## Extension helpers for audio_manager.gd. Holds the larger methods
## (spatial playback, ambient layer, music intensity) so the main
## manager stays under the 200 LOC hook budget. Static methods that
## take the manager as first arg and mutate its members.


static func play_3d(mgr: RefCounted, key: String, world_pos: Vector3, volume_db: float = 0.0) -> void:
	if mgr._pool_3d == null or not mgr._cache.has(key):
		return
	mgr._pool_3d.play_at(mgr._cache[key], world_pos, volume_db)


static func play_enemy_telegraph(mgr: RefCounted, enemy_type: String, world_pos: Vector3) -> void:
	var key: String = "enemy_telegraph_%s" % enemy_type
	if mgr._cache.has(key):
		play_3d(mgr, key, world_pos, -6.0)


static func play_ambient(mgr: RefCounted) -> void:
	if mgr._ambient_player == null or not mgr._cache.has("ambient_bed"):
		return
	mgr._ambient_player.stream = mgr._cache["ambient_bed"]
	mgr._ambient_player.play()


static func stop_ambient(mgr: RefCounted) -> void:
	if mgr._ambient_player != null:
		mgr._ambient_player.stop()


static func set_music_intensity(mgr: RefCounted, level: String) -> void:
	if level == mgr._current_intensity:
		return
	mgr._current_intensity = level
	var key: String = "music_%s" % level
	if not mgr._cache.has(key) or mgr._music_player == null:
		return
	if mgr._music_crossfade == null:
		mgr._music_player.stream = mgr._cache[key]
		mgr._music_player.play()
		return
	# Swap roles: incoming track on crossfade player, tween volumes.
	mgr._music_crossfade.stream = mgr._cache[key]
	mgr._music_crossfade.volume_db = -60.0
	mgr._music_crossfade.play()
	var tween: Tween = mgr._music_player.create_tween().set_parallel(true)
	tween.tween_property(mgr._music_player, "volume_db", -60.0, 0.8)
	tween.tween_property(mgr._music_crossfade, "volume_db", -20.0, 0.8)
	tween.chain().tween_callback(func() -> void:
		mgr._music_player.stop()
		var tmp: AudioStreamPlayer = mgr._music_player
		mgr._music_player = mgr._music_crossfade
		mgr._music_crossfade = tmp
	)


static func seed_extended_cache(mgr: RefCounted) -> void:
	var sfx: RefCounted = mgr._sfx
	var music: Variant = preload("res://scripts/procedural_music.gd")
	mgr._cache["music_calm"] = music.make_calm_loop()
	mgr._cache["music_panic"] = music.make_panic_loop()
	mgr._cache["ambient_bed"] = music.make_ambient_bed(20.0)
	mgr._cache["enemy_telegraph_grunt"] = sfx.make_tone(260.0, 0.14, 18.0)
	mgr._cache["enemy_telegraph_rusher"] = sfx.make_tone(880.0, 0.05, 35.0)
	mgr._cache["enemy_telegraph_tank"] = sfx.make_sweep(140.0, 90.0, 0.22, 8.0)
	mgr._cache["enemy_telegraph_krampus"] = sfx.make_sweep(320.0, 120.0, 0.35, 4.0)
	mgr._cache["boss_sting"] = sfx.make_chord([55.0, 82.5, 110.0], 0.6, 2.8)
