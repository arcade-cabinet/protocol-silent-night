extends RefCounted
class_name PresentSpawner

## Builds a game-ready present player node from a definition.
## The returned Node3D can be parented into the actor tree.
## It includes the visual present + a collision-friendly structure.

var _factory := PresentFactory.new()
var _definitions: Dictionary = {}


func load_definitions(path: String) -> void:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("PresentSpawner: failed to open %s" % path)
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		_definitions = parsed


func get_definition(present_id: String) -> Dictionary:
	return _definitions.get(present_id, {})


func get_all_ids() -> Array:
	return _definitions.keys()


func get_unlocked_ids(save_state: Dictionary) -> Array:
	var unlocked: Array = []
	var achievements: Dictionary = save_state.get("achievements", {})
	for present_id in _definitions.keys():
		var def: Dictionary = _definitions[present_id]
		var req: String = def.get("unlock", "default")
		if _is_unlocked(req, save_state, achievements):
			unlocked.append(present_id)
	return unlocked


func spawn_player(present_id: String, scale_factor: float = 0.6) -> Node3D:
	var def := get_definition(present_id)
	if def.is_empty():
		push_error("PresentSpawner: unknown id %s" % present_id)
		return Node3D.new()
	var root := Node3D.new()
	root.name = "Player"
	var visual := _factory.build_present(def)
	visual.scale = Vector3.ONE * scale_factor
	root.add_child(visual)
	root.position = Vector3(0, 0.12, 0)
	return root


func get_player_stats(present_id: String) -> Dictionary:
	var def := get_definition(present_id)
	return {
		"max_hp": float(def.get("max_hp", 100)),
		"speed": float(def.get("speed", 12.0)),
		"fire_rate": float(def.get("fire_rate", 0.22)),
		"damage": float(def.get("damage", 14.0)),
		"range": float(def.get("range", 15.0)),
		"bullet_speed": float(def.get("bullet_speed", 26.0)),
		"bullet_scale": 0.3,
		"shot_count": int(def.get("shot_count", 1)),
		"spread": float(def.get("spread", 0.06)),
		"pierce": int(def.get("pierce", 1)),
		"color": def.get("bow_color", "#ffd700"),
	}


func _is_unlocked(req: String, save: Dictionary,
		achievements: Dictionary) -> bool:
	if req == "default":
		return true
	if req.begins_with("reach_wave_"):
		var target := int(req.trim_prefix("reach_wave_"))
		return int(save.get("best_wave", 0)) >= target
	if req.begins_with("kill_"):
		var target := int(req.trim_prefix("kill_").trim_suffix("_enemies"))
		return int(achievements.get("total_kills", 0)) >= target
	return false
