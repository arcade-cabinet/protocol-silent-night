extends RefCounted

## Builds a mini SubViewport-based 3D preview of a gear item for the
## market screen. Reuses gear_visualizer against a throwaway GearSystem
## so the preview is visually identical to what equipping the item
## produces on the player.

const GEAR_VIZ := preload("res://scripts/gear_visualizer.gd")

const PREVIEW_SIZE := Vector2i(200, 140)


static func build_preview(item: Dictionary) -> SubViewportContainer:
	var container := SubViewportContainer.new()
	container.stretch = true
	container.custom_minimum_size = Vector2(PREVIEW_SIZE)
	var viewport := SubViewport.new()
	viewport.size = PREVIEW_SIZE
	viewport.own_world_3d = true
	viewport.transparent_bg = true
	viewport.msaa_3d = Viewport.MSAA_4X
	container.add_child(viewport)
	var scene := Node3D.new()
	viewport.add_child(scene)
	_add_camera(scene)
	_add_lights(scene)
	_add_placeholder_body(scene, item)
	var gs := GearSystem.new()
	var item_copy: Dictionary = item.duplicate(true)
	gs.equip(item_copy)
	GEAR_VIZ.attach(scene, gs)
	return container


static func _add_camera(scene: Node3D) -> void:
	var cam := Camera3D.new()
	cam.fov = 40.0
	scene.add_child(cam)
	cam.look_at_from_position(Vector3(1.1, 1.8, 2.3), Vector3(0, 0.9, 0), Vector3.UP)


static func _add_lights(scene: Node3D) -> void:
	var key := DirectionalLight3D.new()
	key.rotation_degrees = Vector3(-45, -35, 0)
	key.light_energy = 1.4
	scene.add_child(key)
	var fill := DirectionalLight3D.new()
	fill.rotation_degrees = Vector3(-20, 120, 0)
	fill.light_energy = 0.5
	fill.light_color = Color("#ccccff")
	scene.add_child(fill)


static func _add_placeholder_body(scene: Node3D, item: Dictionary) -> void:
	var body := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(1.0, 1.1, 0.9)
	body.mesh = box
	body.position = Vector3(0, 0.55, 0)
	var mat := StandardMaterial3D.new()
	var rarity_info: Dictionary = GearSystem.RARITIES.get(int(item.get("rarity", 1)), {})
	var rarity_color := Color(String(rarity_info.get("color", "#ffffff")))
	mat.albedo_color = rarity_color.darkened(0.5)
	mat.metallic = 0.2
	mat.roughness = 0.5
	body.material_override = mat
	scene.add_child(body)
	var bow_inst := MeshInstance3D.new()
	var bow_mesh := TorusMesh.new()
	bow_mesh.outer_radius = 0.22; bow_mesh.inner_radius = 0.06
	bow_inst.mesh = bow_mesh
	bow_inst.position = Vector3(0, 1.15, 0)
	bow_inst.rotation_degrees = Vector3(90, 0, 0)
	var bow_mat := StandardMaterial3D.new()
	bow_mat.albedo_color = rarity_color
	bow_mat.emission_enabled = true
	bow_mat.emission = rarity_color
	bow_mat.emission_energy_multiplier = 0.8
	bow_inst.material_override = bow_mat
	scene.add_child(bow_inst)
