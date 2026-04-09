extends RefCounted

const PROCEDURAL_SFX := preload("res://scripts/procedural_sfx.gd")
const PROCEDURAL_MUSIC := preload("res://scripts/procedural_music.gd")
const DEFAULT_VOLUME_DB: float = -15.0
const MUSIC_VOLUME_DB: float = -20.0
const POOL_SIZE: int = 6

var _host: Node = null
var _players: Array = []
var _next_player: int = 0
var _cache: Dictionary = {}
var _sfx: RefCounted = null
var _music_player: AudioStreamPlayer = null
var _current_track: String = ""


func attach(host: Node) -> void:
	_sfx = PROCEDURAL_SFX.new()
	_host = host
	_players.clear()
	_next_player = 0
	for _i in range(POOL_SIZE):
		var player := AudioStreamPlayer.new()
		player.volume_db = DEFAULT_VOLUME_DB
		player.bus = "Master"
		host.add_child(player)
		_players.append(player)
	_music_player = AudioStreamPlayer.new()
	_music_player.volume_db = MUSIC_VOLUME_DB
	_music_player.bus = "Master"
	host.add_child(_music_player)
	_build_cache()
	_cache["music_menu"] = PROCEDURAL_MUSIC.make_menu_loop()
	_cache["music_gameplay"] = PROCEDURAL_MUSIC.make_gameplay_loop()
	_cache["music_boss"] = PROCEDURAL_MUSIC.make_boss_loop()
	play_music("menu")


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
