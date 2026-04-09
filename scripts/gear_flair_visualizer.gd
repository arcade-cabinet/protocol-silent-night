extends RefCounted

## Renders flair pieces attached to equipped gear items.
## Each flair type from GearSystem.VALID_FLAIR_TYPES maps to a small
## procedural mesh composition built from primitives.


static func attach_flair(visual: Node3D, flair_list: Array, y_start: float = 1.75, animator: Node = null) -> float:
	var y_stack: float = y_start
	for piece in flair_list:
		if not (piece is Dictionary):
			continue
		var ptype := String(piece.get("type", ""))
		var color := Color(String(piece.get("color", "#ffffff")))
		match ptype:
			"orbiting_particle":
				_spawn_orbit(visual, int(piece.get("count", 2)), float(piece.get("radius", 0.6)), color)
			"pulsing_glow":
				_spawn_aura_shell(visual, color, float(piece.get("intensity", 1.0)))
			"frost_crystals":
				_spawn_frost(visual, int(piece.get("count", 3)), color)
			"ember_glow":
				_spawn_ember(visual, color, float(piece.get("intensity", 1.0)))
			"sparkle_burst":
				_spawn_sparkle(visual, int(piece.get("count", 4)), color)
			"halo_ring":
				_spawn_halo(visual, float(piece.get("radius", 0.8)), color, y_stack)
				y_stack += 0.15
			"floating_icon":
				_spawn_floating_quad(visual, color, y_stack)
				y_stack += 0.15
			"dripping_icicles":
				_spawn_icicles(visual, int(piece.get("count", 3)), color)
			"wobble_animation":
				_spawn_animated_marker(visual, color, "wobble_animation", piece, animator)
			"color_shift":
				_spawn_animated_marker(visual, color, "color_shift", piece, animator)
			"trailing_sparks":
				_spawn_animated_marker(visual, color, "trailing_sparks", piece, animator)
	return y_stack


static func _spawn_animated_marker(visual: Node3D, color: Color, anim_type: String, params: Dictionary, animator: Node) -> void:
	var marker := _emissive_sphere(color, 0.12, 1.6)
	var offset := _marker_offset(anim_type)
	marker.position = offset
	visual.add_child(marker)
	if animator != null and animator.has_method("register"):
		animator.register(marker, anim_type, params)


static func _marker_offset(anim_type: String) -> Vector3:
	match anim_type:
		"wobble_animation": return Vector3(0.55, 1.2, 0.0)
		"color_shift": return Vector3(-0.55, 1.2, 0.0)
		"trailing_sparks": return Vector3(0.0, 0.3, -0.55)
		_: return Vector3.ZERO


static func _spawn_orbit(visual: Node3D, count: int, radius: float, color: Color) -> void:
	for i in range(count):
		var angle := TAU * float(i) / float(max(count, 1))
		var sphere := _emissive_sphere(color, 0.08, 1.5)
		sphere.position = Vector3(cos(angle) * radius, 1.1, sin(angle) * radius)
		visual.add_child(sphere)


static func _spawn_aura_shell(visual: Node3D, color: Color, intensity: float) -> void:
	var shell := _emissive_sphere(color, 0.95, intensity * 0.4)
	var mat := shell.material_override as StandardMaterial3D
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color.a = 0.22
	shell.position = Vector3(0, 0.7, 0)
	visual.add_child(shell)


static func _spawn_frost(visual: Node3D, count: int, color: Color) -> void:
	for i in range(count):
		var angle := TAU * float(i) / float(max(count, 1)) + 0.3
		var crystal := _emissive_sphere(color, 0.12, 1.5)
		crystal.position = Vector3(cos(angle) * 0.55, 0.2 + sin(angle * 2.0) * 0.1, sin(angle) * 0.55)
		visual.add_child(crystal)


static func _spawn_ember(visual: Node3D, color: Color, intensity: float) -> void:
	var ember := _emissive_sphere(color, 0.18, intensity * 2.0)
	ember.position = Vector3(0, 1.8, 0)
	visual.add_child(ember)


static func _spawn_sparkle(visual: Node3D, count: int, color: Color) -> void:
	for i in range(count):
		var angle := TAU * float(i) / float(max(count, 1)) + 0.6
		var sp := _emissive_sphere(color, 0.06, 1.5)
		sp.position = Vector3(cos(angle) * 0.7, 1.6 + sin(angle * 3.0) * 0.2, sin(angle) * 0.7)
		visual.add_child(sp)


static func _spawn_halo(visual: Node3D, radius: float, color: Color, y: float) -> void:
	var halo := MeshInstance3D.new()
	var torus := TorusMesh.new()
	var safe_outer: float = maxf(0.02, radius)
	torus.outer_radius = safe_outer
	torus.inner_radius = maxf(0.01, safe_outer - 0.08)
	halo.mesh = torus
	halo.position = Vector3(0, y, 0)
	halo.material_override = _emissive_mat(color, 2.0)
	visual.add_child(halo)


static func _spawn_floating_quad(visual: Node3D, color: Color, y: float) -> void:
	var quad_inst := MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(0.3, 0.3)
	quad_inst.mesh = quad
	quad_inst.position = Vector3(0, y + 0.2, 0)
	var mat := _emissive_mat(color, 1.5)
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	quad_inst.material_override = mat
	visual.add_child(quad_inst)


static func _spawn_icicles(visual: Node3D, count: int, color: Color) -> void:
	for i in range(count):
		var angle := TAU * float(i) / float(max(count, 1)) + 0.9
		var icicle := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.06; cyl.bottom_radius = 0.01; cyl.height = 0.25
		icicle.mesh = cyl
		icicle.position = Vector3(cos(angle) * 0.5, 0.05, sin(angle) * 0.5)
		icicle.material_override = _emissive_mat(color, 0.5)
		visual.add_child(icicle)


static func _emissive_sphere(color: Color, radius: float, intensity: float) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = radius; sphere.height = radius * 2.0
	inst.mesh = sphere
	inst.material_override = _emissive_mat(color, intensity)
	return inst


static func _emissive_mat(color: Color, intensity: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = intensity
	return mat
