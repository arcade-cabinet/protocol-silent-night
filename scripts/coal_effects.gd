extends RefCounted
class_name CoalEffects

## Coal is a one-use consumable buff queue item. Tap to activate, roll random
## effect from a pool. Returns a descriptor dict that the caller interprets.

const EFFECTS := ["spray", "hurl", "poison", "embers", "backfire", "fortune"]
const SELL_VALUE := 3
const RARITY_MULT: Dictionary = {"common": 1.0, "rare": 2.0, "legendary": 3.0}
const RARITY_COLOR: Dictionary = {"common": "#888888", "rare": "#66e0ff", "legendary": "#ffd700"}


static func roll_effect(rng: RandomNumberGenerator) -> String:
	return EFFECTS[rng.randi() % EFFECTS.size()]


static func roll_rarity(rng: RandomNumberGenerator) -> String:
	var r: float = rng.randf()
	if r < 0.05:
		return "legendary"
	if r < 0.30:
		return "rare"
	return "common"


static func apply_effect(effect_id: String, rng: RandomNumberGenerator, rarity: String = "common") -> Dictionary:
	var mult: float = float(RARITY_MULT.get(rarity, 1.0))
	var prefix: String = "" if rarity == "common" else ("%s " % rarity.to_upper())
	match effect_id:
		"spray":
			return {"ok": true, "kind": "aoe_damage", "damage": 25.0 * mult, "radius": 4.0 * sqrt(mult), "color": "#666666", "message": "%sCOAL SPRAY!" % prefix, "rarity": rarity}
		"hurl":
			return {"ok": true, "kind": "single_target", "damage": 999.0 * mult, "color": "#222222", "message": "%sCOAL HURL!" % prefix, "rarity": rarity}
		"poison":
			return {"ok": true, "kind": "self_damage", "damage": 15.0, "duration": 3.0, "color": "#55aa33", "message": "%sCOAL POISON..." % prefix, "rarity": rarity}
		"embers":
			return {"ok": true, "kind": "aura", "damage": 8.0 * mult, "radius": 3.0 * sqrt(mult), "duration": 5.0, "color": "#ff6622", "message": "%sCOAL EMBERS!" % prefix, "rarity": rarity}
		"backfire":
			return {"ok": true, "kind": "explosion", "damage": 40.0 * mult, "self_damage": 20.0, "radius": 3.5 * sqrt(mult), "color": "#cc3311", "message": "%sCOAL BACKFIRE!" % prefix, "rarity": rarity}
		"fortune":
			var bonus: int = int(rng.randi_range(5, 50) * mult)
			return {"ok": true, "kind": "cookie_bonus", "cookies": bonus, "color": "#ffd700", "message": "%sLUCKY COAL! +%dC" % [prefix, bonus], "rarity": rarity}
		_:
			return {"ok": false}


static func rarity_color(rarity: String) -> Color:
	return Color(String(RARITY_COLOR.get(rarity, "#888888")))


static func sell_value() -> int:
	return SELL_VALUE
