extends GdUnitTestSuite

const COAL_EFFECTS := preload("res://scripts/coal_effects.gd")


func test_roll_rarity_distribution_within_tolerance() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var counts: Dictionary = {"common": 0, "rare": 0, "legendary": 0}
	var trials := 2000
	for _i in range(trials):
		var r: String = COAL_EFFECTS.roll_rarity(rng)
		counts[r] += 1
	var common_pct: float = float(counts["common"]) / float(trials)
	var rare_pct: float = float(counts["rare"]) / float(trials)
	var legendary_pct: float = float(counts["legendary"]) / float(trials)
	assert_float(common_pct).is_between(0.65, 0.75)
	assert_float(rare_pct).is_between(0.20, 0.30)
	assert_float(legendary_pct).is_between(0.02, 0.08)


func test_rare_doubles_damage_spray() -> void:
	var rng := RandomNumberGenerator.new()
	var common_d: Dictionary = COAL_EFFECTS.apply_effect("spray", rng, "common")
	var rare_d: Dictionary = COAL_EFFECTS.apply_effect("spray", rng, "rare")
	assert_float(float(rare_d["damage"])).is_equal_approx(float(common_d["damage"]) * 2.0, 0.01)


func test_legendary_triples_damage_backfire() -> void:
	var rng := RandomNumberGenerator.new()
	var common_d: Dictionary = COAL_EFFECTS.apply_effect("backfire", rng, "common")
	var leg_d: Dictionary = COAL_EFFECTS.apply_effect("backfire", rng, "legendary")
	assert_float(float(leg_d["damage"])).is_equal_approx(float(common_d["damage"]) * 3.0, 0.01)


func test_rarity_tagged_in_descriptor() -> void:
	var rng := RandomNumberGenerator.new()
	var d: Dictionary = COAL_EFFECTS.apply_effect("fortune", rng, "legendary")
	assert_str(String(d.get("rarity", ""))).is_equal("legendary")


func test_rarity_color_maps_to_palette() -> void:
	var common: Color = COAL_EFFECTS.rarity_color("common")
	var legendary: Color = COAL_EFFECTS.rarity_color("legendary")
	assert_bool(common != legendary).is_true()
