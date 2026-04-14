extends RefCounted
class_name EnemyPoseLanguage


static func update_enemy_pose(enemy: Dictionary) -> void:
	var rig := _find_rig(enemy.get("node", null))
	if rig == null:
		return
	var alert := 1.0 if bool(enemy.get("telegraphed", false)) else 0.0
	var phase := float(int(enemy.get("phase_level", 1)) - 1)
	var pulse := 0.92 + sin(float(enemy.get("behavior_timer", 0.0)) * 7.0) * 0.08
	match String(enemy.get("id", "")):
		"elf":
			_elf_pose(rig, alert, phase)
		"santa":
			_santa_pose(rig, alert)
		"bumble":
			_bumble_pose(rig, alert, phase, float(enemy.get("behavior_timer", 0.0)))
		"tank":
			var plow := rig.get_node_or_null("RamPlow") as MeshInstance3D
			if plow != null:
				plow.position.z = 0.48 + alert * 0.12
				plow.rotation_degrees.x = -18.0 - alert * 16.0
		"rusher":
			rig.rotation_degrees.z = pulse * 8.0
		"grunt":
			var blade := rig.get_node_or_null("TagBlade") as MeshInstance3D
			if blade != null:
				blade.rotation_degrees.z = 28.0 + pulse * 16.0


static func update_boss_pose(boss_ref: Dictionary, phase: int) -> void:
	if boss_ref.is_empty():
		return
	var shell := boss_ref["node"].get_node_or_null("BossFallback") as Node3D
	if shell == null:
		return
	var pulse := 0.94 + sin(float(boss_ref.get("attack_timer", 0.0)) * 6.8) * 0.06
	var jaw := shell.get_node_or_null("JawRam") as MeshInstance3D
	if jaw != null:
		jaw.position.z = 0.95 + phase * 0.18
		jaw.rotation_degrees.x = -phase * 8.0
	var halo := shell.get_node_or_null("CrownHalo") as MeshInstance3D
	if halo != null:
		halo.position.y = 1.82 + phase * 0.16
		halo.scale = Vector3.ONE * (1.0 + phase * 0.14 + pulse * 0.06)
	for side in [-1, 1]:
		var horn := shell.get_node_or_null("Horn%d" % side) as Node3D
		if horn != null:
			horn.position.x = float(side) * (1.05 + phase * 0.12)
			horn.rotation_degrees.z = float(side) * (24.0 + phase * 8.0)
		var stack := shell.get_node_or_null("Stack%d" % side) as Node3D
		if stack != null:
			stack.position.y = 1.0 + phase * 0.08
			stack.scale = Vector3.ONE * (1.0 + phase * 0.08)


static func _elf_pose(rig: Node3D, alert: float, phase: float) -> void:
	var mohawk := rig.get_node_or_null("Mohawk") as Node3D
	if mohawk != null:
		mohawk.scale = Vector3(1.0 + alert * 0.12, 1.0 + alert * 0.52 + phase * 0.08, 1.0)
		mohawk.rotation_degrees.z = -8.0 - alert * 18.0
	var back_rig := rig.get_node_or_null("BackRig") as MeshInstance3D
	if back_rig != null:
		back_rig.position.z = -0.34 - alert * 0.18
		back_rig.rotation_degrees.x = -alert * 26.0


static func _santa_pose(rig: Node3D, alert: float) -> void:
	var cage := rig.get_node_or_null("SiegeCage") as Node3D
	if cage != null:
		cage.position.z = alert * 0.14
		cage.scale = Vector3(1.0 + alert * 0.08, 1.0 + alert * 0.22, 1.0 + alert * 0.12)
		cage.rotation_degrees.x = -alert * 10.0
	var ram := rig.get_node_or_null("Ram") as MeshInstance3D
	if ram != null:
		ram.position.z = 0.6 + alert * 0.28
		ram.rotation_degrees.x = -14.0 - alert * 18.0


static func _bumble_pose(rig: Node3D, alert: float, phase: float, timer: float) -> void:
	var pack_heat := maxf(alert, 0.28 + phase * 0.1)
	var rack := rig.get_node_or_null("AntlerRack") as Node3D
	if rack != null:
		rack.position.y = pack_heat * 0.08
		rack.scale = Vector3(1.0 + pack_heat * 0.12, 1.0 + pack_heat * 0.22, 1.0)
		rack.rotation_degrees.z = sin(timer * 4.0) * (5.0 + phase * 2.0)
	var shell := rig.get_node_or_null("ShoulderShell") as MeshInstance3D
	if shell != null:
		shell.position.y = 0.84 + maxf(alert, 0.2) * 0.12
		shell.rotation_degrees.x = -maxf(alert, 0.2) * 18.0


static func _find_rig(node: Variant) -> Node3D:
	var root := node as Node3D
	if root == null:
		return null
	return root.find_child("EnemySilhouette", true, false) as Node3D
