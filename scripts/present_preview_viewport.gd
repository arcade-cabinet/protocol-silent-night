extends RefCounted
## Builds and updates a SubViewport that renders a rotating 3D present preview.
## Returns null (and no-ops on update) when running headless.

const AUTO_ROTATE := preload("res://scripts/auto_rotate.gd")
const FACTORY_SCRIPT := preload("res://scripts/present_factory.gd")

static var _factory: PresentFactory = null
static var _spin_enabled := true


static func set_spin_enabled(enabled: bool) -> void:
	_spin_enabled = enabled


static func build(parent: Control) -> SubViewport:
	if DisplayServer.get_name() == "headless":
		return null
	var container := SubViewportContainer.new()
	container.name = "PresentPreviewContainer"
	container.stretch = true
	container.mouse_filter = Control.MOUSE_FILTER_IGNORE
	container.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	parent.add_child(container)
	var vp := SubViewport.new()
	vp.name = "PresentPreview"
	vp.size = Vector2i(320, 220)
	vp.own_world_3d = true
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS if _spin_enabled else SubViewport.UPDATE_ONCE
	vp.transparent_bg = true
	container.add_child(vp)
	var cam := Camera3D.new()
	cam.look_at_from_position(Vector3(0.0, 1.2, 2.4), Vector3(0.0, 0.72, 0.0), Vector3.UP)
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
	mesh.rotation_degrees = Vector3(0.0, -18.0, 0.0)
	if _spin_enabled:
		var spinner := AUTO_ROTATE.new()
		mesh.add_child(spinner)
	mesh_root.add_child(mesh)
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS if _spin_enabled else SubViewport.UPDATE_ONCE
