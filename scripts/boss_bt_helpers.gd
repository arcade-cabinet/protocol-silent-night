extends RefCounted
## Pure BT movement helpers for Krampus-Prime HSM phases.
## Called by boss_phases.gd. No scene tree dependency beyond Node3D reads.

const ORBIT_RADIUS := 10.0
const ORBIT_TOL := 1.5
const CHARGE_SPEED_MULT := 3.0
const CHARGE_DURATION := 0.5


## Returns a movement direction that keeps the boss at ORBIT_RADIUS from the player,
## strafing tangentially. Radial component added when outside tolerance band.
static func circle_strafe_dir(boss_pos: Vector3, player_pos: Vector3) -> Vector3:
	var to_player := player_pos - boss_pos
	to_player.y = 0.0
	var dist := to_player.length()
	if dist < 0.01:
		return Vector3.FORWARD
	var radial := to_player / dist
	var tangent := Vector3(-radial.z, 0.0, radial.x)
	var radial_bias := 0.0
	if dist > ORBIT_RADIUS + ORBIT_TOL:
		radial_bias = 0.65
	elif dist < ORBIT_RADIUS - ORBIT_TOL:
		radial_bias = -0.55
	return (tangent + radial * radial_bias).normalized()


## Counts down charge_timer; returns true on the frame a charge burst begins.
## Sets charge_phase = CHARGE_DURATION so is_charging() returns true for that window.
static func charge_tick(boss_ref: Dictionary, delta: float, interval: float) -> bool:
	boss_ref["charge_timer"] = float(boss_ref.get("charge_timer", interval)) - delta
	if float(boss_ref["charge_timer"]) <= 0.0:
		boss_ref["charge_timer"] = interval
		boss_ref["charge_phase"] = CHARGE_DURATION
		return true
	return false


## Decrements the active charge window. Must be called every frame when phase >= 2.
static func update_charge_phase(boss_ref: Dictionary, delta: float) -> void:
	var cp := float(boss_ref.get("charge_phase", 0.0))
	if cp > 0.0:
		boss_ref["charge_phase"] = maxf(0.0, cp - delta)


## True while the charge sprint window is active.
static func is_charging(boss_ref: Dictionary) -> bool:
	return float(boss_ref.get("charge_phase", 0.0)) > 0.0


## Fire a 3-projectile spread (±10°) toward player. Used in Phase 3.
static func multi_shot(origin: Vector3, forward: Vector3, on_proj: Callable, damage: float, speed: float) -> void:
	for shot in range(-1, 2):
		var dir := forward.rotated(Vector3.UP, shot * 0.175)
		on_proj.call(origin + Vector3(0, 0.6, 0), dir, true, damage, 1, speed, 0.35)
