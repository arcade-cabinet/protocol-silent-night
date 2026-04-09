extends GdUnitTestSuite

const MARKET := preload("res://scripts/market_screen.gd")
const FLOW := preload("res://scripts/between_match_flow.gd")
const SAVE := preload("res://scripts/save_manager.gd")
const SCREENS := preload("res://scripts/between_match_screens.gd")


class StubMain:
	extends Node
	var run_scrolls: Array = []
	var coal_queue: Array = []
	var save: Node
	var test_mode: Dictionary = {}
	var current_wave_index: int = 0
	var difficulty_tier: int = 1
	var run_cookies: int = 0
	var progression: Object = null

	func _save_manager() -> Node:
		return save


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


func _make_stub_main() -> StubMain:
	var save = auto_free(SAVE.new())
	save.set_save_path_for_tests("user://gdunit_flow_scrolls.json")
	save.reset_state_for_tests()
	save.load_state()
	var m: StubMain = auto_free(StubMain.new())
	m.save = save
	return m


func test_open_scrolls_naughty_becomes_coal() -> void:
	var m := _make_stub_main()
	m.run_scrolls = [
		{"scroll_type": "naughty"},
		{"scroll_type": "naughty"},
		{"scroll_type": "naughty"},
	]
	var flow := FLOW.new(m)
	var summary: Dictionary = flow.open_scrolls()
	assert_int(m.coal_queue.size()).is_equal(3)
	assert_int(int(summary["coal_added"].size())).is_equal(3)
	assert_int(m.run_scrolls.size()).is_equal(0)
	assert_int(m.save.get_coal().size()).is_equal(3)


func test_open_scrolls_nice_grants_cookies() -> void:
	var m := _make_stub_main()
	m.run_scrolls = [
		{"scroll_type": "nice"},
		{"scroll_type": "nice"},
	]
	var flow := FLOW.new(m)
	var summary: Dictionary = flow.open_scrolls()
	assert_int(int(summary["cookies_added"])).is_equal(30)
	assert_int(m.save.get_cookies()).is_equal(30)
	assert_int(m.coal_queue.size()).is_equal(0)


func test_open_scrolls_appends_to_existing_coal() -> void:
	var m := _make_stub_main()
	m.coal_queue = ["fortune"]
	m.run_scrolls = [{"scroll_type": "naughty"}]
	var flow := FLOW.new(m)
	flow.open_scrolls()
	assert_int(m.coal_queue.size()).is_equal(2)


func test_open_scrolls_returns_per_scroll_outcomes() -> void:
	var m := _make_stub_main()
	m.run_scrolls = [
		{"scroll_type": "nice"},
		{"scroll_type": "naughty"},
		{"scroll_type": "nice"},
	]
	var flow := FLOW.new(m)
	var summary: Dictionary = flow.open_scrolls()
	var outcomes: Array = summary["outcomes"]
	assert_int(outcomes.size()).is_equal(3)
	assert_str(String(outcomes[0]["type"])).is_equal("nice")
	assert_int(int(outcomes[0].get("cookies", 0))).is_equal(15)
	assert_str(String(outcomes[1]["type"])).is_equal("naughty")
	assert_str(String(outcomes[1].get("effect_id", ""))).is_not_empty()


func test_populate_scroll_grid_builds_one_card_per_outcome() -> void:
	var root: Control = auto_free(Control.new())
	add_child(root)
	var state: Dictionary = SCREENS.build_scroll_screen(root, func() -> void: pass)
	var outcomes := [
		{"type": "nice", "cookies": 15},
		{"type": "naughty", "effect_id": "fortune"},
		{"type": "nice", "cookies": 15},
	]
	SCREENS.populate_scroll_grid(state, outcomes)
	var grid: GridContainer = state["grid"]
	assert_int(grid.get_child_count()).is_equal(3)


func test_populate_scroll_grid_empty_shows_empty_label() -> void:
	var root: Control = auto_free(Control.new())
	add_child(root)
	var state: Dictionary = SCREENS.build_scroll_screen(root, func() -> void: pass)
	SCREENS.populate_scroll_grid(state, [])
	var grid: GridContainer = state["grid"]
	assert_int(grid.get_child_count()).is_equal(1)
	var child: Node = grid.get_child(0)
	assert_bool(child is Label).is_true()


func test_populate_scroll_grid_caps_at_twenty_plus_overflow() -> void:
	var root: Control = auto_free(Control.new())
	add_child(root)
	var state: Dictionary = SCREENS.build_scroll_screen(root, func() -> void: pass)
	var outcomes: Array = []
	for i in range(25):
		outcomes.append({"type": "nice", "cookies": 15})
	SCREENS.populate_scroll_grid(state, outcomes)
	var grid: GridContainer = state["grid"]
	assert_int(grid.get_child_count()).is_equal(21)
