extends RefCounted
class_name PresentFactory

## Assembles 3D present characters from definition parameters.
## Delegates body part assembly to PresentParts and face rendering
## to PresentFaceRenderer. The wrapping paper shader takes
## color/pattern/metallic uniforms.

const WRAPPING_SHADER_PATH := "res://shaders/wrapping_paper.gdshader"
const FACE_RENDERER := preload("res://scripts/present_face_renderer.gd")
const BODY_FACTORY := preload("res://scripts/present_body_factory.gd")

var _shader: Shader = null
var _face_renderer := FACE_RENDERER.new()


func build_present(definition: Dictionary) -> Node3D:
	var root := Node3D.new()
	root.name = "Present_%s" % definition.get("id", "unknown")
	var box_w: float = float(definition.get("box_width", 1.0))
	var box_h: float = float(definition.get("box_height", 1.2))
	var box_d: float = float(definition.get("box_depth", 0.9))
	var shape: String = String(definition.get("body_shape", "box"))
	var material: Material = _make_wrapping_material(definition)
	var rig: Dictionary = BODY_FACTORY.build(shape, definition, box_w, box_h, box_d, material)
	var body_node: Node3D = rig["root"]
	body_node.name = "Body"
	root.add_child(body_node)
	var sockets: Dictionary = rig["sockets"]
	var anatomy: Array = rig["anatomy"]
	var arm_style: String = String(rig.get("arm_style", "stiff"))
	var leg_style: String = String(rig.get("leg_style", "standard"))
	if "arms" in anatomy:
		PresentParts.attach_arms_at(root, definition, sockets["arm_left"], sockets["arm_right"], arm_style)
	if "legs" in anatomy:
		PresentParts.attach_legs_at(root, definition, sockets["leg_left"], sockets["leg_right"], leg_style)
	if "face" in anatomy:
		PresentParts.attach_face_at(root, definition, sockets["face"])
	if "bow" in anatomy:
		PresentParts.attach_bow_at(root, definition, sockets["bow"], box_w)
	if "topper" in anatomy:
		PresentParts.attach_topper(root, definition, sockets["topper"])
	PresentParts.attach_accessory(root, definition, box_w, box_h, box_d)
	PresentParts.attach_shadow(root, box_w, box_d)
	root.set_meta("idle_style", String(rig.get("idle_style", "bounce")))
	return root


func _get_shader() -> Shader:
	if _shader != null:
		return _shader
	_shader = load(WRAPPING_SHADER_PATH) as Shader
	return _shader


func _make_wrapping_material(def: Dictionary) -> Material:
	var shader := _get_shader()
	if shader == null:
		var flat := StandardMaterial3D.new()
		flat.albedo_color = Color(def.get("base_color", "#d6365a"))
		return flat
	var mat := ShaderMaterial.new()
	mat.shader = shader
	mat.set_shader_parameter("base_color", Color(def.get("base_color", "#d6365a")))
	mat.set_shader_parameter("pattern_color", Color(def.get("pattern_color", "#ffd700")))
	mat.set_shader_parameter("pattern_type", int(def.get("pattern_type", 1)))
	mat.set_shader_parameter("pattern_scale", float(def.get("pattern_scale", 4.0)))
	mat.set_shader_parameter("metallic", float(def.get("metallic", 0.15)))
	mat.set_shader_parameter("roughness", float(def.get("roughness", 0.55)))
	return mat
