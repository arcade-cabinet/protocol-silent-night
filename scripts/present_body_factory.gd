extends RefCounted

## 6-variant procedural body factory. Each shape returns a RIG dict:
##   {
##     root: Node3D,             # the body mesh subtree
##     sockets: Dictionary,      # named attachment points for anatomy
##     anatomy: Array[String],   # which parts to actually render
##     idle_style: String,       # bounce / hop / wobble / sway / spin
##     arm_style: String,        # stiff / wavy
##     leg_style: String,        # standard / short / none
##   }
##
## Rig is consumed by PresentFactory which delegates anatomy attachment
## to PresentParts at the specified socket positions.


static func build(shape: String, def: Dictionary, w: float, h: float, d: float, material: Material) -> Dictionary:
	match shape:
		"cube": return _cube_rig(def, w, h, d, material)
		"tall_rect": return _tall_rect_rig(def, w, h, d, material)
		"stacked_duo": return _stacked_duo_rig(def, w, h, d, material)
		"cylinder": return _cylinder_rig(def, w, h, d, material)
		"gift_bag": return _gift_bag_rig(def, w, h, d, material)
	return _box_rig(def, w, h, d, material)


static func _box_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var root := Node3D.new()
	_box_mesh(root, Vector3(w, h, d), Vector3(0, h * 0.5, 0), mat)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(w * 0.5 + 0.2), h * 0.45, 0),
			"arm_right": Vector3(w * 0.5 + 0.2, h * 0.45, 0),
			"leg_left": Vector3(-w * 0.22, -0.12, 0),
			"leg_right": Vector3(w * 0.22, -0.12, 0),
			"face": Vector3(0, h * 0.52, d * 0.5 + 0.015),
			"bow": Vector3(0, h + 0.08, 0),
			"topper": Vector3(0, h + 0.22, 0),
		},
		"anatomy": ["arms", "legs", "face", "bow", "topper"],
		"idle_style": "bounce", "arm_style": "stiff", "leg_style": "standard",
	}


static func _cube_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var side: float = (w + h + d) / 3.0
	var root := Node3D.new()
	_box_mesh(root, Vector3(side, side, side), Vector3(0, side * 0.5, 0), mat)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(side * 0.5 + 0.2), side * 0.48, 0),
			"arm_right": Vector3(side * 0.5 + 0.2, side * 0.48, 0),
			"leg_left": Vector3(-side * 0.22, -0.12, 0),
			"leg_right": Vector3(side * 0.22, -0.12, 0),
			"face": Vector3(0, side * 0.55, side * 0.5 + 0.015),
			"bow": Vector3(0, side + 0.08, 0),
			"topper": Vector3(0, side + 0.22, 0),
		},
		"anatomy": ["arms", "legs", "face", "bow", "topper"],
		"idle_style": "bounce", "arm_style": "stiff", "leg_style": "standard",
	}


static func _tall_rect_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var th: float = h * 1.45
	var tw: float = w * 0.85
	var td: float = d * 0.85
	var root := Node3D.new()
	_box_mesh(root, Vector3(tw, th, td), Vector3(0, th * 0.5, 0), mat)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(tw * 0.5 + 0.18), th * 0.55, 0),
			"arm_right": Vector3(tw * 0.5 + 0.18, th * 0.55, 0),
			"leg_left": Vector3(-tw * 0.22, -0.12, 0),
			"leg_right": Vector3(tw * 0.22, -0.12, 0),
			"face": Vector3(0, th * 0.62, td * 0.5 + 0.015),
			"bow": Vector3(0, th + 0.08, 0),
			"topper": Vector3(0, th + 0.22, 0),
		},
		"anatomy": ["arms", "legs", "face", "bow", "topper"],
		"idle_style": "sway", "arm_style": "stiff", "leg_style": "standard",
	}


static func _stacked_duo_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var root := Node3D.new()
	_box_mesh(root, Vector3(w, h * 0.55, d), Vector3(0, h * 0.275, 0), mat)
	var top_y: float = h * 0.55 + h * 0.24
	_box_mesh(root, Vector3(w * 0.7, h * 0.48, d * 0.7), Vector3(0, top_y, 0), mat)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(w * 0.5 + 0.18), h * 0.35, 0),
			"arm_right": Vector3(w * 0.5 + 0.18, h * 0.35, 0),
			"leg_left": Vector3(-w * 0.22, -0.12, 0),
			"leg_right": Vector3(w * 0.22, -0.12, 0),
			"face": Vector3(0, top_y + h * 0.05, d * 0.36),
			"bow": Vector3(0, top_y + h * 0.28, 0),
			"topper": Vector3(0, top_y + h * 0.42, 0),
		},
		"anatomy": ["arms", "legs", "face", "bow", "topper"],
		"idle_style": "wobble", "arm_style": "stiff", "leg_style": "short",
	}


static func _cylinder_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var radius: float = (w + d) * 0.28
	var root := Node3D.new()
	var inst := MeshInstance3D.new()
	var mesh := CylinderMesh.new()
	mesh.top_radius = radius; mesh.bottom_radius = radius; mesh.height = h
	inst.mesh = mesh
	inst.position = Vector3(0, h * 0.5, 0)
	inst.material_override = mat
	root.add_child(inst)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(radius + 0.16), h * 0.5, 0),
			"arm_right": Vector3(radius + 0.16, h * 0.5, 0),
			"leg_left": Vector3(-radius * 0.55, -0.1, 0),
			"leg_right": Vector3(radius * 0.55, -0.1, 0),
			"face": Vector3(0, h * 0.55, radius + 0.01),
			"bow": Vector3(0, h + 0.08, 0),
			"topper": Vector3(0, h + 0.22, 0),
		},
		"anatomy": ["arms", "legs", "face", "bow", "topper"],
		"idle_style": "bounce", "arm_style": "stiff", "leg_style": "short",
	}


static func _gift_bag_rig(def: Dictionary, w: float, h: float, d: float, mat: Material) -> Dictionary:
	var radius: float = (w + d) * 0.3
	var root := Node3D.new()
	var body := MeshInstance3D.new()
	var body_mesh := CylinderMesh.new()
	body_mesh.top_radius = radius * 0.78; body_mesh.bottom_radius = radius; body_mesh.height = h * 0.95
	body.mesh = body_mesh
	body.position = Vector3(0, h * 0.47, 0)
	body.material_override = mat
	root.add_child(body)
	var cinch := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = radius * 0.85; torus.inner_radius = radius * 0.55
	cinch.mesh = torus
	cinch.position = Vector3(0, h * 0.92, 0)
	var cinch_color := Color(String(def.get("bow_color", "#ffd700")))
	var cinch_mat := StandardMaterial3D.new()
	cinch_mat.albedo_color = cinch_color; cinch_mat.emission_enabled = true
	cinch_mat.emission = cinch_color; cinch_mat.emission_energy_multiplier = 1.4
	cinch.material_override = cinch_mat
	root.add_child(cinch)
	return {
		"root": root,
		"sockets": {
			"arm_left": Vector3(-(radius * 0.9 + 0.12), h * 0.4, 0),
			"arm_right": Vector3(radius * 0.9 + 0.12, h * 0.4, 0),
			"leg_left": Vector3.ZERO, "leg_right": Vector3.ZERO,
			"face": Vector3(0, h * 0.55, radius * 0.85 + 0.01),
			"bow": Vector3(0, h * 0.92, 0),
			"topper": Vector3(0, h * 1.05, 0),
		},
		"anatomy": ["arms", "face", "bow", "topper"],
		"idle_style": "hop", "arm_style": "wavy", "leg_style": "none",
	}


static func _box_mesh(root: Node3D, size: Vector3, pos: Vector3, mat: Material) -> void:
	var inst := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	inst.mesh = mesh
	inst.position = pos
	inst.material_override = mat
	root.add_child(inst)
