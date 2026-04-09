extends RefCounted

## Pool of AudioStreamPlayer3D instances for spatial sound effects.
## Routes through the "SFX" bus set up by audio_manager._ensure_buses.
## Linear falloff, unit_size = 1.0m, max_distance = 35m — tuned for
## the arena scale.

const POOL_SIZE: int = 16
const UNIT_SIZE: float = 1.0
const MAX_DISTANCE: float = 35.0

var _host: Node = null
var _players: Array = []
var _next: int = 0


func attach(host: Node) -> void:
	_host = host
	_players.clear()
	_next = 0
	for _i in range(POOL_SIZE):
		var p := AudioStreamPlayer3D.new()
		p.bus = "SFX"
		p.unit_size = UNIT_SIZE
		p.max_distance = MAX_DISTANCE
		p.attenuation_model = AudioStreamPlayer3D.ATTENUATION_INVERSE_DISTANCE
		host.add_child(p)
		_players.append(p)


func play_at(stream: AudioStreamWAV, world_pos: Vector3, volume_db: float = 0.0) -> void:
	if _host == null or stream == null or _players.is_empty():
		return
	var p: AudioStreamPlayer3D = _players[_next]
	_next = (_next + 1) % _players.size()
	p.stream = stream
	p.volume_db = volume_db
	p.position = world_pos
	p.play()


func active_count() -> int:
	var n: int = 0
	for p in _players:
		if p != null and (p as AudioStreamPlayer3D).playing:
			n += 1
	return n


func clear() -> void:
	for p in _players:
		if p != null and (p as AudioStreamPlayer3D).playing:
			(p as AudioStreamPlayer3D).stop()
