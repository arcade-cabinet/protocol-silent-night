extends RefCounted

const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")
const MINIMAP := preload("res://scripts/minimap_widget.gd")

const OPTION_ORDER: Array = ["auto", "low", "balanced", "high"]
const OPTION_LABELS: Dictionary = {
	"auto": "Auto",
	"low": "Battery Saver",
	"balanced": "Balanced",
	"high": "Full FX",
}
const PROFILES: Dictionary = {
	"low": {
		"id": "low",
		"particle_entry_cap": 72,
		"muzzle_flash_sparks": 2,
		"death_burst_particles": 7,
		"pickup_sparkles": 3,
		"level_up_particles": 14,
		"damage_number_limit": 10,
		"damage_number_floor": 5.0,
		"enemy_cap": 32,
	},
	"balanced": {
		"id": "balanced",
		"particle_entry_cap": 120,
		"muzzle_flash_sparks": 3,
		"death_burst_particles": 10,
		"pickup_sparkles": 4,
		"level_up_particles": 20,
		"damage_number_limit": 16,
		"damage_number_floor": 2.0,
		"enemy_cap": 40,
	},
	"high": {
		"id": "high",
		"particle_entry_cap": 180,
		"muzzle_flash_sparks": 4,
		"death_burst_particles": 12,
		"pickup_sparkles": 5,
		"level_up_particles": 25,
		"damage_number_limit": 24,
		"damage_number_floor": 0.0,
		"enemy_cap": 48,
	},
}


static func option_ids() -> Array:
	return OPTION_ORDER.duplicate()


static func option_label(profile_id: String) -> String:
	return String(OPTION_LABELS.get(_normalize_profile(profile_id), "Balanced"))


static func resolve(selected_profile: String, viewport_size: Vector2) -> Dictionary:
	var selected := _normalize_profile(selected_profile)
	var resolved_id := _auto_profile(viewport_size) if selected == "auto" else selected
	var profile: Dictionary = PROFILES.get(resolved_id, PROFILES["balanced"]).duplicate(true)
	profile["selected"] = selected
	profile["label"] = option_label(resolved_id)
	return profile


static func apply_to_main(main: Node, save_manager: Node) -> Dictionary:
	var viewport_size := Vector2(1280.0, 720.0)
	if main != null and main.get_viewport() != null:
		viewport_size = main.get_viewport().get_visible_rect().size
	var reduced_motion: bool = false
	var shake_enabled: bool = true
	var minimap_zoom: float = 22.0
	var selected_profile := "auto"
	if save_manager != null and save_manager.has_method("get_preference"):
		reduced_motion = bool(save_manager.get_preference("reduced_motion", false))
		shake_enabled = bool(save_manager.get_preference("screen_shake", true))
		minimap_zoom = float(save_manager.get_preference("minimap_zoom", 22.0))
		selected_profile = String(save_manager.get_preference("quality_profile", "auto"))
	var profile := resolve(selected_profile, viewport_size)
	if main == null:
		return profile
	if main.screen_shake != null:
		main.screen_shake.configure(reduced_motion or not shake_enabled)
	if main.flair_animator != null and main.flair_animator.has_method("configure"):
		main.flair_animator.configure(reduced_motion)
	if main.present_animator != null and main.present_animator.has_method("configure"):
		main.present_animator.configure(reduced_motion)
	if main.particles != null:
		main.particles.configure(reduced_motion)
		if main.particles.has_method("configure_quality"):
			main.particles.configure_quality(profile)
	if main.dmg_numbers != null and main.dmg_numbers.has_method("configure_quality"):
		main.dmg_numbers.configure_quality(profile)
	if main.enemies_ai != null and main.enemies_ai.has_method("configure_quality"):
		main.enemies_ai.configure_quality(profile)
	if main.ui_mgr != null and main.ui_mgr.widgets.has("minimap"):
		MINIMAP.set_view_radius(main.ui_mgr.widgets["minimap"], minimap_zoom)
	return profile


static func _normalize_profile(profile_id: String) -> String:
	var normalized := profile_id.strip_edges().to_lower()
	return normalized if OPTION_LABELS.has(normalized) else "auto"


static func _auto_profile(viewport_size: Vector2) -> String:
	var viewport_profile: Dictionary = VIEWPORT_PROFILE.for_viewport(viewport_size)
	if bool(viewport_profile.get("is_mobile", false)):
		return "low" if bool(viewport_profile.get("requires_landscape_rotation", false)) else "balanced"
	return "high" if viewport_size.x >= 1600.0 and viewport_size.y >= 900.0 else "balanced"
