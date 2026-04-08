extends RefCounted

const LIFE := 0.6
const FADE_START := 0.4
const RISE_SPEED := 2.5
const BASE_FONT_SIZE := 24
const CRIT_FONT_SIZE := 32
const CRIT_PULSE_TIME := 0.12
const CRIT_PULSE_SCALE := 1.35

var _entries: Array = []


func spawn(root: Node3D, world_position: Vector3, amount: float, color: Color, is_crit: bool = false) -> void:
	if root == null:
		return
	var label := Label3D.new()
	label.text = str(int(round(amount)))
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.no_depth_test = true
	label.fixed_size = true
	label.pixel_size = 0.008
	label.outline_size = 6
	label.outline_modulate = Color(0.0, 0.0, 0.0, 0.85)
	label.font_size = CRIT_FONT_SIZE if is_crit else BASE_FONT_SIZE
	label.modulate = color
	var jitter_seed := int(amount * 13.0) % 7
	label.position = world_position + Vector3(float(jitter_seed - 3) * 0.08, 0.0, float(jitter_seed % 3 - 1) * 0.08)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	root.add_child(label)
	_entries.append({
		"node": label,
		"life": LIFE,
		"is_crit": is_crit,
		"base_color": color
	})


func update(delta: float) -> void:
	for index in range(_entries.size() - 1, -1, -1):
		var entry: Dictionary = _entries[index]
		entry["life"] = float(entry["life"]) - delta
		var life: float = entry["life"]
		var node: Label3D = entry["node"]
		if life <= 0.0 or node == null or not is_instance_valid(node):
			if node != null and is_instance_valid(node):
				node.queue_free()
			_entries.remove_at(index)
			continue
		node.position.y += RISE_SPEED * delta
		var elapsed := LIFE - life
		var alpha := 1.0
		if life < FADE_START:
			alpha = clampf(life / FADE_START, 0.0, 1.0)
		var base_color: Color = entry["base_color"]
		node.modulate = Color(base_color.r, base_color.g, base_color.b, alpha)
		if bool(entry["is_crit"]) and elapsed < CRIT_PULSE_TIME:
			var pulse_t := elapsed / CRIT_PULSE_TIME
			var scale_factor := lerpf(CRIT_PULSE_SCALE, 1.0, pulse_t)
			node.scale = Vector3.ONE * scale_factor
		else:
			node.scale = Vector3.ONE
		_entries[index] = entry


func clear() -> void:
	for entry in _entries:
		var node: Label3D = entry["node"]
		if node != null and is_instance_valid(node):
			node.queue_free()
	_entries.clear()
