extends RefCounted
class_name GearGenerator

## Procedural gear instance generator. No hardcoded items.
## Combines archetype templates + madlib prefixes/suffixes via PRNG
## to produce unique gear each run.

const PREFIXES := {
	"Frozen": {"stat": "range_mult", "value": 0.08, "color": "#aaddff"},
	"Burning": {"stat": "damage_mult", "value": 0.1, "color": "#ff6622"},
	"Swift": {"stat": "fire_rate_mult", "value": 0.06, "color": "#55ff88"},
	"Hardened": {"stat": "hp_flat", "value": 20, "color": "#aaaaaa"},
	"Gilded": {"stat": "cookie_bonus", "value": 0.12, "color": "#ffd700"},
	"Razor": {"stat": "crit_chance", "value": 0.08, "color": "#ff2244"},
	"Heavy": {"stat": "damage_flat", "value": 8, "color": "#886644"},
	"Nimble": {"stat": "speed_mult", "value": 0.06, "color": "#88ffee"},
	"Piercing": {"stat": "pierce_flat", "value": 1, "color": "#cc88ff"},
	"Blessed": {"stat": "xp_bonus", "value": 0.1, "color": "#ffffaa"},
	"Volatile": {"stat": "spread_mult", "value": -0.05, "color": "#ff8800"},
	"Sturdy": {"stat": "contact_damage_reduction", "value": 0.15, "color": "#668899"},
	"Jagged": {"stat": "damage_flat", "value": 5, "color": "#cc4444"},
	"Polished": {"stat": "bullet_speed_mult", "value": 0.1, "color": "#eeeeff"},
}

const SUFFIXES := {
	"of Haste": {"stat": "speed_mult", "value": 0.05},
	"of Piercing": {"stat": "pierce_flat", "value": 1},
	"of Fortune": {"stat": "cookie_bonus", "value": 0.08},
	"of Precision": {"stat": "crit_chance", "value": 0.06},
	"of Vitality": {"stat": "hp_flat", "value": 15},
	"of Fury": {"stat": "damage_mult", "value": 0.07},
	"of Reach": {"stat": "range_mult", "value": 0.06},
	"of Swiftness": {"stat": "fire_rate_mult", "value": 0.04},
	"of Harvesting": {"stat": "xp_bonus", "value": 0.08},
	"of Evasion": {"stat": "dash_cooldown_mult", "value": 0.08},
	"of Impact": {"stat": "bullet_speed_mult", "value": 0.08},
	"of Spreading": {"stat": "shot_count_flat", "value": 1},
}


static func generate_item(rng: RandomNumberGenerator, slot: String,
		rarity: int, archetypes: Array, unlocked_flair: Array) -> Dictionary:
	if archetypes.is_empty():
		return {}
	var archetype: Dictionary = archetypes[rng.randi() % archetypes.size()]
	var prefix_keys := PREFIXES.keys()
	var suffix_keys := SUFFIXES.keys()
	var prefix_key: String = prefix_keys[rng.randi() % prefix_keys.size()]
	var prefix: Dictionary = PREFIXES[prefix_key]
	var stats: Dictionary = {}
	stats[prefix["stat"]] = _scale_value(prefix["value"], rarity)
	var rarity_info: Dictionary = GearSystem.RARITIES.get(rarity, {})
	var max_stats := int(rarity_info.get("max_stats", 1))
	var name_str: String = prefix_key + " " + String(archetype.get("name", "Item"))
	if max_stats >= 2 and rng.randf() > 0.3:
		var suffix_key: String = suffix_keys[rng.randi() % suffix_keys.size()]
		var suffix: Dictionary = SUFFIXES[suffix_key]
		if not stats.has(suffix["stat"]):
			stats[suffix["stat"]] = _scale_value(suffix["value"], rarity)
			name_str += " " + suffix_key
	var flair: Array = []
	var max_flair := int(rarity_info.get("max_flair", 0))
	if max_flair > 0 and not unlocked_flair.is_empty():
		var flair_count := rng.randi_range(1, mini(max_flair, unlocked_flair.size()))
		var shuffled := unlocked_flair.duplicate()
		for i in range(shuffled.size() - 1, 0, -1):
			var j := rng.randi_range(0, i)
			var tmp: Variant = shuffled[i]
			shuffled[i] = shuffled[j]
			shuffled[j] = tmp
		for i in range(flair_count):
			flair.append(shuffled[i])
	return {
		"id": "%s_%d_%d" % [slot, rng.randi(), rarity],
		"name": name_str,
		"slot": slot,
		"rarity": rarity,
		"stats": stats,
		"flair": flair,
		"flavor": String(archetype.get("flavor", "")),
		"color": prefix.get("color", "#ffffff"),
	}


static func generate_market(rng: RandomNumberGenerator, item_count: int,
		archetypes: Dictionary, unlocked_flair: Array,
		level: int, difficulty: int) -> Array:
	var items: Array = []
	var slots := GearSystem.SLOTS.duplicate()
	for _i in range(item_count):
		var slot: String = slots[rng.randi() % slots.size()]
		var slot_archetypes: Array = archetypes.get(slot, [])
		var rarity := _roll_rarity(rng, level, difficulty)
		var item := generate_item(rng, slot, rarity, slot_archetypes, unlocked_flair)
		if not item.is_empty():
			items.append(item)
	return items


static func _roll_rarity(rng: RandomNumberGenerator, level: int, difficulty: int) -> int:
	var roll := rng.randf()
	var boost := float(level + difficulty) * 0.008
	if roll < 0.01 + boost * 0.5: return 5
	if roll < 0.05 + boost: return 4
	if roll < 0.15 + boost * 1.5: return 3
	if roll < 0.40 + boost * 2.0: return 2
	return 1


static func _scale_value(base_value: float, rarity: int) -> float:
	return base_value * (1.0 + (rarity - 1) * 0.3)
