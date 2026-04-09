extends RefCounted

## Thin adapter over particle_coal_helpers. Callers use the public
## spawn_for_effect(particles, root, pos, kind, color, rarity) API
## and the helper module dispatches on kind to the right particle
## spawner with rarity-scaled count/size.

const COAL_HELPERS := preload("res://scripts/particle_coal_helpers.gd")

const KIND_COLORS: Dictionary = {
	"spray": "#888899", "hurl": "#222222", "poison": "#55ff88",
	"embers": "#ff7722", "backfire": "#ff3311", "fortune": "#ffd700",
}

const RARITY_SCALE: Dictionary = {"common": 1.0, "rare": 1.5, "legendary": 2.0}


static func spawn_for_effect(particles: RefCounted, root: Node3D, pos: Vector3, kind: String, color_override: Color = Color(0, 0, 0, 0), rarity: String = "common") -> void:
	if particles == null or root == null:
		return
	var scale: float = float(RARITY_SCALE.get(rarity, 1.0))
	COAL_HELPERS.spawn_for_kind(particles, root, pos, kind, color_override, scale)


static func color_for_kind(kind: String) -> Color:
	return Color(String(KIND_COLORS.get(kind, "#ffffff")))


static func rarity_scale(rarity: String) -> float:
	return float(RARITY_SCALE.get(rarity, 1.0))
