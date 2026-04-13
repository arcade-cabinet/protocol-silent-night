extends GdUnitTestSuite

const QUALITY := preload("res://scripts/runtime_quality.gd")
const SETTINGS := preload("res://scripts/settings_menu.gd")
const PARTICLES := preload("res://scripts/particle_effects.gd")
const DAMAGE_NUMBERS := preload("res://scripts/damage_numbers.gd")
const ENEMY_DIRECTOR := preload("res://scripts/enemy_director.gd")


class SaveDouble extends Node:
	var prefs: Dictionary = {}

	func get_preference(key: String, default_value = null):
		return prefs.get(key, default_value)

	func set_preference(key: String, value) -> void:
		prefs[key] = value


class DummyMat extends RefCounted:
	pass


class DummyPix extends RefCounted:
	pass


func test_auto_profile_uses_low_tier_for_portrait_phone() -> void:
	var profile: Dictionary = QUALITY.resolve("auto", Vector2(390.0, 844.0))
	assert_str(String(profile["id"])).is_equal("low")
	assert_int(int(profile["enemy_cap"])).is_less(40)


func test_settings_menu_quality_selector_persists_choice() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(390, 844)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var save: SaveDouble = auto_free(SaveDouble.new())
	var state: Dictionary = SETTINGS.build(root, null, save, Callable())
	var option: OptionButton = state["quality_option"]
	var quality_note: Label = state["quality_note"]
	var low_idx: int = -1
	for idx in range(option.item_count):
		if String(option.get_item_metadata(idx)) == "low":
			low_idx = idx
			break
	assert_int(low_idx).is_greater_equal(0)
	assert_str(quality_note.text).contains("Auto resolved")
	option.item_selected.emit(low_idx)
	assert_str(String(save.get_preference("quality_profile", ""))).is_equal("low")
	assert_str(quality_note.text).contains("Active quality")


func test_particle_quality_caps_level_up_burst_density() -> void:
	var particles: RefCounted = PARTICLES.new()
	particles.configure_quality({"particle_entry_cap": 8, "level_up_particles": 25})
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	particles.spawn_level_up_burst(root, Vector3.ZERO)
	assert_int(particles.active_count()).is_equal(8)


func test_damage_number_quality_skips_low_value_spam() -> void:
	var numbers: RefCounted = DAMAGE_NUMBERS.new()
	numbers.configure_quality({"damage_number_limit": 1, "damage_number_floor": 5.0})
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	numbers.spawn(root, Vector3.ZERO, 3.0, Color.WHITE)
	numbers.spawn(root, Vector3.ZERO, 8.0, Color.WHITE)
	numbers.spawn(root, Vector3.ONE, 9.0, Color.WHITE)
	assert_int(numbers._entries.size()).is_equal(1)
	assert_int(root.get_child_count()).is_equal(1)


func test_enemy_director_quality_reduces_spawn_cap() -> void:
	var director: RefCounted = ENEMY_DIRECTOR.new(DummyMat.new(), DummyPix.new())
	director.configure_quality({"enemy_cap": 28})
	assert_int(director.enemy_cap).is_equal(28)
