extends RefCounted

## Off-screen arrow indicator for the boss/Krampus. When the boss
## exists beyond a 10-unit world-space radius from the player,
## renders a triangle arrow at a fixed screen-space radius.

const INDICATOR_RADIUS: float = 180.0
const TRIANGLE_SIZE: float = 16.0


static func build(root: Control) -> Dictionary:
	var canvas := Control.new()
	canvas.name = "ThreatIndicator"
	canvas.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	canvas.set_meta("indicator_state", {"visible": false, "angle": 0.0, "tier": "red"})
	canvas.draw.connect(func() -> void: _draw(canvas))
	root.add_child(canvas)
	return {"canvas": canvas}


static func update(state: Dictionary, boss_world: Variant, player_world: Variant, tier: String = "red") -> void:
	if state.is_empty():
		return
	var canvas: Control = state["canvas"]
	if canvas == null:
		return
	if boss_world == null or player_world == null:
		canvas.set_meta("indicator_state", {"visible": false, "angle": 0.0, "tier": tier})
		canvas.queue_redraw()
		return
	var bp3: Vector3 = boss_world
	var pp3: Vector3 = player_world
	var delta: Vector2 = Vector2(bp3.x - pp3.x, bp3.z - pp3.z)
	var on_screen: bool = delta.length() < 10.0
	var angle: float = atan2(delta.y, delta.x)
	canvas.set_meta("indicator_state", {"visible": not on_screen, "angle": angle, "tier": tier})
	canvas.queue_redraw()


static func _draw(canvas: Control) -> void:
	if not canvas.has_meta("indicator_state"):
		return
	var data: Dictionary = canvas.get_meta("indicator_state")
	if not bool(data.get("visible", false)):
		return
	var angle: float = float(data.get("angle", 0.0))
	var tier: String = String(data.get("tier", "red"))
	var color: Color = _color_for_tier(tier)
	var center: Vector2 = canvas.size * 0.5
	var arrow_pos: Vector2 = center + Vector2(cos(angle), sin(angle)) * INDICATOR_RADIUS
	var tip: Vector2 = arrow_pos + Vector2(cos(angle), sin(angle)) * TRIANGLE_SIZE
	var base_a: Vector2 = arrow_pos + Vector2(cos(angle + 2.5), sin(angle + 2.5)) * TRIANGLE_SIZE
	var base_b: Vector2 = arrow_pos + Vector2(cos(angle - 2.5), sin(angle - 2.5)) * TRIANGLE_SIZE
	var pts: PackedVector2Array = PackedVector2Array([tip, base_a, base_b])
	canvas.draw_colored_polygon(pts, color)


static func _color_for_tier(tier: String) -> Color:
	match tier:
		"gold": return Color("#ffd700")
		"purple": return Color("#aa66ff")
	return Color("#ff2244")
