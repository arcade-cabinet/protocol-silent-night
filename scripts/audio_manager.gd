extends RefCounted

const PROCEDURAL_SFX := preload("res://scripts/procedural_sfx.gd")
const PROCEDURAL_MUSIC := preload("res://scripts/procedural_music.gd")
const AUDIO_3D_POOL := preload("res://scripts/audio_3d_pool.gd")
const DEFAULT_VOLUME_DB: float = -15.0
const MUSIC_VOLUME_DB: float = -20.0
const AMBIENT_VOLUME_DB: float = -24.0
const POOL_SIZE: int = 6
const BUS_NAMES: Array = ["Music", "SFX", "Ambient", "UI"]

var _host: Node = null
var _players: Array = []
var _next_player: int = 0
var _cache: Dictionary = {}
var _sfx: RefCounted = null
var _music_player: AudioStreamPlayer = null
var _music_crossfade: AudioStreamPlayer = null
var _ambient_player: AudioStreamPlayer = null
var _pool_3d: RefCounted = null
var _current_track: String = ""
var _current_intensity: String = ""


func attach(host: Node, save_manager: Node = null) -> void:
	_sfx = PROCEDURAL_SFX.new()
	_host = host
	_ensure_buses()
	_apply_saved_volumes(save_manager)
	_players.clear()
	_next_player = 0
	for _i in range(POOL_SIZE):
		var player := AudioStreamPlayer.new()
		player.volume_db = DEFAULT_VOLUME_DB
		player.bus = "SFX"
		host.add_child(player)
		_players.append(player)
	_music_player = AudioStreamPlayer.new()
	_music_player.volume_db = MUSIC_VOLUME_DB
	_music_player.bus = "Music"
	host.add_child(_music_player)
	_music_crossfade = AudioStreamPlayer.new()
	_music_crossfade.volume_db = -60.0
	_music_crossfade.bus = "Music"
	host.add_child(_music_crossfade)
	_ambient_player = AudioStreamPlayer.new()
	_ambient_player.volume_db = AMBIENT_VOLUME_DB
	_ambient_player.bus = "Ambient"
	host.add_child(_ambient_player)
	_pool_3d = AUDIO_3D_POOL.new()
	_pool_3d.attach(host)
	_build_cache()
	_cache["music_menu"] = PROCEDURAL_MUSIC.make_menu_loop()
	_cache["music_gameplay"] = PROCEDURAL_MUSIC.make_gameplay_loop()
	_cache["music_boss"] = PROCEDURAL_MUSIC.make_boss_loop()
	preload("res://scripts/audio_manager_ext.gd").seed_extended_cache(self)
	play_music("menu")


func play_3d(key: String, world_pos: Vector3, volume_db: float = 0.0) -> void: preload("res://scripts/audio_manager_ext.gd").play_3d(self, key, world_pos, volume_db)
func play_enemy_telegraph(enemy_type: String, world_pos: Vector3) -> void: preload("res://scripts/audio_manager_ext.gd").play_enemy_telegraph(self, enemy_type, world_pos)
func play_boss_sting() -> void: if _cache.has("boss_sting"): _play("boss_sting")
func play_ambient() -> void: preload("res://scripts/audio_manager_ext.gd").play_ambient(self)
func stop_ambient() -> void: preload("res://scripts/audio_manager_ext.gd").stop_ambient(self)
func set_music_intensity(level: String) -> void: preload("res://scripts/audio_manager_ext.gd").set_music_intensity(self, level)


static func _ensure_buses() -> void:
	for bus_name in BUS_NAMES:
		if AudioServer.get_bus_index(bus_name) >= 0:
			continue
		var idx: int = AudioServer.bus_count
		AudioServer.add_bus(idx)
		AudioServer.set_bus_name(idx, bus_name)
		AudioServer.set_bus_send(idx, "Master")


func _apply_saved_volumes(sm: Node) -> void:
	if sm == null or not sm.has_method("get_preference"):
		return
	var all_buses: Array = BUS_NAMES.duplicate()
	all_buses.append("Master")
	for bus_name in all_buses:
		var key: String = "bus_volume_%s" % String(bus_name).to_lower()
		var db: float = float(sm.get_preference(key, 0.0))
		var idx: int = AudioServer.get_bus_index(bus_name)
		if idx >= 0:
			AudioServer.set_bus_volume_db(idx, db)


func set_bus_volume(bus_name: String, db: float) -> void:
	var idx: int = AudioServer.get_bus_index(bus_name)
	if idx >= 0:
		AudioServer.set_bus_volume_db(idx, clampf(db, -60.0, 6.0))


func get_bus_volume(bus_name: String) -> float:
	var idx: int = AudioServer.get_bus_index(bus_name)
	return AudioServer.get_bus_volume_db(idx) if idx >= 0 else 0.0


func _build_cache() -> void:
	_cache["hit"] = _sfx.make_tone(1320.0, 0.06, 40.0)
	_cache["pickup"] = _sfx.make_chord([880.0, 1108.73, 1318.51], 0.22, 8.0)
	_cache["level_up"] = _sfx.make_chord([523.25, 659.25, 783.99], 0.9, 2.0)
	_cache["wave"] = _sfx.make_chord([130.81, 1046.50], 0.55, 3.5)
	_cache["damage"] = _sfx.make_sweep(220.0, 90.0, 0.18, 12.0)
	_cache["boss_roar"] = _sfx.make_sweep(260.0, 70.0, 0.85, 2.2)
	_cache["death"] = _sfx.make_chord([146.83, 155.56, 207.65], 0.9, 2.5)
	_cache["victory"] = _sfx.make_chord([523.25, 659.25, 783.99, 1046.50], 1.1, 1.8)
	_cache["menu_click"] = _sfx.make_tone(660.0, 0.05, 30.0)
	_cache["coal_spray"] = _sfx.make_noise_burst(0.28, 5.0, 0.45)
	_cache["coal_hurl"] = _sfx.make_whip(0.3)
	_cache["coal_poison"] = _sfx.make_bubble(0.6)
	_cache["coal_embers"] = _sfx.make_crackle(0.55)
	_cache["coal_backfire"] = _sfx.make_sweep(420.0, 80.0, 0.45, 5.0)
	_cache["coal_fortune"] = _sfx.make_chime_arp([659.25, 783.99, 987.77, 1318.51], 0.6)


func play_coal(kind: String) -> void:
	var key: String = "coal_%s" % kind
	if _cache.has(key):
		_play(key)


func play_shot(color_hex: String = "#ffffff") -> void:
	var pitch := _pitch_from_color(color_hex)
	var key := "shot_%d" % int(pitch * 100.0)
	if not _cache.has(key):
		_cache[key] = _sfx.make_sweep(880.0 * pitch, 180.0 * pitch, 0.14, 16.0)
	_play(key)


func play_hit() -> void: _play("hit")
func play_pickup() -> void: _play("pickup")
func play_level_up() -> void: _play("level_up")
func play_wave_banner() -> void: _play("wave")
func play_damage() -> void: _play("damage")
func play_boss_roar() -> void: _play("boss_roar")
func play_death() -> void: _play("death")
func play_victory() -> void: _play("victory")
func play_menu_click() -> void: _play("menu_click")


func _play(key: String) -> void:
	if _host == null or _players.is_empty():
		return
	if not _cache.has(key):
		return
	var stream: AudioStreamWAV = _cache[key]
	if stream == null:
		return
	var player: AudioStreamPlayer = _players[_next_player]
	_next_player = (_next_player + 1) % _players.size()
	player.stream = stream
	player.play()


func play_music(track: String) -> void:
	if track == _current_track:
		return
	_current_track = track
	var key := "music_%s" % track
	if _music_player == null or not _cache.has(key):
		return
	_music_player.stream = _cache[key]
	_music_player.play()

func stop_music() -> void:
	_current_track = ""
	if _music_player != null:
		_music_player.stop()

func _pitch_from_color(color_hex: String) -> float:
	if color_hex.is_empty():
		return 1.0
	var color := Color(color_hex)
	return 0.75 + color.h * 0.6
