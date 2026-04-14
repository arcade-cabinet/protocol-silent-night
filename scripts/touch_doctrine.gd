extends RefCounted

const DOCTRINES: Dictionary = {
	"sightline": {
		"id": "sightline",
		"label": "Sightline",
		"dash_label": "STEP",
		"lock_prefix": "SIGHTLINE LOCK",
		"accent": "#69d6ff",
		"joystick_scale_mult": 0.94,
		"dash_scale_mult": 0.92,
	},
	"sweep": {
		"id": "sweep",
		"label": "Sweep",
		"dash_label": "JINK",
		"lock_prefix": "SWEEP LOCK",
		"accent": "#7aff8a",
		"joystick_scale_mult": 1.06,
		"dash_scale_mult": 0.98,
	},
	"breach": {
		"id": "breach",
		"label": "Breach",
		"dash_label": "BREACH",
		"lock_prefix": "BREACH LOCK",
		"accent": "#ff9a5e",
		"joystick_scale_mult": 1.04,
		"dash_scale_mult": 1.14,
	},
	"skate": {
		"id": "skate",
		"label": "Skate",
		"dash_label": "SLIDE",
		"lock_prefix": "HUNT LOCK",
		"accent": "#c8f2ff",
		"joystick_scale_mult": 1.0,
		"dash_scale_mult": 1.02,
	},
}


static func resolve(player_class = null) -> Dictionary:
	var doctrine_id := _classify(player_class)
	return DOCTRINES.get(doctrine_id, DOCTRINES["skate"]).duplicate(true)


static func _classify(player_class) -> String:
	if player_class == null:
		return "skate"
	var range_val := _stat(player_class, "range_val", 15.0)
	var damage := _stat(player_class, "damage", 14.0)
	var fire_rate := _stat(player_class, "fire_rate", 0.22)
	var shot_count := int(_stat(player_class, "shot_count", 1))
	var pierce := int(_stat(player_class, "pierce", 1))
	if range_val >= 22.0 or (pierce >= 3 and shot_count <= 1):
		return "sightline"
	if shot_count >= 2 or fire_rate <= 0.18:
		return "sweep"
	if damage >= 30.0 or (fire_rate >= 0.45 and range_val <= 18.5):
		return "breach"
	return "skate"


static func _stat(player_class, key: String, default_value: float) -> float:
	if player_class == null:
		return default_value
	if player_class is Dictionary:
		return float(player_class.get(key, default_value))
	if player_class.get(key) != null:
		return float(player_class.get(key))
	return default_value
