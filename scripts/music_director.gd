extends RefCounted

## Watches game state (enemy count, player HP, boss presence) and
## selects an appropriate music intensity layer. Hysteresis prevents
## rapid layer thrashing near thresholds. Calls
## audio_manager.set_music_intensity to swap layers.
##
## Layers: calm (< 10 enemies, HP > 70%) / gameplay (default) /
## panic (> 25 enemies OR HP < 30%) / boss (boss active, overrides everything).

const COOLDOWN: float = 0.9

var _current_level: String = ""
var _cooldown: float = 0.0


func tick(delta: float, audio_mgr: RefCounted, enemy_count: int, hp_pct: float, boss_active: bool) -> void:
	if audio_mgr == null:
		return
	_cooldown = maxf(0.0, _cooldown - delta)
	var desired: String = _select_level(enemy_count, hp_pct, boss_active)
	if desired == _current_level or _cooldown > 0.0:
		return
	_current_level = desired
	_cooldown = COOLDOWN
	if audio_mgr.has_method("set_music_intensity"):
		audio_mgr.set_music_intensity(desired)
	elif audio_mgr.has_method("play_music"):
		audio_mgr.play_music(desired)


static func _select_level(enemy_count: int, hp_pct: float, boss_active: bool) -> String:
	if boss_active:
		return "boss"
	if hp_pct < 0.3 or enemy_count > 25:
		return "panic"
	if enemy_count >= 10:
		return "gameplay"
	if hp_pct > 0.7:
		return "calm"
	return "gameplay"


func reset() -> void:
	_current_level = ""
	_cooldown = 0.0
