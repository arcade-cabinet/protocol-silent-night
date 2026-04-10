extends RefCounted

## Attaches visual representations of equipped gear + flair to a present
## visual root. Pure compositional: reads gear_system.equipped (via
## gear_system.get("equipped")) and builds meshes per slot + per flair
## piece. Called once at spawn.

const FLAIR_VIZ := preload("res://scripts/gear_flair_visualizer.gd")

const SLOT_OFFSETS := {
	"weapon_mod": Vector3(0.0, 1.35, 0.45),
	"wrapping_upgrade": Vector3(0.0, 0.55, 0.0),
	"bow_accessory": Vector3(0.0, 1.55, 0.0),
	"tag_charm": Vector3(0.45, 0.6, 0.45),
}


static func attach(visual: Node3D, gear_system: RefCounted, animator: Node = null) -> void:
	if visual == null or gear_system == null:
		return
	var slots: Variant = gear_system.get("equipped")
	if not (slots is Dictionary):
		return
	var y_stack: float = 1.75
	for slot in slots.keys():
		var raw_item: Variant = slots[slot]
		if not (raw_item is Dictionary):
			continue
		var item: Dictionary = raw_item
		if item.is_empty():
			continue
		_attach_slot(visual, slot, item)
		y_stack = FLAIR_VIZ.attach_flair(visual, item.get("flair", []), y_stack, animator)


static func _attach_slot(visual: Node3D, slot: String, item: Dictionary) -> void:
	var offset: Vector3 = SLOT_OFFSETS.get(slot, Vector3.ZERO)
	var tint := Color(String(item.get("color", "#ffffff")))
	var node := Node3D.new()
	node.name = "Gear_%s" % slot
	node.position = offset
	visual.add_child(node)
	match slot:
		"weapon_mod": _build_weapon_mod(node, tint)
		"wrapping_upgrade": _build_wrapping_band(node, tint)
		"bow_accessory": _build_bow_embellishment(node, tint)
		"tag_charm": _build_tag_charm(node, tint)


static func _build_weapon_mod(node: Node3D, tint: Color) -> void:
	var barrel := MeshInstance3D.new()
	var cyl := CylinderMesh.new()
	cyl.top_radius = 0.08; cyl.bottom_radius = 0.1; cyl.height = 0.4
	barrel.mesh = cyl
	barrel.rotation_degrees = Vector3(90, 0, 0)
	barrel.material_override = _emissive_mat(tint, 1.6)
	node.add_child(barrel)


static func _build_wrapping_band(node: Node3D, tint: Color) -> void:
	var band := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 0.7; torus.inner_radius = 0.6
	band.mesh = torus
	band.rotation_degrees = Vector3(90, 0, 0)
	band.material_override = _emissive_mat(tint, 1.0)
	node.add_child(band)


static func _build_bow_embellishment(node: Node3D, tint: Color) -> void:
	var bow := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 0.22; torus.inner_radius = 0.05
	bow.mesh = torus
	bow.material_override = _emissive_mat(tint, 1.8)
	node.add_child(bow)


static func _build_tag_charm(node: Node3D, tint: Color) -> void:
	var tag := MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(0.35, 0.2)
	tag.mesh = quad
	tag.rotation_degrees = Vector3(0, 0, 15)
	var mat := _emissive_mat(tint, 0.6)
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	tag.material_override = mat
	node.add_child(tag)


static func _emissive_mat(color: Color, intensity: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = intensity
	return mat
