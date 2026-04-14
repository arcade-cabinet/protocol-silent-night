extends RefCounted

const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")

const EVENT_PROFILES := {
	"pause": {"duration_ms": 16, "cooldown_ms": 180},
	"dash": {"duration_ms": 18, "cooldown_ms": 90},
	"damage": {"duration_ms": 26, "cooldown_ms": 140},
	"rewrap": {"duration_ms": 64, "cooldown_ms": 320},
	"level_up": {"duration_ms": 42, "cooldown_ms": 260},
	"boss_phase": {"duration_ms": 70, "cooldown_ms": 420},
	"death": {"duration_ms": 90, "cooldown_ms": 500},
	"victory": {"duration_ms": 72, "cooldown_ms": 500},
}

var _last_ms: Dictionary = {}


static func enabled_for_viewport(viewport_size: Vector2, save_manager: Node = null) -> bool:
	if not bool(VIEWPORT_PROFILE.for_viewport(viewport_size).get("is_mobile", false)):
		return false
	if save_manager != null and save_manager.has_method("get_preference"):
		return bool(save_manager.get_preference("mobile_haptics", true))
	return true


static func note_text(viewport_size: Vector2, save_manager: Node = null) -> String:
	return "Haptics %s" % ("ON" if enabled_for_viewport(viewport_size, save_manager) else "OFF")


func trigger(main: Node, event_id: String) -> void:
	if main == null or main.get_viewport() == null:
		return
	if not enabled_for_viewport(main.get_viewport().get_visible_rect().size, _save_manager(main)):
		return
	var profile: Dictionary = EVENT_PROFILES.get(event_id, {})
	if profile.is_empty():
		return
	var now := Time.get_ticks_msec()
	if now - int(_last_ms.get(event_id, -100000)) < int(profile["cooldown_ms"]):
		return
	_last_ms[event_id] = now
	Input.vibrate_handheld(int(profile["duration_ms"]))


static func _save_manager(main: Node) -> Node:
	return main._save_manager() if main != null and main.has_method("_save_manager") else null
