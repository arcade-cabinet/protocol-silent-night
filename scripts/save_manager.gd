extends Node

const DEFAULT_STATE := {
	"unlocked": {
		"elf": true,
		"santa": false,
		"bumble": false
	},
	"best_wave": 0,
	"best_level": 0,
	"achievements": {
		"total_kills": 0,
		"total_runs": 0,
		"total_waves_cleared": 0,
		"campaign_clears": 0
	},
	"preferences": {
		"difficulty_tier": 1,
		"permadeath": false,
		"last_present": "elf"
	},
	"cookies": 0,
	"coal": [],
	"gear_inventory": [],
	"equipped_gear": {}
}

var save_path: String = "user://silent_night_save.json"
var state: Dictionary = {}
var _autosave_enabled: bool = true


func _ready() -> void:
	load_state()


func set_save_path_for_tests(path: String) -> void:
	save_path = path


func load_state() -> Dictionary:
	state = DEFAULT_STATE.duplicate(true)
	if not FileAccess.file_exists(save_path):
		return state
	var file := FileAccess.open(save_path, FileAccess.READ)
	if file == null:
		return state
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		state = _merge_dict(DEFAULT_STATE.duplicate(true), parsed)
	return state


func save_state() -> void:
	if not _autosave_enabled: return
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(state, "\t"))


func reset_state_for_tests() -> void:
	state = DEFAULT_STATE.duplicate(true)
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(ProjectSettings.globalize_path(save_path))


func is_unlocked(class_id: String) -> bool:
	return bool(state.get("unlocked", {}).get(class_id, false))


func unlock(class_id: String) -> bool:
	if is_unlocked(class_id):
		return false
	state["unlocked"][class_id] = true
	save_state()
	return true


func register_level_reached(level_number: int) -> void:
	state["best_level"] = maxi(int(state.get("best_level", 0)), level_number)
	save_state()


func register_wave_reached(wave_number: int) -> void:
	state["best_wave"] = maxi(int(state.get("best_wave", 0)), wave_number)
	var achievements: Dictionary = state.get("achievements", {})
	achievements["total_waves_cleared"] = int(achievements.get("total_waves_cleared", 0)) + 1
	state["achievements"] = achievements
	save_state()


func record_kill(amount: int = 1) -> void:
	var achievements: Dictionary = state.get("achievements", {})
	achievements["total_kills"] = int(achievements.get("total_kills", 0)) + amount
	state["achievements"] = achievements
	save_state()


func record_run_start() -> void:
	var achievements: Dictionary = state.get("achievements", {})
	achievements["total_runs"] = int(achievements.get("total_runs", 0)) + 1
	state["achievements"] = achievements
	save_state()


func record_campaign_clear() -> void:
	var achievements: Dictionary = state.get("achievements", {})
	achievements["campaign_clears"] = int(achievements.get("campaign_clears", 0)) + 1
	state["achievements"] = achievements
	save_state()


func get_achievement(key: String) -> int:
	return int(state.get("achievements", {}).get(key, 0))


func get_cookies() -> int:
	return int(state.get("cookies", 0))


func add_cookies(amount: int) -> void:
	if amount <= 0:
		return
	state["cookies"] = get_cookies() + amount
	save_state()


func spend_cookies(amount: int) -> bool:
	if amount <= 0 or get_cookies() < amount:
		return false
	state["cookies"] = get_cookies() - amount
	save_state()
	return true


func get_coal() -> Array:
	var raw: Variant = state.get("coal", [])
	if not raw is Array:
		return []
	# Filter to only valid entries (String or Dictionary) to prevent crashes from tampered saves.
	var result: Array = []
	for item in raw:
		if item is String or item is Dictionary:
			result.append(item)
	return result


func set_coal(queue: Array) -> void:
	state["coal"] = queue.duplicate()
	save_state()


func get_equipped_gear() -> Dictionary:
	var raw: Variant = state.get("equipped_gear", {})
	return raw.duplicate(true) if raw is Dictionary else {}


func set_equipped_gear(equipped: Dictionary) -> void:
	state["equipped_gear"] = equipped.duplicate(true)
	save_state()


func get_gear_inventory() -> Array:
	var raw: Variant = state.get("gear_inventory", [])
	if not raw is Array:
		return []
	# Filter to only Dictionary entries; tampered saves with wrong types crash gear_system.
	var result: Array = []
	for item in raw:
		if item is Dictionary and item.has("id") and item.has("slot"):
			result.append(item)
	return result


func add_to_gear_inventory(item: Dictionary) -> void:
	var inv: Array = get_gear_inventory()
	inv.append(item)
	state["gear_inventory"] = inv
	save_state()


func set_preference(key: String, value) -> void:
	var prefs: Dictionary = state.get("preferences", {})
	prefs[key] = value
	state["preferences"] = prefs
	save_state()


func get_preference(key: String, default_value = null) -> Variant:
	return state.get("preferences", {}).get(key, default_value)


func _merge_dict(base: Dictionary, incoming: Dictionary, top_level: bool = true) -> Dictionary:
	for key in incoming.keys():
		if top_level and not base.has(key):
			continue  # Top-level only: reject schema-unknown keys from tampered saves.
		if incoming[key] is Dictionary and base.get(key) is Dictionary:
			base[key] = _merge_dict(base[key], incoming[key], false)
		else:
			base[key] = incoming[key]
	return base

func suspend_autosave() -> void:
	_autosave_enabled = false

func resume_autosave() -> void:
	_autosave_enabled = true
	save_state()
