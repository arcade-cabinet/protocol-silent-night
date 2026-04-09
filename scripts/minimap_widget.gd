extends RefCounted

## Bottom-right HUD minimap: circular radar showing player, enemies,
## pickups, and boss in world-space relative to the player. Uses
## Control._draw primitives only (no textures).

const SIZE: Vector2 = Vector2(140, 140)
const VIEW_RADIUS: float = 22.0  # world units visible radius


static func build(root: Control) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "Minimap"
	panel.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	panel.offset_left = -SIZE.x - 14
	panel.offset_top = -SIZE.y - 14
	panel.offset_right = -14
	panel.offset_bottom = -14
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.04, 0.06, 0.1, 0.78)
	style.border_width_left = 2
	style.border_width_top = 2
	style.border_width_right = 2
	style.border_width_bottom = 2
	style.border_color = Color("#69d6ff")
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	panel.add_theme_stylebox_override("panel", style)
	var canvas := Control.new()
	canvas.custom_minimum_size = SIZE
	canvas.set_meta("minimap_state", {"enemies": [], "pickups": [], "boss": null, "player_pos": Vector2.ZERO})
	canvas.draw.connect(func() -> void: _draw(canvas))
	panel.add_child(canvas)
	root.add_child(panel)
	return {"panel": panel, "canvas": canvas}


static func refresh(state: Dictionary, player_pos: Vector2, enemies: Array, pickups: Array, boss: Variant) -> void:
	if state.is_empty():
		return
	var canvas: Control = state["canvas"]
	if canvas == null:
		return
	var data: Dictionary = {"player_pos": player_pos, "enemies": [], "pickups": [], "boss": null}
	for e in enemies:
		if e is Dictionary and e.has("node") and is_instance_valid(e["node"]):
			var ep: Vector3 = e["node"].position
			data["enemies"].append(Vector2(ep.x, ep.z))
	for p in pickups:
		if p is Dictionary and p.has("node") and is_instance_valid(p["node"]):
			var pp: Vector3 = p["node"].position
			data["pickups"].append({"pos": Vector2(pp.x, pp.z), "type": String(p.get("type", "xp"))})
	if boss is Dictionary and boss.has("node") and is_instance_valid(boss["node"]):
		var bp: Vector3 = boss["node"].position
		data["boss"] = Vector2(bp.x, bp.z)
	canvas.set_meta("minimap_state", data)
	canvas.queue_redraw()


static func _draw(canvas: Control) -> void:
	if not canvas.has_meta("minimap_state"):
		return
	var data: Dictionary = canvas.get_meta("minimap_state")
	var center: Vector2 = SIZE * 0.5
	var ppos: Vector2 = data.get("player_pos", Vector2.ZERO)
	canvas.draw_circle(center, 4.5, Color("#ffffff"))
	for ep in data.get("enemies", []):
		var p: Vector2 = _world_to_map(ep, ppos, center)
		if (p - center).length() <= SIZE.x * 0.48:
			canvas.draw_circle(p, 2.8, Color("#ff617e"))
	for entry in data.get("pickups", []):
		var pp: Vector2 = _world_to_map(entry["pos"], ppos, center)
		if (pp - center).length() > SIZE.x * 0.48:
			continue
		var col: Color = Color("#ffd700") if String(entry.get("type", "xp")) == "cookie" else Color("#55ff88")
		canvas.draw_circle(pp, 2.0, col)
	if data.get("boss") != null:
		var bp: Vector2 = _world_to_map(data["boss"], ppos, center)
		if (bp - center).length() <= SIZE.x * 0.48:
			canvas.draw_circle(bp, 5.5, Color("#ff2244"))


static func _world_to_map(world_pos: Vector2, player_pos: Vector2, center: Vector2) -> Vector2:
	var delta: Vector2 = world_pos - player_pos
	var scale: float = (SIZE.x * 0.46) / VIEW_RADIUS
	return center + delta * scale
