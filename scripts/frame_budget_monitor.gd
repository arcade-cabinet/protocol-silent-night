extends RefCounted

const WINDOW_SIZE: int = 180
const TARGET_FRAME_MS: float = 16.7
const SLOW_FRAME_MS: float = 20.0
const CRITICAL_FRAME_MS: float = 33.0

var _samples: Array[float] = []
var _sum_ms: float = 0.0
var _worst_ms: float = 0.0
var _slow_frames: int = 0
var _critical_frames: int = 0
var _lifetime_seconds: float = 0.0


func reset() -> void:
	_samples.clear()
	_sum_ms = 0.0
	_worst_ms = 0.0
	_slow_frames = 0
	_critical_frames = 0
	_lifetime_seconds = 0.0


func sample(delta: float) -> void:
	var ms := maxf(0.0, delta) * 1000.0
	_lifetime_seconds += maxf(0.0, delta)
	if _samples.size() >= WINDOW_SIZE:
		_remove_sample(float(_samples.pop_front()))
	_samples.append(ms)
	_sum_ms += ms
	_worst_ms = maxf(_worst_ms, ms)
	if ms > SLOW_FRAME_MS:
		_slow_frames += 1
	if ms > CRITICAL_FRAME_MS:
		_critical_frames += 1


func summary() -> Dictionary:
	if _samples.is_empty():
		return {"has_data": false, "avg_ms": 0.0, "fps": 0.0, "worst_ms": 0.0, "slow_ratio": 0.0, "critical_ratio": 0.0, "lifetime_seconds": _lifetime_seconds, "rating": "cold"}
	var count := float(_samples.size())
	var avg_ms := _sum_ms / count
	return {
		"has_data": true,
		"avg_ms": avg_ms,
		"fps": 1000.0 / maxf(avg_ms, 0.001),
		"worst_ms": _worst_ms,
		"slow_ratio": float(_slow_frames) / count,
		"critical_ratio": float(_critical_frames) / count,
		"lifetime_seconds": _lifetime_seconds,
		"rating": _rating(avg_ms, float(_slow_frames) / count, float(_critical_frames) / count),
	}


func _remove_sample(ms: float) -> void:
	_sum_ms -= ms
	if ms > SLOW_FRAME_MS:
		_slow_frames = maxi(0, _slow_frames - 1)
	if ms > CRITICAL_FRAME_MS:
		_critical_frames = maxi(0, _critical_frames - 1)
	if is_equal_approx(ms, _worst_ms):
		_recompute_worst()


func _recompute_worst() -> void:
	_worst_ms = 0.0
	for sample_ms in _samples:
		_worst_ms = maxf(_worst_ms, float(sample_ms))


func _rating(avg_ms: float, slow_ratio: float, critical_ratio: float) -> String:
	if critical_ratio > 0.12 or avg_ms > 24.0:
		return "critical"
	if slow_ratio > 0.10 or avg_ms > TARGET_FRAME_MS * 1.12:
		return "stressed"
	return "stable"
