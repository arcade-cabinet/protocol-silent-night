extends RefCounted
class_name CoalEffects

## Coal is a one-use consumable buff queue item. Tap to activate, roll random
## effect from a pool. Returns a descriptor dict that the caller interprets.

const EFFECTS := ["spray", "hurl", "poison", "embers", "backfire", "fortune"]
const SELL_VALUE := 3


static func roll_effect(rng: RandomNumberGenerator) -> String:
	return EFFECTS[rng.randi() % EFFECTS.size()]


static func apply_effect(effect_id: String, rng: RandomNumberGenerator) -> Dictionary:
	match effect_id:
		"spray":
			return {
				"ok": true, "kind": "aoe_damage",
				"damage": 25.0, "radius": 4.0,
				"color": "#666666", "message": "COAL SPRAY!"
			}
		"hurl":
			return {
				"ok": true, "kind": "single_target",
				"damage": 999.0,
				"color": "#222222", "message": "COAL HURL!"
			}
		"poison":
			return {
				"ok": true, "kind": "self_damage",
				"damage": 15.0, "duration": 3.0,
				"color": "#55aa33", "message": "COAL POISON..."
			}
		"embers":
			return {
				"ok": true, "kind": "aura",
				"damage": 8.0, "radius": 3.0, "duration": 5.0,
				"color": "#ff6622", "message": "COAL EMBERS!"
			}
		"backfire":
			return {
				"ok": true, "kind": "explosion",
				"damage": 40.0, "self_damage": 20.0, "radius": 3.5,
				"color": "#cc3311", "message": "COAL BACKFIRE!"
			}
		"fortune":
			var bonus: int = rng.randi_range(5, 50)
			return {
				"ok": true, "kind": "cookie_bonus",
				"cookies": bonus,
				"color": "#ffd700", "message": "LUCKY COAL! +%dC" % bonus
			}
		_:
			return {"ok": false}


static func sell_value() -> int:
	return SELL_VALUE
