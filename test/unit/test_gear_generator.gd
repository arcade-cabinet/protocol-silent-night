extends GdUnitTestSuite


var _test_archetypes := {
	"weapon_mod": [
		{"name": "Candy Cane Barrel", "flavor": "Peppermint power"},
		{"name": "Snowball Launcher", "flavor": "Compact ice delivery"},
	],
	"wrapping_upgrade": [
		{"name": "Reinforced Paper", "flavor": "Thick and durable"},
	],
	"bow_accessory": [
		{"name": "Jingle Bell", "flavor": "Rings on hit"},
	],
	"tag_charm": [
		{"name": "Lucky Star", "flavor": "Shines bright"},
	],
}

var _test_flair := [
	{"type": "frost_crystals", "count": 3},
	{"type": "ember_glow", "intensity": 1.2},
	{"type": "sparkle_burst", "color": "#ffd700"},
]


func test_generate_item_produces_valid_gear() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var item := GearGenerator.generate_item(rng, "weapon_mod", 2, _test_archetypes["weapon_mod"], [])
	assert_str(item.get("slot", "")).is_equal("weapon_mod")
	assert_int(item.get("rarity", 0)).is_equal(2)
	assert_dict(item.get("stats", {})).is_not_empty()
	var validation := GearSystem.validate(item)
	assert_bool(validation["valid"]).is_true()


func test_generate_item_deterministic_with_same_seed() -> void:
	var rng_a := RandomNumberGenerator.new()
	rng_a.seed = 99
	var item_a := GearGenerator.generate_item(rng_a, "weapon_mod", 3, _test_archetypes["weapon_mod"], _test_flair)
	var rng_b := RandomNumberGenerator.new()
	rng_b.seed = 99
	var item_b := GearGenerator.generate_item(rng_b, "weapon_mod", 3, _test_archetypes["weapon_mod"], _test_flair)
	assert_str(item_a["name"]).is_equal(item_b["name"])


func test_generate_item_includes_flair_on_higher_rarity() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var item := GearGenerator.generate_item(rng, "weapon_mod", 4, _test_archetypes["weapon_mod"], _test_flair)
	assert_int(item.get("flair", []).size()).is_greater(0)


func test_generate_item_no_flair_on_common() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var item := GearGenerator.generate_item(rng, "weapon_mod", 1, _test_archetypes["weapon_mod"], _test_flair)
	assert_int(item.get("flair", []).size()).is_equal(0)


func test_generate_market_produces_requested_count() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var market := GearGenerator.generate_market(rng, 3, _test_archetypes, _test_flair, 5, 1)
	assert_int(market.size()).is_equal(3)
	for item in market:
		assert_bool(GearSystem.validate(item)["valid"]).is_true()


func test_rarity_scales_with_level_and_difficulty() -> void:
	var low_rng := RandomNumberGenerator.new()
	low_rng.seed = 42
	var low_market := GearGenerator.generate_market(low_rng, 20, _test_archetypes, [], 1, 1)
	var high_rng := RandomNumberGenerator.new()
	high_rng.seed = 42
	var high_market := GearGenerator.generate_market(high_rng, 20, _test_archetypes, [], 50, 6)
	var low_avg := 0.0
	for item in low_market: low_avg += float(item.get("rarity", 1))
	var high_avg := 0.0
	for item in high_market: high_avg += float(item.get("rarity", 1))
	assert_float(high_avg / 20.0).is_greater(low_avg / 20.0)


func test_stat_values_scale_with_rarity() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var common := GearGenerator.generate_item(rng, "weapon_mod", 1, _test_archetypes["weapon_mod"], [])
	rng.seed = 42
	var legendary := GearGenerator.generate_item(rng, "weapon_mod", 5, _test_archetypes["weapon_mod"], [])
	var common_total := 0.0
	for v in common.get("stats", {}).values(): common_total += absf(float(v))
	var legendary_total := 0.0
	for v in legendary.get("stats", {}).values(): legendary_total += absf(float(v))
	assert_float(legendary_total).is_greater(common_total)
