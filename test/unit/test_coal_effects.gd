extends GdUnitTestSuite


func test_roll_effect_returns_valid_effect() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var effect: String = CoalEffects.roll_effect(rng)
	assert_bool(effect in CoalEffects.EFFECTS).is_true()


func test_all_effects_produce_result() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	for effect_id in CoalEffects.EFFECTS:
		var result: Dictionary = CoalEffects.apply_effect(effect_id, rng)
		assert_bool(bool(result["ok"])).is_true()
		assert_str(String(result.get("message", ""))).is_not_empty()


func test_fortune_awards_cookies() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var result: Dictionary = CoalEffects.apply_effect("fortune", rng)
	assert_str(String(result["kind"])).is_equal("cookie_bonus")
	assert_int(int(result["cookies"])).is_greater(0)
	assert_int(int(result["cookies"])).is_less_equal(50)


func test_coal_sell_value_is_3() -> void:
	assert_int(CoalEffects.sell_value()).is_equal(3)


func test_unknown_effect_returns_not_ok() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 42
	var result: Dictionary = CoalEffects.apply_effect("nonsense", rng)
	assert_bool(bool(result["ok"])).is_false()
