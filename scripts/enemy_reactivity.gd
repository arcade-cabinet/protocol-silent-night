extends RefCounted
class_name EnemyReactivity

const HIT_LIFE := 0.18


static func register_hit(target: Dictionary, direction: Vector3, power: float = 1.0) -> void:
	target["hit_life"] = HIT_LIFE
	target["hit_power"] = clampf(power, 0.35, 1.0)
	target["hit_sign"] = -1.0 if direction.x < 0.0 else 1.0


static func update_enemy(enemy: Dictionary, delta: float) -> void:
	_update_visual(enemy, delta, _visual_root(enemy.get("node", null)))


static func update_boss(boss_ref: Dictionary, delta: float) -> void:
	if boss_ref.is_empty():
		return
	_update_visual(boss_ref, delta, _visual_root(boss_ref.get("node", null)))


static func spawn_death_echo(root: Node3D, vfx: Array, target: Dictionary) -> void:
	var source := _visual_root(target.get("node", null))
	if root == null or source == null:
		return
	var echo := Node3D.new()
	echo.name = "DeathEcho"
	echo.transform = source.global_transform
	var shell := _echo_shell(source)
	if shell == null:
		return
	echo.add_child(shell)
	root.add_child(echo)
	vfx.append({
		"node": echo,
		"life": 0.34,
		"mode": "collapse",
		"tilt_sign": float(target.get("hit_sign", 1.0)),
	})


static func _update_visual(target: Dictionary, delta: float, visual: Node3D) -> void:
	if visual == null:
		return
	var base_pos: Vector3 = visual.get_meta("react_base_pos", visual.position)
	var base_rot: Vector3 = visual.get_meta("react_base_rot", visual.rotation_degrees)
	var base_scale: Vector3 = visual.get_meta("react_base_scale", visual.scale)
	visual.set_meta("react_base_pos", base_pos)
	visual.set_meta("react_base_rot", base_rot)
	visual.set_meta("react_base_scale", base_scale)
	var life := maxf(0.0, float(target.get("hit_life", 0.0)) - delta)
	target["hit_life"] = life
	var power := float(target.get("hit_power", 0.0))
	var sign := float(target.get("hit_sign", 1.0))
	var pulse := 0.0 if life <= 0.0 else life / HIT_LIFE
	visual.position = base_pos + Vector3(-sign * 0.08 * power * pulse, 0.03 * power * pulse, 0)
	visual.rotation_degrees = base_rot + Vector3(-12.0 * power * pulse, 0.0, sign * 14.0 * power * pulse)
	visual.scale = base_scale + Vector3.ONE * (0.08 * power * pulse)


static func _visual_root(node: Variant) -> Node3D:
	var root := node as Node3D
	if root == null:
		return null
	if root.has_meta("cached_visual_root"):
		return root.get_meta("cached_visual_root") as Node3D
	for child in root.get_children():
		if not (child is Node3D):
			continue
		var child_node := child as Node3D
		var name := String(child_node.name)
		if name == "ThreatMarks" or name == "DeathEcho":
			continue
		if name.begins_with("Present_") or name == "BossFallback" or child is MeshInstance3D:
			root.set_meta("cached_visual_root", child_node)
			return child_node
	return null


static func _echo_shell(source: Node3D) -> Node3D:
	var mesh := _first_mesh(source)
	if mesh == null:
		return null
	var clone := MeshInstance3D.new()
	clone.mesh = mesh.mesh
	clone.material_override = mesh.material_override
	clone.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	clone.position = mesh.position
	clone.rotation = mesh.rotation
	clone.scale = mesh.scale
	return clone


static func _first_mesh(root: Node3D) -> MeshInstance3D:
	if root is MeshInstance3D:
		return root as MeshInstance3D
	for child in root.get_children():
		if not (child is Node3D):
			continue
		var mesh := _first_mesh(child as Node3D)
		if mesh != null:
			return mesh
	return null
