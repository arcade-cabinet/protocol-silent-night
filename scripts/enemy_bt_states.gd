extends RefCounted
# Pure state-machine tick functions for grunt, rusher, and tank BT logic.
# Each tick mutates `enemy` in-place and returns the current state string.
# No Node3D creation or scene-tree dependency — safe for unit tests.

const GRUNT_AGGRO_RADIUS := 12.0
const GRUNT_CONTACT_RADIUS := 1.0
const RUSHER_BURST_RANGE := 14.0
const RUSHER_BURST_DURATION := 0.6
const RUSHER_COOLDOWN_DURATION := 0.9
const RUSHER_BURST_SPEED_MULT := 2.5
const TANK_PREP_RANGE := 5.0
const TANK_PREP_DURATION := 0.5
const TANK_SLAM_DURATION := 0.3
const TANK_STAGGER_DURATION := 0.8
const TANK_SLAM_DAMAGE_MULT := 1.8


static func grunt_tick(enemy: Dictionary, player_pos: Vector3, _delta: float) -> String:
	var pos: Vector3 = enemy["node"].position
	var flat_player := Vector3(player_pos.x, pos.y, player_pos.z)
	var dist: float = pos.distance_to(flat_player)
	if dist <= GRUNT_CONTACT_RADIUS:
		enemy["behavior_state"] = "contact"
	elif dist <= GRUNT_AGGRO_RADIUS:
		enemy["behavior_state"] = "chase"
	else:
		enemy["behavior_state"] = "wander"
	return String(enemy["behavior_state"])


static func grunt_wander_direction(enemy: Dictionary, delta: float) -> Vector3:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var phase: float = float(enemy["behavior_timer"]) * 0.7 + float(enemy.get("enemy_uid", 0)) * 0.23
	return Vector3(sin(phase), 0.0, cos(phase)).normalized()


static func rusher_tick(enemy: Dictionary, player_pos: Vector3, delta: float, on_telegraph: Callable) -> String:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var pos: Vector3 = enemy["node"].position
	var flat_player := Vector3(player_pos.x, pos.y, player_pos.z)
	var dist: float = pos.distance_to(flat_player)
	var state := String(enemy.get("behavior_state", "idle"))
	match state:
		"idle":
			if dist <= RUSHER_BURST_RANGE:
				enemy["behavior_state"] = "burst"
				enemy["behavior_timer"] = 0.0
				if on_telegraph.is_valid():
					on_telegraph.call(String(enemy.get("id", "rusher")), pos)
		"burst":
			if float(enemy["behavior_timer"]) >= RUSHER_BURST_DURATION:
				enemy["behavior_state"] = "cooldown"
				enemy["behavior_timer"] = 0.0
		"cooldown":
			if float(enemy["behavior_timer"]) >= RUSHER_COOLDOWN_DURATION:
				enemy["behavior_state"] = "idle"
				enemy["behavior_timer"] = 0.0
	return String(enemy["behavior_state"])


static func tank_tick(enemy: Dictionary, player_pos: Vector3, delta: float, on_telegraph: Callable) -> String:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var pos: Vector3 = enemy["node"].position
	var flat_player := Vector3(player_pos.x, pos.y, player_pos.z)
	var dist: float = pos.distance_to(flat_player)
	var state := String(enemy.get("behavior_state", "advance"))
	match state:
		"advance":
			if dist <= TANK_PREP_RANGE:
				enemy["behavior_state"] = "prep_slam"
				enemy["behavior_timer"] = 0.0
		"prep_slam":
			if float(enemy["behavior_timer"]) >= TANK_PREP_DURATION:
				if on_telegraph.is_valid():
					on_telegraph.call(String(enemy.get("id", "tank")), pos)
				enemy["behavior_state"] = "slam"
				enemy["behavior_timer"] = 0.0
		"slam":
			enemy["slam_damage_mult"] = TANK_SLAM_DAMAGE_MULT
			if float(enemy["behavior_timer"]) >= TANK_SLAM_DURATION:
				enemy["behavior_state"] = "stagger"
				enemy["behavior_timer"] = 0.0
		"stagger":
			if float(enemy["behavior_timer"]) >= TANK_STAGGER_DURATION:
				enemy["behavior_state"] = "advance"
				enemy["behavior_timer"] = 0.0
	return String(enemy["behavior_state"])
