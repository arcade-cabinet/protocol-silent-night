extends RefCounted

## Procedural scroll pickup — parchment QuadMesh body + CylinderMesh rolls.
## Naughty = dark red/black, Nice = gold/parchment.

var materials: RefCounted
var pixels: RefCounted


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_scroll(pickup_root: Node3D, pickups: Array,
		world_position: Vector3, rng: RandomNumberGenerator) -> Dictionary:
	var is_nice: bool = rng.randf() < 0.6
	var scroll_type: String = "nice" if is_nice else "naughty"
	var body_color := Color("f5e6c8") if is_nice else Color("3a1a1a")
	var roll_color := Color("c8a474") if is_nice else Color("1a0808")
	var accent := Color("ffd700") if is_nice else Color("ff2244")
	var node := Node3D.new()
	node.name = "Scroll_%s" % scroll_type
	_build_visual(node, body_color, roll_color, accent)
	node.position = world_position + Vector3(0, 0.3, 0)
	pickup_root.add_child(node)
	var entry := {
		"node": node,
		"type": "scroll",
		"scroll_type": scroll_type,
		"value": 0,
		"base_y": node.position.y,
		"phase": rng.randf() * TAU,
		"time": 0.0,
	}
	pickups.append(entry)
	return entry


func _build_visual(node: Node3D, body_color: Color,
		roll_color: Color, accent: Color) -> void:
	var body := MeshInstance3D.new()
	var quad := QuadMesh.new()
	quad.size = Vector2(0.7, 0.45)
	body.mesh = quad
	body.position = Vector3(0, 0.1, 0)
	var body_mat := StandardMaterial3D.new()
	body_mat.albedo_color = body_color
	body_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	body_mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	body_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	body_mat.emission_enabled = true
	body_mat.emission = accent
	body_mat.emission_energy_multiplier = 0.3
	body.material_override = body_mat
	node.add_child(body)
	for side in [-1.0, 1.0]:
		var roll := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.08
		cyl.bottom_radius = 0.08
		cyl.height = 0.55
		roll.mesh = cyl
		roll.rotation_degrees = Vector3(0, 0, 90)
		roll.position = Vector3(side * 0.38, 0.1, 0)
		var roll_mat := StandardMaterial3D.new()
		roll_mat.albedo_color = roll_color
		roll_mat.emission_enabled = true
		roll_mat.emission = accent
		roll_mat.emission_energy_multiplier = 0.5
		roll.material_override = roll_mat
		node.add_child(roll)
