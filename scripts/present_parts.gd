extends RefCounted
class_name PresentParts

## Assembles body parts for a present character: bow, arms, legs,
## face socket, shadow, topper, accessory. Socket-aware: each attach
## takes an explicit world-space position from the body rig so
## alternate body shapes (gift_bag, stacked_duo, cylinder) anchor
## anatomy in the right place instead of against fixed box dimensions.

const FACE_RENDERER := preload("res://scripts/present_face_renderer.gd")
const TOPPER_MESHES := preload("res://scripts/present_topper_meshes.gd")
const ACCESSORY_MESHES := preload("res://scripts/present_accessory_meshes.gd")
static var _face_renderer: RefCounted


static func attach_bow_at(root: Node3D, def: Dictionary, pos: Vector3, width: float) -> void:
	var bow_color := Color(def.get("bow_color", "#ffd700"))
	var bow := Node3D.new()
	bow.name = "Bow"
	bow.position = pos
	var ribbon_h := _box(Vector3(width * 0.85, 0.06, 0.12), _emissive(bow_color, 1.3))
	bow.add_child(ribbon_h)
	var ribbon_v := _box(Vector3(0.12, 0.06, width * 0.75), _emissive(bow_color, 1.3))
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


static func attach_arms_at(root: Node3D, def: Dictionary, left_pos: Vector3, right_pos: Vector3, style: String = "stiff") -> void:
	var arm_color := Color(def.get("arm_color", "#ffffff"))
	var length: float = float(def.get("arm_length", 0.5))
	var thick: float = float(def.get("arm_thickness", 0.08))
	var positions: Array = [left_pos, right_pos]
	for i in range(2):
		var sign_x: float = -1.0 if i == 0 else 1.0
		var arm: MeshInstance3D = _cyl(thick * 0.8, thick, length, _flat(arm_color))
		if style == "wavy":
			arm.rotation_degrees = Vector3(0, 0, sign_x * 55 + sign_x * 20)
			var wav_offset: Vector3 = positions[i] + Vector3(sign_x * 0.05, 0.02, 0)
			arm.position = wav_offset
		else:
			arm.rotation_degrees = Vector3(0, 0, sign_x * 75)
			arm.position = positions[i]
		root.add_child(arm)
		var hand := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = thick * 1.4
		sphere.height = thick * 2.8
		hand.mesh = sphere
		hand.position = positions[i] + Vector3(sign_x * (length * 0.25), -length * 0.1, 0)
		hand.material_override = _flat(arm_color)
		root.add_child(hand)


static func attach_legs_at(root: Node3D, def: Dictionary, left_pos: Vector3, right_pos: Vector3, style: String = "standard") -> void:
	if style == "none":
		return
	var leg_color := Color(def.get("leg_color", "#333333"))
	var length: float = float(def.get("leg_length", 0.35))
	if style == "short":
		length *= 0.6
	var thick: float = float(def.get("leg_thickness", 0.1))
	var positions: Array = [left_pos, right_pos]
	for i in range(2):
		var sign_x: float = -1.0 if i == 0 else 1.0
		var leg: MeshInstance3D = _cyl(thick, thick * 1.2, length, _flat(leg_color))
		leg.position = positions[i] + Vector3(0, -length * 0.4, 0)
		root.add_child(leg)
		var foot: MeshInstance3D = _box(Vector3(thick * 2.2, 0.08, thick * 3.0), _flat(leg_color))
		foot.position = positions[i] + Vector3(0, -length * 0.82, thick * 0.5)
		root.add_child(foot)


static func attach_face_at(root: Node3D, def: Dictionary, pos: Vector3) -> void:
	if _face_renderer == null:
		_face_renderer = FACE_RENDERER.new()
	var expression: String = def.get("expression", "determined")
	var face := MeshInstance3D.new()
	face.name = "Face"
	var quad := QuadMesh.new()
	quad.size = Vector2(0.7, 0.5)
	face.mesh = quad
	face.position = pos
	face.material_override = _face_renderer.face_material(expression)
	face.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	root.add_child(face)


static func attach_topper(root: Node3D, def: Dictionary, topper_pos: Vector3) -> void:
	var kind: String = String(def.get("topper", "none"))
	if kind == "none":
		return
	var tint := Color(String(def.get("bow_color", "#ffd700")))
	var topper: Node3D = TOPPER_MESHES.build(kind, tint)
	topper.position = topper_pos
	root.add_child(topper)


static func attach_accessory(root: Node3D, def: Dictionary, w: float, h: float, d: float) -> void:
	var kind: String = String(def.get("accessory", "none"))
	if kind == "none":
		return
	var node: Node3D = ACCESSORY_MESHES.build(kind, def, w, h, d)
	root.add_child(node)


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
