extends RefCounted
## Builds and updates a SubViewport that renders a rotating 3D present preview.
## Returns null (and no-ops on update) when running headless.

const AUTO_ROTATE := preload("res://scripts/auto_rotate.gd")
const FACTORY_SCRIPT := preload("res://scripts/present_factory.gd")

static var _factory: PresentFactory = null


static func build(parent: Control) -> SubViewport:
	if DisplayServer.get_name() == "headless":
		return null
	var container := SubViewportContainer.new()
	container.name = "PresentPreviewContainer"
	container.custom_minimum_size = Vector2(200.0, 200.0)
	container.stretch = true
	container.anchor_left = 1.0
	container.anchor_right = 1.0
	container.anchor_top = 0.0
	container.anchor_bottom = 0.0
	container.offset_left = -210.0
	container.offset_right = -10.0
	container.offset_top = 10.0
	container.offset_bottom = 210.0
	parent.add_child(container)
	var vp := SubViewport.new()
	vp.name = "PresentPreview"
	vp.size = Vector2i(200, 200)
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	vp.transparent_bg = true
	container.add_child(vp)
	var cam := Camera3D.new()
	cam.look_at_from_position(Vector3(0.0, 1.5, 3.0), Vector3(0.0, 0.5, 0.0), Vector3.UP)
	vp.add_child(cam)
	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-45.0, 30.0, 0.0)
	vp.add_child(light)
	var mesh_root := Node3D.new()
	mesh_root.name = "MeshRoot"
	vp.add_child(mesh_root)
	return vp


static func update_present(vp: SubViewport, def: Dictionary) -> void:
	if vp == null:
		return
	var mesh_root: Node3D = vp.get_node_or_null("MeshRoot")
	if mesh_root == null:
		return
	for child in mesh_root.get_children():
		child.queue_free()
	if _factory == null:
		_factory = FACTORY_SCRIPT.new()
	var mesh: Node3D = _factory.build_present(def)
	var spinner := AUTO_ROTATE.new()
	mesh.add_child(spinner)
	mesh_root.add_child(mesh)
