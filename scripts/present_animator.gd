extends RefCounted
class_name PresentAnimator

## Procedural animation for present player characters.
## Adds idle bob, walk wobble, fire recoil, and dash afterimage.

var time: float = 0.0
var recoil_timer: float = 0.0
var recoil_intensity: float = 0.0
var base_y: float = 0.12


func update(delta: float, visual: Node3D, velocity: Vector2) -> void:
	if visual == null:
		return
	time += delta
	var speed := velocity.length()
	var bob := sin(time * 3.2) * 0.06
	var walk_bob := sin(time * 10.0) * 0.04 * clampf(speed * 0.4, 0.0, 1.0)
	var y_offset := bob + walk_bob
	var wobble_z := sin(time * 10.0) * 0.08 * clampf(speed * 0.3, 0.0, 1.0)
	visual.position.y = y_offset
	visual.rotation.z = wobble_z
	if recoil_timer > 0.0:
		recoil_timer -= delta
		var pulse := sin(recoil_timer / 0.08 * PI) * recoil_intensity
		visual.scale = Vector3.ONE * (1.0 + pulse)
	else:
		visual.scale = Vector3.ONE


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
