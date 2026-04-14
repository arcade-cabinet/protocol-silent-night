extends RefCounted
class_name EnemyStageMarks

const ALERT_STATES := ["prep_slam", "burst", "slam", "surge", "contact"]


static func attach_enemy_markers(root: Node3D, _materials: RefCounted, color: Color, scale_value: float, enemy_type: String) -> void:
	var marks := Node3D.new()
	marks.name = "ThreatMarks"
	marks.add_child(_disc("ThreatDisc", color, scale_value * 2.1, 0.16, 1.0))
	marks.add_child(_ring("ThreatRing", color, scale_value * 0.7, 0.08, 2.1))
	marks.add_child(_ring("ThreatAccent", _accent_for(enemy_type), scale_value * 1.0, 0.06, 1.6))
	var spikes := _spikes(_accent_for(enemy_type), scale_value * 1.32)
	spikes.visible = false
	marks.add_child(spikes)
	root.add_child(marks)


static func attach_boss_markers(root: Node3D, _materials: RefCounted, color: Color) -> void:
	var marks := Node3D.new()
	marks.name = "ThreatMarks"
	marks.add_child(_disc("ThreatDisc", Color("3a0812"), 5.9, 0.24, 1.1))
	marks.add_child(_ring("ThreatRing", color, 1.95, 0.12, 2.7))
	marks.add_child(_ring("ThreatAccent", Color("ffd86e"), 2.45, 0.08, 1.9))
	for idx in range(4):
		var flare := MeshInstance3D.new()
		flare.name = "ThreatFlare%d" % idx
		var sphere := SphereMesh.new()
		sphere.radius = 0.12
		sphere.height = 0.24
		flare.mesh = sphere
		var angle := float(idx) * PI * 0.5
		flare.position = Vector3(cos(angle) * 2.45, 0.08, sin(angle) * 2.45)
		flare.material_override = _emissive_material(Color("ffd86e"), 0.9, 2.4)
		marks.add_child(flare)
	root.add_child(marks)


static func update_enemy_markers(enemy: Dictionary) -> void:
	var marks := enemy["node"].get_node_or_null("ThreatMarks") as Node3D
	if marks == null:
		return
	var refs := _marker_refs(marks)
	var enemy_type := String(enemy.get("id", "grunt"))
	var timer := float(enemy.get("behavior_timer", 0.0))
	var phase_level := int(enemy.get("phase_level", 1))
	var pulse := 0.9 + sin(timer * 6.2 + float(enemy.get("enemy_uid", 0)) * 0.2) * 0.1
	var alert := 1.0 if bool(enemy.get("telegraphed", false)) or String(enemy.get("behavior_state", "")) in ALERT_STATES else 0.0
	if enemy_type == "bumble":
		alert = maxf(alert, 0.35)
	marks.rotation.y = timer * (0.45 + phase_level * 0.08)
	marks.scale = Vector3.ONE * (1.0 + float(phase_level - 1) * 0.06)
	_style_mesh(refs["disc"], _base_color(enemy), 0.16 + alert * 0.22 + phase_level * 0.02, 1.05 + alert * 0.8)
	var ring := refs["ring"] as MeshInstance3D
	ring.scale = Vector3.ONE * (1.0 + alert * 0.42 + pulse * 0.12)
	_style_mesh(ring, _base_color(enemy), 0.78, 1.9 + alert * 1.0 + phase_level * 0.16)
	var accent := refs["accent"] as MeshInstance3D
	accent.visible = phase_level > 1 or alert > 0.0 or enemy_type in ["tank", "elf", "santa", "bumble", "rusher"]
	accent.scale = Vector3.ONE * (1.0 + alert * 0.28 + pulse * 0.08)
	_style_mesh(accent, _accent_for(enemy_type), 0.78, 1.45 + alert * 1.0 + phase_level * 0.12)
	var spikes := refs["spikes"] as Node3D
	spikes.visible = alert > 0.0
	spikes.rotation.y = timer * 4.8
	spikes.scale = Vector3.ONE * (1.0 + alert * 0.46 + pulse * 0.12)
	_style_meshes(spikes, _accent_for(enemy_type), 0.9, 2.45 + alert * 1.25)


static func update_boss_markers(boss_ref: Dictionary, phase: int) -> void:
	if boss_ref.is_empty():
		return
	var marks := boss_ref["node"].get_node_or_null("ThreatMarks") as Node3D
	if marks == null:
		return
	var refs := _marker_refs(marks)
	var pulse := 0.92 + sin(float(boss_ref.get("attack_timer", 0.0)) * 7.2) * 0.08
	_style_mesh(refs["disc"], Color("3a0812"), 0.24 + phase * 0.05, 1.0 + phase * 0.35)
	var ring := refs["ring"] as MeshInstance3D
	ring.scale = Vector3.ONE * (1.0 + phase * 0.08 + pulse * 0.06)
	_style_mesh(ring, Color(boss_ref.get("color", Color("ff2244"))), 0.84, 2.6 + phase * 0.35)
	var accent := refs["accent"] as MeshInstance3D
	accent.visible = phase >= 2
	accent.scale = Vector3.ONE * (1.0 + phase * 0.12 + pulse * 0.04)
	_style_mesh(accent, Color("ffd86e"), 0.84, 1.9 + phase * 0.45)
	for idx in range(4):
		var flare := refs["flares"][idx] as MeshInstance3D
		flare.visible = idx < phase + 1
		flare.scale = Vector3.ONE * (1.0 + phase * 0.12 + pulse * 0.06)
		_style_mesh(flare, Color("ffd86e"), 0.95, 2.2 + phase * 0.5)


static func _marker_refs(marks: Node3D) -> Dictionary:
	if marks.has_meta("marker_refs"):
		return marks.get_meta("marker_refs") as Dictionary
	var refs := {
		"disc": marks.get_node_or_null("ThreatDisc"),
		"ring": marks.get_node_or_null("ThreatRing"),
		"accent": marks.get_node_or_null("ThreatAccent"),
		"spikes": marks.get_node_or_null("ThreatSpikes"),
		"flares": [],
	}
	for idx in range(4):
		refs["flares"].append(marks.get_node_or_null("ThreatFlare%d" % idx))
	marks.set_meta("marker_refs", refs)
	return refs


static func _disc(name: String, color: Color, radius: float, alpha: float, energy: float) -> MeshInstance3D:
	var disc := MeshInstance3D.new()
	disc.name = name
	var mesh := PlaneMesh.new()
	mesh.size = Vector2.ONE * radius * 2.0
	disc.mesh = mesh
	disc.rotation_degrees.x = -90.0
	disc.position.y = 0.04
	disc.material_override = _emissive_material(color, alpha, energy)
	return disc


static func _ring(name: String, color: Color, outer_radius: float, inner_radius: float, energy: float) -> MeshInstance3D:
	var ring := MeshInstance3D.new()
	ring.name = name
	var torus := TorusMesh.new()
	torus.outer_radius = outer_radius
	torus.inner_radius = inner_radius
	ring.mesh = torus
	ring.rotation_degrees.x = 90.0
	ring.position.y = 0.06
	ring.material_override = _emissive_material(color, 0.72, energy)
	return ring


static func _spikes(color: Color, radius: float) -> Node3D:
	var root := Node3D.new()
	root.name = "ThreatSpikes"
	for idx in range(4):
		var spoke := MeshInstance3D.new()
		spoke.name = "ThreatSpike%d" % idx
		var box := BoxMesh.new()
		box.size = Vector3(0.16, 0.04, 0.95)
		spoke.mesh = box
		var angle := float(idx) * PI * 0.5 + PI * 0.25
		spoke.position = Vector3(cos(angle) * radius, 0.03, sin(angle) * radius)
		spoke.rotation_degrees = Vector3(0.0, rad_to_deg(angle), 0.0)
		spoke.material_override = _emissive_material(color, 0.82, 2.0)
		root.add_child(spoke)
	return root


static func _style_mesh(node: Node, color: Color, alpha: float, energy: float) -> void:
	var mesh := node as MeshInstance3D
	if mesh == null:
		return
	var mat := mesh.material_override as StandardMaterial3D
	if mat == null:
		return
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.emission = color
	mat.emission_energy_multiplier = energy


static func _style_meshes(root: Node3D, color: Color, alpha: float, energy: float) -> void:
	for child in root.get_children():
		_style_mesh(child, color, alpha, energy)


static func _emissive_material(color: Color, alpha: float, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.no_depth_test = true
	mat.albedo_color = Color(color.r, color.g, color.b, alpha)
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	return mat


static func _base_color(enemy: Dictionary) -> Color:
	return Color(enemy.get("color", Color("ffffff")))


static func _accent_for(enemy_type: String) -> Color:
	match enemy_type:
		"grunt":
			return Color("ff4c67")
		"rusher":
			return Color("ff7a2d")
		"tank":
			return Color("ffb14d")
		"elf":
			return Color("88ff22")
		"santa":
			return Color("ffd86e")
		"bumble":
			return Color("69d6ff")
		_:
			return Color("ffffff")
