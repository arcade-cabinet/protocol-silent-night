extends RefCounted

## Thin adapter over particle_coal_helpers. Callers use the public
## spawn_for_effect(particles, root, pos, kind, color) API and the
## helper module dispatches on kind to the right particle spawner.

const COAL_HELPERS := preload("res://scripts/particle_coal_helpers.gd")

const KIND_COLORS: Dictionary = {
	"spray": "#888899", "hurl": "#222222", "poison": "#55ff88",
	"embers": "#ff7722", "backfire": "#ff3311", "fortune": "#ffd700",
}


static func spawn_for_effect(particles: RefCounted, root: Node3D, pos: Vector3, kind: String, color_override: Color = Color(0, 0, 0, 0)) -> void:
	if particles == null or root == null:
		return
	COAL_HELPERS.spawn_for_kind(particles, root, pos, kind, color_override)


static func color_for_kind(kind: String) -> Color:
	return Color(String(KIND_COLORS.get(kind, "#ffffff")))
