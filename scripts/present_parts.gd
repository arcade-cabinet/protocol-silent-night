extends RefCounted
class_name PresentParts

## Assembles body parts (bow, arms, legs, shadow) for a present character.

static func attach_bow(root: Node3D, def: Dictionary, w: float, h: float) -> void:
	var bow_color := Color(def.get("bow_color", "#ffd700"))
	var bow := Node3D.new()
	bow.name = "Bow"
	bow.position = Vector3(0, h + 0.08, 0)
	var ribbon_h := _box(Vector3(w * 0.85, 0.06, 0.12), _emissive(bow_color, 1.3))
	bow.add_child(ribbon_h)
	var ribbon_v := _box(Vector3(0.12, 0.06, w * 0.75), _emissive(bow_color, 1.3))
	bow.add_child(ribbon_v)
	for side in [-1.0, 1.0]:
		var loop := MeshInstance3D.new()
		var mesh := TorusMesh.new()
		mesh.outer_radius = 0.16
		mesh.inner_radius = 0.04
		loop.mesh = mesh
		loop.position = Vector3(side * 0.14, 0.1, 0)
		loop.rotation_degrees = Vector3(0, 0, side * 25)
		loop.material_override = _emissive(bow_color, 1.6)
		bow.add_child(loop)
	root.add_child(bow)


static func attach_arms(root: Node3D, def: Dictionary, w: float, h: float) -> void:
	var arm_color := Color(def.get("arm_color", "#ffffff"))
	var length := float(def.get("arm_length", 0.5))
	var thick := float(def.get("arm_thickness", 0.08))
	for side in [-1.0, 1.0]:
		var arm := _cyl(thick * 0.8, thick, length, _flat(arm_color))
		arm.rotation_degrees = Vector3(0, 0, side * 75)
		arm.position = Vector3(side * (w * 0.5 + length * 0.35), h * 0.45, 0)
		root.add_child(arm)
		var hand := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = thick * 1.4
		sphere.height = thick * 2.8
		hand.mesh = sphere
		hand.position = Vector3(side * (w * 0.5 + length * 0.7), h * 0.35, 0)
		hand.material_override = _flat(arm_color)
		root.add_child(hand)


static func attach_legs(root: Node3D, def: Dictionary, w: float) -> void:
	var leg_color := Color(def.get("leg_color", "#333333"))
	var length := float(def.get("leg_length", 0.35))
	var thick := float(def.get("leg_thickness", 0.1))
	for side in [-1.0, 1.0]:
		var leg := _cyl(thick, thick * 1.2, length, _flat(leg_color))
		leg.position = Vector3(side * w * 0.22, -length * 0.4, 0)
		root.add_child(leg)
		var foot := _box(Vector3(thick * 2.2, 0.08, thick * 3.0), _flat(leg_color))
		foot.position = Vector3(side * w * 0.22, -length * 0.82, thick * 0.5)
		root.add_child(foot)


static func attach_shadow(root: Node3D, w: float, d: float) -> void:
	var shadow := MeshInstance3D.new()
	var plane := PlaneMesh.new()
	plane.size = Vector2(w * 1.3, d * 1.3)
	shadow.mesh = plane
	shadow.position = Vector3(0, -0.35, 0)
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_color = Color(0, 0, 0, 0.35)
	shadow.material_override = mat
	root.add_child(shadow)


static func _box(size: Vector3, mat: Material) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	inst.mesh = mesh
	inst.material_override = mat
	return inst


static func _cyl(top: float, bottom: float, height: float, mat: Material) -> MeshInstance3D:
	var inst := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = top
	mesh.bottom_radius = bottom
	mesh.height = height
	inst.mesh = mesh
	inst.material_override = mat
	return inst


static func _flat(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.05
	mat.roughness = 0.45
	return mat


static func _emissive(color: Color, energy: float) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	mat.roughness = 0.2
	return mat
