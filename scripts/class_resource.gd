extends Resource
class_name ClassResource

@export var id: String = ""
@export var name: String = ""
@export var max_hp: float = 100.0
@export var speed: float = 12.0
@export var fire_rate: float = 0.22
@export var damage: float = 14.0
@export var range_val: float = 15.0
@export var bullet_speed: float = 26.0
@export var bullet_scale: float = 0.3
@export var shot_count: int = 1
@export var spread: float = 0.06
@export var pierce: int = 1
@export var color: String = "#ffd700"
@export var dash_cooldown: float = 1.0
@export var contact_damage_reduction: float = 0.0
@export var xp_bonus: float = 0.0
@export var cookie_bonus: float = 0.0
@export var crit_chance: float = 0.0


static func from_dict(class_id: String, def: Dictionary) -> ClassResource:
	var res := ClassResource.new()
	res.id = class_id
	res.name = def.get("name", class_id)
	res.max_hp = float(def.get("max_hp", 100))
	res.speed = float(def.get("speed", 12.0))
	res.fire_rate = float(def.get("fire_rate", 0.22))
	res.damage = float(def.get("damage", 14.0))
	res.range_val = float(def.get("range", 15.0))
	res.bullet_speed = float(def.get("bullet_speed", 26.0))
	res.bullet_scale = float(def.get("bullet_scale", 0.3))
	res.shot_count = int(def.get("shot_count", 1))
	res.spread = float(def.get("spread", 0.06))
	res.pierce = int(def.get("pierce", 1))
	res.color = def.get("bow_color", "#ffd700")
	res.dash_cooldown = float(def.get("dash_cooldown", 1.0))
	res.contact_damage_reduction = float(def.get("contact_damage_reduction", 0.0))
	res.xp_bonus = float(def.get("xp_bonus", 0.0))
	res.cookie_bonus = float(def.get("cookie_bonus", 0.0))
	res.crit_chance = float(def.get("crit_chance", 0.0))
	return res
