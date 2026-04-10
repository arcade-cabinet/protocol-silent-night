extends RefCounted

## Trauma-based screen shake service. Callers push trauma via
## add_trauma(amount). update(delta, camera) decays it linearly
## and applies a random offset to camera.h_offset / v_offset. Shared
## across coal activation, player damage, boss phase transitions, and
## any other impact event.
##
## Respects the "reduced_motion" save preference — when enabled, all
## trauma events collapse to zero.

const MAX_TRAUMA: float = 1.0
const DECAY_RATE: float = 1.8
const MAX_OFFSET: float = 0.35

var trauma: float = 0.0
var reduced_motion: bool = false
var _rng := RandomNumberGenerator.new()
var _base_offset := Vector2.ZERO


func _init() -> void:
	_rng.seed = int(Time.get_ticks_usec()) ^ 0x5AE1


func configure(reduced: bool) -> void:
	reduced_motion = reduced
	if reduced:
		trauma = 0.0


func add_trauma(amount: float) -> void:
	if reduced_motion:
		return
	trauma = clampf(trauma + maxf(amount, 0.0), 0.0, MAX_TRAUMA)


func update(delta: float, camera: Camera3D) -> void:
	if camera == null:
		return
	if trauma <= 0.0:
		camera.h_offset = _base_offset.x
		camera.v_offset = _base_offset.y
		return
	var shake: float = trauma * trauma
	var ox: float = _rng.randf_range(-1.0, 1.0) * MAX_OFFSET * shake
	var oy: float = _rng.randf_range(-1.0, 1.0) * MAX_OFFSET * shake
	camera.h_offset = _base_offset.x + ox
	camera.v_offset = _base_offset.y + oy
	trauma = maxf(0.0, trauma - DECAY_RATE * delta)


func reset() -> void:
	trauma = 0.0
