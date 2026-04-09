extends RefCounted
class_name GearSystem

## Runtime gear slot manager. Equips/unequips gear, applies stat modifiers.
## Validates gear definitions against the schema before accepting them.

const SLOTS := ["weapon_mod", "wrapping_upgrade", "bow_accessory", "tag_charm"]

const VALID_STATS := [
	"damage_flat", "damage_mult", "fire_rate_mult", "speed_mult",
	"hp_flat", "hp_mult", "range_mult", "pierce_flat",
	"crit_chance", "cookie_bonus", "xp_bonus",
	"bullet_speed_mult", "shot_count_flat", "spread_mult",
	"contact_damage_reduction", "dash_cooldown_mult",
]

const RARITIES := {
	1: {"name": "Common", "color": "#ffffff", "max_stats": 1, "mult_cap": 0.1},
	2: {"name": "Uncommon", "color": "#55ff88", "max_stats": 2, "mult_cap": 0.15},
	3: {"name": "Rare", "color": "#5588ff", "max_stats": 2, "mult_cap": 0.25},
	4: {"name": "Epic", "color": "#bb55ff", "max_stats": 3, "mult_cap": 0.35},
	5: {"name": "Legendary", "color": "#ffd700", "max_stats": 3, "mult_cap": 0.5},
}

var equipped: Dictionary = {}


func _init() -> void:
	for slot in SLOTS:
		equipped[slot] = {}


func equip(gear_def: Dictionary) -> Dictionary:
	var slot: String = gear_def.get("slot", "")
	if slot not in SLOTS:
		return {"ok": false, "error": "invalid slot: %s" % slot}
	var old: Dictionary = equipped[slot]
	equipped[slot] = gear_def
	return {"ok": true, "old": old}


func unequip(slot: String) -> Dictionary:
	if slot not in SLOTS:
		return {}
	var old: Dictionary = equipped[slot]
	equipped[slot] = {}
	return old


func get_equipped(slot: String) -> Dictionary:
	return equipped.get(slot, {})


func apply_modifiers(base_stats: Dictionary) -> Dictionary:
	var result := base_stats.duplicate(true)
	for slot in SLOTS:
		var gear: Dictionary = equipped[slot]
		if gear.is_empty():
			continue
		var stats: Dictionary = gear.get("stats", {})
		for key in stats.keys():
			if key.ends_with("_flat"):
				var base_key: String = key.trim_suffix("_flat")
				result[base_key] = float(result.get(base_key, 0.0)) + float(stats[key])
			elif key.ends_with("_mult"):
				var base_key: String = key.trim_suffix("_mult")
				if key.contains("cooldown") or key.contains("fire_rate"):
					result[base_key] = float(result.get(base_key, 1.0)) * (1.0 - float(stats[key]))
				else:
					result[base_key] = float(result.get(base_key, 0.0)) * (1.0 + float(stats[key]))
			else:
				result[key] = float(result.get(key, 0.0)) + float(stats[key])
	return result


func get_all_equipped() -> Array:
	var result: Array = []
	for slot in SLOTS:
		if not equipped[slot].is_empty():
			result.append(equipped[slot])
	return result


func sell_value(gear_def: Dictionary) -> int:
	var rarity := int(gear_def.get("rarity", 1))
	return rarity * 5


static func validate(gear_def: Dictionary) -> Dictionary:
	var errors: Array = []
	if not gear_def.has("id"):
		errors.append("missing id")
	if not gear_def.has("name"):
		errors.append("missing name")
	var slot: String = gear_def.get("slot", "")
	if slot not in SLOTS:
		errors.append("invalid slot: %s" % slot)
	var rarity := int(gear_def.get("rarity", 0))
	if rarity < 1 or rarity > 5:
		errors.append("rarity must be 1-5, got %d" % rarity)
	var stats: Dictionary = gear_def.get("stats", {})
	if stats.is_empty():
		errors.append("gear must have at least one stat")
	var rarity_info: Dictionary = RARITIES.get(rarity, {})
	var max_stats := int(rarity_info.get("max_stats", 1))
	if stats.size() > max_stats:
		errors.append("rarity %d allows max %d stats, got %d" % [rarity, max_stats, stats.size()])
	var mult_cap := float(rarity_info.get("mult_cap", 0.5))
	for key in stats.keys():
		if key not in VALID_STATS:
			errors.append("unknown stat: %s" % key)
		if key.ends_with("_mult") and absf(float(stats[key])) > mult_cap:
			errors.append("%s value %.2f exceeds rarity %d cap %.2f" % [key, float(stats[key]), rarity, mult_cap])
	if not gear_def.has("flavor"):
		errors.append("missing flavor text")
	return {"valid": errors.is_empty(), "errors": errors}
