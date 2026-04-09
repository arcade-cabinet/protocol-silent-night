extends RefCounted

## Translucent ring visualizing pickup attraction radius on the
## gameplay board. Additive gold-cyan gradient shader-free material.
## Visible only when radius > base; pulses subtly via update().


static func build(root: Node3D) -> MeshInstance3D:
	var ring := MeshInstance3D.new()
	ring.name = "PickupMagnetRing"
	var torus := TorusMesh.new()
	torus.outer_radius = 1.0
	torus.inner_radius = 0.94
	ring.mesh = torus
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(1.0, 0.87, 0.3, 0.35)
	mat.emission_enabled = true
	mat.emission = Color(0.4, 0.9, 1.0)
	mat.emission_energy_multiplier = 1.2
	ring.material_override = mat
	ring.visible = false
	root.add_child(ring)
	return ring


static func update(ring: MeshInstance3D, player_pos: Vector3, radius: float, base_radius: float, time: float) -> void:
	if ring == null or not is_instance_valid(ring):
		return
	if radius <= base_radius + 0.05:
		ring.visible = false
		return
	ring.visible = true
	ring.position = player_pos + Vector3(0, 0.05, 0)
	var pulse: float = 1.0 + sin(time * 3.0) * 0.03
	ring.scale = Vector3(radius * pulse, 1.0, radius * pulse)
	var mat: StandardMaterial3D = ring.material_override as StandardMaterial3D
	if mat != null:
		var alpha: float = 0.3 + (sin(time * 3.0) + 1.0) * 0.1
		var c: Color = mat.albedo_color
		c.a = alpha
		mat.albedo_color = c
