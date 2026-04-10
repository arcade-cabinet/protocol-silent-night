extends RefCounted

## Combo kill counter: tracks kill timestamps, escalates through
## tiers (white → gold → red), resets on 2s idle. Pure logic —
## the UI label is owned by ui_manager and set via show_combo.

const COMBO_WINDOW: float = 2.0
const TIER_GOLD: int = 5
const TIER_RED: int = 15

var _kill_times: Array = []
var _current_time: float = 0.0
var _last_kill_time: float = -999.0
var _active_combo: int = 0
var _active_tier: int = 0


func tick(delta: float) -> void:
	_current_time += delta
	if _active_combo > 0 and _current_time - _last_kill_time > COMBO_WINDOW:
		_active_combo = 0
		_active_tier = 0


func register_kill() -> Dictionary:
	_last_kill_time = _current_time
	_kill_times.append(_current_time)
	# Purge old timestamps outside the window
	while _kill_times.size() > 0 and _current_time - float(_kill_times[0]) > COMBO_WINDOW:
		_kill_times.pop_front()
	_active_combo = _kill_times.size()
	_active_tier = _tier_for(_active_combo)
	return {"count": _active_combo, "tier": _active_tier}


func get_state() -> Dictionary:
	return {"count": _active_combo, "tier": _active_tier}


func reset() -> void:
	_kill_times.clear()
	_active_combo = 0
	_active_tier = 0


static func _tier_for(count: int) -> int:
	if count >= TIER_RED:
		return 3
	if count >= TIER_GOLD:
		return 2
	if count >= 3:
		return 1
	return 0


static func tier_color(tier: int) -> Color:
	match tier:
		3: return Color("#ff2244")
		2: return Color("#ffd700")
		1: return Color("#ffffff")
	return Color("#aaaaaa")
