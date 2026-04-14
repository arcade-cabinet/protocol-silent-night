extends RefCounted

const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

const LABELS: Dictionary = {
	"boss": "AUTO LOCK · KRAMPUS",
	"grunt": "AUTO LOCK · GRUNT",
	"rusher": "AUTO LOCK · RUSHER",
	"tank": "AUTO LOCK · TANK",
	"elf": "AUTO LOCK · ELF",
	"santa": "AUTO LOCK · SANTA",
	"bumble": "AUTO LOCK · BUMBLE",
}


static func build(root: Control) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var layer := Control.new()
	layer.name = "TargetHintLayer"
	layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.z_index = 90
	root.add_child(layer)
	var line := Line2D.new()
	line.width = 3.0
	line.default_color = Color("#69d6ff")
	line.visible = false
	layer.add_child(line)
	var reticle := PanelContainer.new()
	reticle.visible = false
	reticle.mouse_filter = Control.MOUSE_FILTER_IGNORE
	reticle.custom_minimum_size = Vector2(42.0, 42.0)
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.03, 0.08, 0.12, 0.08)
	style.border_color = Color("#69d6ff")
	for side in ["border_width_left", "border_width_top", "border_width_right", "border_width_bottom"]:
		style.set(side, 2)
	for corner in ["corner_radius_top_left", "corner_radius_top_right", "corner_radius_bottom_left", "corner_radius_bottom_right"]:
		style.set(corner, 10)
	reticle.add_theme_stylebox_override("panel", style)
	layer.add_child(reticle)
	var label := Label.new()
	label.visible = false
	label.custom_minimum_size = Vector2(200.0, 18.0)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 12 if bool(layout["is_mobile"]) else 10)
	layer.add_child(label)
	return {"is_mobile": bool(layout["is_mobile"]), "layer": layer, "line": line, "reticle": reticle, "label": label}


static func update(state: Dictionary, camera: Camera3D, player_node: Node3D, target: Dictionary) -> void:
	if state.is_empty() or not bool(state.get("is_mobile", false)):
		_hide(state)
		return
	var target_node: Node3D = target.get("node")
	if camera == null or player_node == null or target_node == null:
		_hide(state)
		return
	if not is_instance_valid(player_node) or not is_instance_valid(target_node):
		_hide(state)
		return
	var target_pos := target_node.global_position + Vector3(0.0, 0.75, 0.0)
	var player_pos := player_node.global_position + Vector3(0.0, 0.45, 0.0)
	if camera.is_position_behind(target_pos) or camera.is_position_behind(player_pos):
		_hide(state)
		return
	var line: Line2D = state["line"]
	var reticle: PanelContainer = state["reticle"]
	var label: Label = state["label"]
	var tint := _color_for(target)
	var from_screen := camera.unproject_position(player_pos)
	var to_screen := camera.unproject_position(target_pos)
	line.default_color = tint
	line.points = PackedVector2Array([from_screen, to_screen])
	line.visible = true
	reticle.self_modulate = tint
	reticle.position = to_screen - reticle.custom_minimum_size * 0.5
	reticle.visible = true
	label.text = String(LABELS.get(String(target.get("id", "")), "AUTO LOCK"))
	label.add_theme_color_override("font_color", tint)
	label.position = Vector2(
		clampf(to_screen.x - label.custom_minimum_size.x * 0.5, 12.0, maxf(12.0, state["layer"].size.x - label.custom_minimum_size.x - 12.0)),
		maxf(12.0, to_screen.y - 38.0)
	)
	label.visible = true


static func _hide(state: Dictionary) -> void:
	if state.is_empty():
		return
	for key in ["line", "reticle", "label"]:
		if state.has(key) and state[key] != null:
			state[key].visible = false


static func _color_for(target: Dictionary) -> Color:
	return Color("#ffe07a") if String(target.get("id", "")) == "boss" else Color("#69d6ff")
