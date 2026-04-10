extends RefCounted

## Coal-specific particle helpers — extracted from particle_effects.gd
## to respect the 200 LOC budget. Each helper spawns the mesh particles
## via the host particles instance's _spawn_node/_track internals so
## the same update tick drains them.

const _KIND_COLORS: Dictionary = {
	"spray": "#888899", "hurl": "#222222", "poison": "#55ff88",
	"embers": "#ff7722", "backfire": "#ff3311", "fortune": "#ffd700",
}


static func spawn_ring(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	var count: int = 16
	for i in range(count):
		var angle: float = float(i) / float(count) * TAU
		var dir: Vector3 = Vector3(cos(angle), 0.0, sin(angle))
		var node: MeshInstance3D = particles._spawn_node(root, pos + Vector3(0, 0.5, 0), color, 0.35, 2.8)
		particles._track(node, dir * 8.0 + Vector3(0, 1.2, 0), 0.55, 0.35, 2.8)


static func spawn_streak(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	for i in range(10):
		var t: float = float(i) / 10.0
		var offset: Vector3 = Vector3(0, 0.3 + t * 2.0, 0)
		var node: MeshInstance3D = particles._spawn_node(root, pos + offset, color.lightened(t * 0.5), 0.5 - t * 0.3, 3.5)
		particles._track(node, Vector3(0, 6.0 + t * 2.0, 0), 0.4, 0.5 - t * 0.3, -1.5)


static func spawn_poison_cloud(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	var rng: RandomNumberGenerator = particles._rng
	for i in range(14):
		var angle: float = rng.randf_range(0.0, TAU)
		var radius: float = rng.randf_range(0.5, 1.8)
		var offset: Vector3 = Vector3(cos(angle) * radius, rng.randf_range(0.2, 1.2), sin(angle) * radius)
		var node: MeshInstance3D = particles._spawn_node(root, pos + offset, color, 0.6, 1.8)
		particles._track(node, Vector3(0, rng.randf_range(0.8, 1.6), 0), 0.9, 0.6, -0.8)


static func spawn_aura(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	var rng: RandomNumberGenerator = particles._rng
	for i in range(18):
		var angle: float = rng.randf_range(0.0, TAU)
		var radius: float = rng.randf_range(0.8, 2.5)
		var spawn_pos: Vector3 = pos + Vector3(cos(angle) * radius, 0.1, sin(angle) * radius)
		var node: MeshInstance3D = particles._spawn_node(root, spawn_pos, color, 0.32, 3.6)
		particles._track(node, Vector3(0, rng.randf_range(2.5, 4.5), 0), 0.7, 0.32, 1.0)


static func spawn_explosion(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	particles.spawn_death_burst(root, pos, color, 1.6)
	var rng: RandomNumberGenerator = particles._rng
	for i in range(24):
		var angle: float = rng.randf_range(0.0, TAU)
		var speed: float = rng.randf_range(4.0, 8.0)
		var dir: Vector3 = Vector3(cos(angle), rng.randf_range(0.3, 1.2), sin(angle)).normalized() * speed
		var node: MeshInstance3D = particles._spawn_node(root, pos + Vector3(0, 0.3, 0), color.lightened(0.2), 0.55, 4.2)
		particles._track(node, dir, 0.65, 0.55, 6.0)


static func spawn_sparkle_rain(particles: RefCounted, root: Node3D, pos: Vector3, color: Color) -> void:
	if root == null:
		return
	var rng: RandomNumberGenerator = particles._rng
	for i in range(22):
		var ox: float = rng.randf_range(-2.0, 2.0)
		var oz: float = rng.randf_range(-2.0, 2.0)
		var oy: float = rng.randf_range(2.0, 4.5)
		var spawn_pos: Vector3 = pos + Vector3(ox, oy, oz)
		var node: MeshInstance3D = particles._spawn_node(root, spawn_pos, color, 0.22, 4.5)
		particles._track(node, Vector3(0, -2.5, 0), 1.1, 0.22, -3.0)


static func spawn_for_kind(particles: RefCounted, root: Node3D, pos: Vector3, kind: String, color_override: Color = Color(0, 0, 0, 0), scale: float = 1.0) -> void:
	var color: Color = color_override
	if color.a <= 0.0:
		color = Color(String(_KIND_COLORS.get(kind, "#ffffff")))
	# Stamp the requested kind multiple times for rarity > 1 to keep helper
	# implementations simple. Scale 2.0 → fire twice; 1.5 → fire once + a
	# half-strength repeat by jittering position.
	_dispatch(particles, root, pos, kind, color)
	if scale >= 1.4:
		_dispatch(particles, root, pos + Vector3(0.3, 0.0, -0.2), kind, color)
	if scale >= 1.9:
		_dispatch(particles, root, pos + Vector3(-0.3, 0.1, 0.2), kind, color)


static func _dispatch(particles: RefCounted, root: Node3D, pos: Vector3, kind: String, color: Color) -> void:
	match kind:
		"spray": spawn_ring(particles, root, pos, color)
		"hurl": spawn_streak(particles, root, pos, color)
		"poison": spawn_poison_cloud(particles, root, pos, color)
		"embers": spawn_aura(particles, root, pos, color)
		"backfire": spawn_explosion(particles, root, pos, color)
		"fortune": spawn_sparkle_rain(particles, root, pos, color)
