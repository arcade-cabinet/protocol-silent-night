extends RefCounted

## 6-axis radar chart for present stats (HP / Speed / Damage /
## Fire Rate / Range / Pierce). Rendered via Control._draw with
## polygon fill.

const AXES: Array = ["hp", "speed", "damage", "fire_rate", "range", "pierce"]
const AXIS_LABELS: Array = ["HP", "SPD", "DMG", "RATE", "RNG", "PCE"]
const AXIS_MAX: Dictionary = {
	"hp": 200.0, "speed": 20.0, "damage": 60.0,
	"fire_rate": 0.6, "range": 25.0, "pierce": 5.0,
}


static func build(root: Control, size: Vector2 = Vector2(180, 180)) -> Control:
	var canvas := Control.new()
	canvas.name = "StatRadar"
	canvas.custom_minimum_size = size
	canvas.set_meta("radar_values", {})
	canvas.draw.connect(func() -> void: _draw(canvas))
	root.add_child(canvas)
	return canvas


static func update(canvas: Control, present_def: Dictionary) -> void:
	if canvas == null:
		return
	var values: Dictionary = {}
	for axis in AXES:
		var raw: float = float(present_def.get(axis, 0.0))
		var maxv: float = float(AXIS_MAX.get(axis, 1.0))
		var inv: bool = axis == "fire_rate"
		if inv:
			values[axis] = clampf(1.0 - (raw / maxv), 0.0, 1.0)
		else:
			values[axis] = clampf(raw / maxv, 0.0, 1.0)
	canvas.set_meta("radar_values", values)
	canvas.queue_redraw()


static func _draw(canvas: Control) -> void:
	var center: Vector2 = canvas.size * 0.5
	var radius: float = minf(canvas.size.x, canvas.size.y) * 0.42
	var values: Dictionary = canvas.get_meta("radar_values", {})
	# Background rings
	for i in range(4):
		var r: float = radius * (float(i + 1) / 4.0)
		canvas.draw_arc(center, r, 0.0, TAU, 32, Color(1, 1, 1, 0.12), 1.0, true)
	# Axes
	var axis_count: int = AXES.size()
	var points: PackedVector2Array = PackedVector2Array()
	var label_positions: Array = []
	for i in range(axis_count):
		var angle: float = TAU * float(i) / float(axis_count) - PI * 0.5
		var axis_end: Vector2 = center + Vector2(cos(angle), sin(angle)) * radius
		canvas.draw_line(center, axis_end, Color(1, 1, 1, 0.18), 1.0, true)
		var v: float = float(values.get(AXES[i], 0.0))
		points.append(center + Vector2(cos(angle), sin(angle)) * radius * v)
		label_positions.append(center + Vector2(cos(angle), sin(angle)) * (radius + 12.0))
	if points.size() >= 3:
		canvas.draw_colored_polygon(points, Color(0.4, 0.85, 1.0, 0.35))
		for i in range(points.size()):
			var j: int = (i + 1) % points.size()
			canvas.draw_line(points[i], points[j], Color("#69d6ff"), 2.0, true)
	var font: Font = ThemeDB.fallback_font
	if font != null:
		for i in range(axis_count):
			var p: Vector2 = label_positions[i]
			canvas.draw_string(font, p - Vector2(12, -4), AXIS_LABELS[i], HORIZONTAL_ALIGNMENT_CENTER, -1, 11, Color("#9accf0"))
