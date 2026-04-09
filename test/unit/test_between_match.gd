extends GdUnitTestSuite

const MARKET := preload("res://scripts/market_screen.gd")


func test_market_generates_three_items() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var archetypes := {
		"weapon_mod": [{"name": "Test Barrel", "flavor": "test"}],
		"wrapping_upgrade": [{"name": "Test Wrap", "flavor": "test"}],
		"bow_accessory": [{"name": "Test Bow", "flavor": "test"}],
		"tag_charm": [{"name": "Test Tag", "flavor": "test"}],
	}
	var items: Array = MARKET.generate_items(rng, archetypes, [], 5, 1)
	assert_int(items.size()).is_equal(3)
	for item in items:
		assert_bool(GearSystem.validate(item)["valid"]).is_true()


func test_market_items_scale_with_level() -> void:
	var archetypes := {
		"weapon_mod": [{"name": "Test Barrel", "flavor": "test"}],
		"wrapping_upgrade": [{"name": "Test Wrap", "flavor": "test"}],
		"bow_accessory": [{"name": "Test Bow", "flavor": "test"}],
		"tag_charm": [{"name": "Test Tag", "flavor": "test"}],
	}
	var low_rng := RandomNumberGenerator.new()
	low_rng.seed = 42
	var low_items: Array = MARKET.generate_items(low_rng, archetypes, [], 1, 1)
	var high_rng := RandomNumberGenerator.new()
	high_rng.seed = 42
	var high_items: Array = MARKET.generate_items(high_rng, archetypes, [], 20, 3)
	var low_total := 0.0
	var high_total := 0.0
	for it in low_items: low_total += float(it.get("rarity", 1))
	for it in high_items: high_total += float(it.get("rarity", 1))
	assert_float(high_total).is_greater_equal(low_total)


func test_cost_computation_scales_with_rarity() -> void:
	assert_int(MARKET._compute_cost(1)).is_equal(15)
	assert_int(MARKET._compute_cost(5)).is_equal(375)


func test_reroll_cost_constant() -> void:
	assert_int(MARKET.REROLL_COST).is_equal(10)


func test_market_with_empty_archetypes_returns_empty() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var items: Array = MARKET.generate_items(rng, {}, [], 1, 1)
	for item in items:
		assert_dict(item).is_empty()
