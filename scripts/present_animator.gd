extends RefCounted
class_name PresentAnimator

## Procedural animation for present player characters.
## Adds idle bob, walk wobble, fire recoil, and dash afterimage.

var time: float = 0.0
var recoil_timer: float = 0.0
var recoil_intensity: float = 0.0
var base_y: float = 0.12
var reduced_motion: bool = false


func configure(reduced: bool) -> void:
	reduced_motion = reduced


func update(delta: float, visual: Node3D, velocity: Vector2) -> void:
	if visual == null:
		return
	time += delta
	var speed := velocity.length()
	var moving: float = clampf(speed * 0.4, 0.0, 1.0)
	var style: String = String(visual.get_meta("idle_style", "bounce")) if visual.has_meta("idle_style") else "bounce"
	var idle_weight: float = (1.0 - moving) * (0.25 if reduced_motion else 1.0)
	var idle_offset: Vector3 = _idle_for_style(style, time, idle_weight)
	var walk_bob := sin(time * 10.0) * 0.04 * moving
	var wobble_z := sin(time * 10.0) * 0.08 * clampf(speed * 0.3, 0.0, 1.0)
	visual.position.x = idle_offset.x
	visual.position.y = base_y + idle_offset.y + walk_bob
	visual.position.z = idle_offset.z
	if style == "spin":
		visual.rotation.y = fmod(time * 2.0, TAU)
	else:
		visual.rotation.z = idle_offset.x * 0.5 + wobble_z
	if recoil_timer > 0.0:
		recoil_timer -= delta
		var pulse := sin(recoil_timer / 0.08 * PI) * recoil_intensity
		visual.scale = Vector3.ONE * (1.0 + pulse)
	else:
		visual.scale = Vector3.ONE


static func _idle_for_style(style: String, t: float, idle_weight: float) -> Vector3:
	var w: float = clampf(idle_weight, 0.0, 1.0)
	match style:
		"hop":
			var phase: float = fmod(t * 2.2, 1.0)
			var hop_y: float = maxf(0.0, sin(phase * PI)) * 0.18 * w
			return Vector3(0.0, hop_y, 0.0)
		"wobble":
			var wx: float = sin(t * 2.4) * 0.03 * w
			var wy: float = cos(t * 1.8) * 0.025 * w
			return Vector3(wx, wy + sin(t * 3.0) * 0.04 * w, 0.0)
		"sway":
			var sx: float = sin(t * 1.6) * 0.05 * w
			var sy: float = sin(t * 2.0) * 0.03 * w
			return Vector3(sx, sy, 0.0)
		"spin":
			return Vector3(0.0, sin(t * 2.5) * 0.03 * w, 0.0)
		_:
			return Vector3(0.0, sin(t * 3.2) * 0.06 * w, 0.0)


func trigger_recoil(intensity: float = 0.08) -> void:
	recoil_timer = 0.08
	recoil_intensity = intensity


func spawn_dash_afterimage(root: Node3D, source: Node3D, life: float = 0.3) -> Dictionary:
	if source == null:
		return {}
	var ghost := Node3D.new()
	ghost.position = source.global_position
	root.add_child(ghost)
	for child in source.get_children():
		if not (child is MeshInstance3D):
			continue
		var mesh_child := child as MeshInstance3D
		var copy := MeshInstance3D.new()
		copy.mesh = mesh_child.mesh
		copy.transform = mesh_child.transform
		copy.scale = mesh_child.scale
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.8, 1.0, 1.0, 0.5)
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
		mat.emission_enabled = true
		mat.emission = Color(0.7, 0.95, 1.0)
		mat.emission_energy_multiplier = 1.4
		copy.material_override = mat
		ghost.add_child(copy)
	return {"node": ghost, "life": life, "max_life": life}


static func update_afterimages(afterimages: Array, delta: float) -> void:
	for i in range(afterimages.size() - 1, -1, -1):
		var ghost: Dictionary = afterimages[i]
		ghost["life"] -= delta
		if ghost["life"] <= 0.0:
			ghost["node"].queue_free()
			afterimages.remove_at(i)
			continue
		var t := float(ghost["life"]) / float(ghost["max_life"])
		ghost["node"].scale = Vector3.ONE * (1.0 + (1.0 - t) * 0.3)
		for child in ghost["node"].get_children():
			if child is MeshInstance3D:
				var m := child.material_override as StandardMaterial3D
				if m != null:
					m.albedo_color.a = t * 0.5
		afterimages[i] = ghost
