extends RefCounted
# Per-enemy behavior helpers. Each function mutates `enemy` state and issues
# movement via `on_move_actor` or projectiles via `on_spawn_projectile`.
# Keep this file focused and under the 200 LOC project limit.

const EnemyBTStates := preload("res://scripts/enemy_bt_states.gd")


static func contact_radius(enemy: Dictionary) -> float:
	return 0.52 + float(enemy["node"].scale.x) * 0.3


static func behavior_chase(enemy: Dictionary, player_node: Node3D, delta: float, on_move_actor: Callable) -> void:
	var direction: Vector3 = (player_node.position - enemy["node"].position)
	direction.y = 0.0
	if direction.length_squared() <= 0.0001:
		return
	direction = direction.normalized()
	on_move_actor.call(enemy["node"], direction, float(enemy["speed"]), delta, contact_radius(enemy))


static func behavior_swerve(enemy: Dictionary, player_node: Node3D, delta: float, on_move_actor: Callable, phase_level: int = 1) -> void:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var to_player: Vector3 = player_node.position - enemy["node"].position
	to_player.y = 0.0
	if to_player.length_squared() <= 0.0001:
		return
	var forward: Vector3 = to_player.normalized()
	var side := Vector3(-forward.z, 0.0, forward.x)
	var phase := float(enemy["behavior_timer"]) * 5.5 + float(enemy.get("enemy_uid", 0)) * 0.017
	var offset := sin(phase) * (0.9 + float(phase_level) * 0.3)
	var direction: Vector3 = (forward + side * offset).normalized()
	on_move_actor.call(enemy["node"], direction, float(enemy["speed"]), delta, contact_radius(enemy))


static func behavior_stomp(enemy: Dictionary, player_node: Node3D, delta: float, on_move_actor: Callable, phase_level: int = 1) -> void:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var state := String(enemy.get("behavior_state", "chase"))
	var direction: Vector3 = player_node.position - enemy["node"].position
	direction.y = 0.0
	if direction.length_squared() > 0.0001:
		direction = direction.normalized()
	else:
		direction = Vector3.ZERO
	var speed := float(enemy["speed"])
	var surge_mult: float = 2.0 + float(phase_level - 1) * 0.25
	match state:
		"chase":
			if float(enemy["behavior_timer"]) >= 2.5:
				enemy["behavior_state"] = "windup"
				enemy["behavior_timer"] = 0.0
			on_move_actor.call(enemy["node"], direction, speed * 0.75, delta, contact_radius(enemy))
		"windup":
			if float(enemy["behavior_timer"]) >= 0.4:
				enemy["behavior_state"] = "surge"
				enemy["behavior_timer"] = 0.0
		"surge":
			on_move_actor.call(enemy["node"], direction, speed * surge_mult, delta, contact_radius(enemy))
			if float(enemy["behavior_timer"]) >= 0.6:
				enemy["behavior_state"] = "chase"
				enemy["behavior_timer"] = 0.0
		_:
			enemy["behavior_state"] = "chase"


static func behavior_flank(enemy: Dictionary, player_node: Node3D, delta: float, on_move_actor: Callable, on_spawn_projectile: Callable, phase_level: int = 1, on_telegraph: Callable = Callable()) -> void:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var to_player: Vector3 = player_node.position - enemy["node"].position
	to_player.y = 0.0
	var distance := to_player.length()
	if distance <= 0.0001:
		return
	var forward: Vector3 = to_player / distance
	var tangent := Vector3(-forward.z, 0.0, forward.x)
	var orbit_radius: float = 8.0 - float(phase_level - 1) * 0.5
	var radial_bias := 0.0
	if distance > orbit_radius + 0.5: radial_bias = 0.7
	elif distance < orbit_radius - 0.5: radial_bias = -0.7
	var direction: Vector3 = (tangent + forward * radial_bias).normalized()
	on_move_actor.call(enemy["node"], direction, float(enemy["speed"]), delta, contact_radius(enemy))
	var fire_interval: float = maxf(1.2 - float(phase_level - 1) * 0.1, 0.5)
	_try_telegraph(enemy, fire_interval, on_telegraph)
	if float(enemy["behavior_timer"]) >= fire_interval:
		enemy["behavior_timer"] = 0.0; enemy["telegraphed"] = false
		on_spawn_projectile.call(enemy["node"].position + Vector3(0, 0.5, 0), forward, true, 6.0, 1, 14.0, 0.28)


static func behavior_ranged(enemy: Dictionary, player_node: Node3D, delta: float, on_move_actor: Callable, on_spawn_projectile: Callable, phase_level: int = 1, on_telegraph: Callable = Callable()) -> void:
	enemy["behavior_timer"] = float(enemy.get("behavior_timer", 0.0)) + delta
	var to_player: Vector3 = player_node.position - enemy["node"].position
	to_player.y = 0.0
	var distance := to_player.length()
	if distance <= 0.0001:
		return
	var forward := to_player / distance
	var min_range := 10.0
	var leash := 14.0
	if distance > leash:
		on_move_actor.call(enemy["node"], forward, float(enemy["speed"]), delta, contact_radius(enemy))
	elif distance < min_range - 0.5:
		on_move_actor.call(enemy["node"], -forward, float(enemy["speed"]) * 0.6, delta, contact_radius(enemy))
	var fire_interval: float = maxf(2.0 - float(phase_level - 1) * 0.2, 0.8)
	_try_telegraph(enemy, fire_interval, on_telegraph)
	if float(enemy["behavior_timer"]) >= fire_interval:
		enemy["behavior_timer"] = 0.0; enemy["telegraphed"] = false
		for shot in range(-1, 2):
			var dir := forward.rotated(Vector3.UP, shot * 0.09)
			on_spawn_projectile.call(enemy["node"].position + Vector3(0, 0.6, 0), dir, true, 5.0, 1, 16.0, 0.3)


static func _try_telegraph(enemy: Dictionary, fire_interval: float, on_telegraph: Callable) -> void:
	if not on_telegraph.is_valid() or bool(enemy.get("telegraphed", false)):
		return
	if float(enemy["behavior_timer"]) >= (fire_interval - 0.35):
		enemy["telegraphed"] = true
		on_telegraph.call(String(enemy.get("id", "grunt")), enemy["node"].position)


static func behavior_pack(enemy: Dictionary, enemies: Array, player_node: Node3D, delta: float, on_move_actor: Callable, phase_level: int = 1) -> void:
	var cluster_radius: float = 6.0 + float(phase_level - 1) * 0.5
	var center: Vector3 = enemy["node"].position
	var count := 1
	for other in enemies:
		if other.get("id", "") != "bumble" or other.get("enemy_uid", 0) == enemy.get("enemy_uid", -1):
			continue
		if other["node"].position.distance_to(enemy["node"].position) < cluster_radius:
			center += other["node"].position
			count += 1
	var pack_center: Vector3 = center / float(count)
	var to_pack: Vector3 = pack_center - enemy["node"].position
	to_pack.y = 0.0
	var to_player: Vector3 = player_node.position - enemy["node"].position
	to_player.y = 0.0
	if to_player.length_squared() <= 0.0001:
		return
	var direction: Vector3 = (to_player.normalized() + to_pack * 0.4).normalized()
	on_move_actor.call(enemy["node"], direction, float(enemy["speed"]), delta, contact_radius(enemy))


static func behavior_grunt_bt(enemy: Dictionary, player_pos: Vector3, delta: float, on_move_actor: Callable) -> void:
	var state := EnemyBTStates.grunt_tick(enemy, player_pos, delta)
	var enode: Node3D = enemy["node"]
	match state:
		"wander":
			var dir: Vector3 = EnemyBTStates.grunt_wander_direction(enemy, delta)
			on_move_actor.call(enode, dir, float(enemy["speed"]) * 0.5, delta, contact_radius(enemy))
		"chase":
			var to_p: Vector3 = Vector3(player_pos.x, enode.position.y, player_pos.z) - enode.position
			if to_p.length_squared() > 0.0001:
				on_move_actor.call(enode, to_p.normalized(), float(enemy["speed"]), delta, contact_radius(enemy))
		"contact":
			pass  # combat resolver handles contact damage


static func behavior_rusher_bt(enemy: Dictionary, player_pos: Vector3, delta: float, on_move_actor: Callable, on_telegraph: Callable = Callable()) -> void:
	var state := EnemyBTStates.rusher_tick(enemy, player_pos, delta, on_telegraph)
	var enode: Node3D = enemy["node"]
	var to_p: Vector3 = Vector3(player_pos.x, enode.position.y, player_pos.z) - enode.position
	if to_p.length_squared() <= 0.0001:
		return
	var dir: Vector3 = to_p.normalized()
	match state:
		"idle":
			on_move_actor.call(enode, dir, float(enemy["speed"]), delta, contact_radius(enemy))
		"burst":
			on_move_actor.call(enode, dir, float(enemy["speed"]) * EnemyBTStates.RUSHER_BURST_SPEED_MULT, delta, contact_radius(enemy))
		"cooldown":
			pass  # no movement during cooldown


static func behavior_tank_bt(enemy: Dictionary, player_pos: Vector3, delta: float, on_move_actor: Callable, on_telegraph: Callable = Callable()) -> void:
	var state := EnemyBTStates.tank_tick(enemy, player_pos, delta, on_telegraph)
	var enode: Node3D = enemy["node"]
	var to_p: Vector3 = Vector3(player_pos.x, enode.position.y, player_pos.z) - enode.position
	if to_p.length_squared() <= 0.0001:
		return
	var dir: Vector3 = to_p.normalized()
	match state:
		"advance":
			on_move_actor.call(enode, dir, float(enemy["speed"]) * 0.7, delta, contact_radius(enemy))
		"prep_slam":
			on_move_actor.call(enode, dir, float(enemy["speed"]) * 0.3, delta, contact_radius(enemy))
		"slam":
			on_move_actor.call(enode, dir, float(enemy["speed"]) * 2.0, delta, contact_radius(enemy))
		"stagger":
			pass  # no movement during stagger
