extends GdUnitTestSuite


func test_validate_accepts_valid_gear() -> void:
	var gear := {
		"id": "test_sword", "name": "Test Sword", "slot": "weapon_mod",
		"rarity": 2, "stats": {"damage_flat": 5, "fire_rate_mult": 0.08},
		"flavor": "A pointy thing"
	}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_true()


func test_validate_rejects_invalid_slot() -> void:
	var gear := {"id": "x", "name": "X", "slot": "pants", "rarity": 1, "stats": {"damage_flat": 1}, "flavor": "x"}
	assert_bool(GearSystem.validate(gear)["valid"]).is_false()


func test_validate_rejects_unknown_stat() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 1, "stats": {"magic_power": 5}, "flavor": "x"}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_false()
	assert_bool(result["errors"][0].contains("unknown stat")).is_true()


func test_validate_rejects_too_many_stats_for_rarity() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 1,
		"stats": {"damage_flat": 1, "speed_mult": 0.05}, "flavor": "x"}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_false()
	assert_bool(result["errors"][0].contains("max 1 stats")).is_true()


func test_validate_rejects_mult_exceeding_cap() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 1,
		"stats": {"damage_mult": 0.5}, "flavor": "x"}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_false()
	assert_bool(result["errors"][0].contains("exceeds")).is_true()


func test_equip_and_apply_flat_modifier() -> void:
	var gs := GearSystem.new()
	var gear := {"id": "test", "name": "T", "slot": "weapon_mod", "rarity": 1,
		"stats": {"damage_flat": 10}, "flavor": "x"}
	gs.equip(gear)
	var result := gs.apply_modifiers({"damage": 20.0})
	assert_float(result["damage"]).is_equal(30.0)


func test_equip_and_apply_mult_modifier() -> void:
	var gs := GearSystem.new()
	var gear := {"id": "test", "name": "T", "slot": "bow_accessory", "rarity": 2,
		"stats": {"speed_mult": 0.15}, "flavor": "x"}
	gs.equip(gear)
	var result := gs.apply_modifiers({"speed": 10.0})
	assert_float(result["speed"]).is_equal(11.5)


func test_unequip_returns_old_gear() -> void:
	var gs := GearSystem.new()
	var gear := {"id": "old", "name": "Old", "slot": "tag_charm", "rarity": 1,
		"stats": {"crit_chance": 0.05}, "flavor": "x"}
	gs.equip(gear)
	var old := gs.unequip("tag_charm")
	assert_str(old["id"]).is_equal("old")
	assert_dict(gs.get_equipped("tag_charm")).is_empty()


func test_validate_flair_count_limited_by_rarity() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 1,
		"stats": {"damage_flat": 1}, "flavor": "x",
		"flair": [{"type": "ember_glow"}]}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_false()
	assert_bool(result["errors"][0].contains("max 0 flair")).is_true()


func test_validate_flair_accepts_valid_on_rare() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 3,
		"stats": {"damage_flat": 5}, "flavor": "x",
		"flair": [{"type": "frost_crystals"}, {"type": "pulsing_glow"}]}
	assert_bool(GearSystem.validate(gear)["valid"]).is_true()


func test_validate_rejects_unknown_flair_type() -> void:
	var gear := {"id": "x", "name": "X", "slot": "weapon_mod", "rarity": 3,
		"stats": {"damage_flat": 5}, "flavor": "x",
		"flair": [{"type": "rainbow_unicorn"}]}
	var result := GearSystem.validate(gear)
	assert_bool(result["valid"]).is_false()


func test_sell_value_scales_with_rarity() -> void:
	var gs := GearSystem.new()
	assert_int(gs.sell_value({"rarity": 1})).is_equal(5)
	assert_int(gs.sell_value({"rarity": 5})).is_equal(25)
