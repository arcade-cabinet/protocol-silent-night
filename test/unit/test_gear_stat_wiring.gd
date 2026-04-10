extends GdUnitTestSuite

## Regression tests for gear stats that were generated but never consumed.
## Covers: xp_bonus, cookie_bonus, dash_cooldown_mult, contact_damage_reduction.

const GameManager := preload("res://scripts/game_manager.gd")
const ProgressionManager := preload("res://scripts/progression_manager.gd")
const DamageHandler := preload("res://scripts/player_damage_handler.gd")


class StubProgression:
	var last_xp_received: int = 0
	func gain_xp(amount: int, _on_level_up: Callable, _on_ui: Callable) -> void:
		last_xp_received += amount
	func reset() -> void: last_xp_received = 0


class StubGameMgr:
	var end_run_calls: Array = []
	func end_run(win: bool) -> void: end_run_calls.append(win)


class StubUI:
	extends Node
	func show_message(_msg: String, _dur: float, _col: Color) -> void: pass


class StubMain:
	extends Node
	var state: String = "playing"
	var test_mode: Dictionary = {}
	var dash_timer: float = 0.0
	var permadeath: bool = true
	var rewraps: int = 0
	var shake_magnitude: float = 0.0
	var run_cookies: int = 0
	var player_state: Dictionary = {}
	var audio_mgr = null
	var ui_mgr: StubUI
	var game_mgr: StubGameMgr
	var progression: StubProgression

	func setup(xp_bonus: float = 0.0, cookie_bonus: float = 0.0, hp: float = 100.0) -> void:
		player_state = {
			"hp": hp,
			"max_hp": hp,
			"class": {
				"xp_bonus": xp_bonus,
				"cookie_bonus": cookie_bonus,
				"contact_damage_reduction": 0.0,
				"dash_cooldown": 1.0,
			},
		}
		ui_mgr = StubUI.new()
		add_child(ui_mgr)
		game_mgr = StubGameMgr.new()
		progression = StubProgression.new()

	func _trigger_level_up() -> void: pass
	func _update_ui() -> void: pass


func _make_main(xp_bonus: float = 0.0, cookie_bonus: float = 0.0, hp: float = 100.0) -> StubMain:
	var m: StubMain = auto_free(StubMain.new())
	m.setup(xp_bonus, cookie_bonus, hp)
	add_child(m)
	return m


# --- xp_bonus ---

func test_gain_xp_no_bonus_passes_amount_unchanged() -> void:
	var m := _make_main(0.0)
	var gm := GameManager.new(m)
	gm.gain_xp(10)
	assert_int(m.progression.last_xp_received).is_equal(10)


func test_gain_xp_50pct_bonus_scales_xp() -> void:
	var m := _make_main(0.5)  # 50% bonus
	var gm := GameManager.new(m)
	gm.gain_xp(10)
	# 10 * 1.5 = 15
	assert_int(m.progression.last_xp_received).is_equal(15)


func test_gain_xp_100pct_bonus_doubles_xp() -> void:
	var m := _make_main(1.0)
	var gm := GameManager.new(m)
	gm.gain_xp(8)
	assert_int(m.progression.last_xp_received).is_equal(16)


func test_gain_xp_zero_bonus_class_key_missing() -> void:
	var m := _make_main()
	m.player_state["class"].erase("xp_bonus")
	var gm := GameManager.new(m)
	gm.gain_xp(7)
	assert_int(m.progression.last_xp_received).is_equal(7)


# --- cookie_bonus ---

func test_gain_cookies_no_bonus_adds_amount() -> void:
	var m := _make_main(0.0, 0.0)
	var gm := GameManager.new(m)
	gm.gain_cookies(5)
	assert_int(m.run_cookies).is_equal(5)


func test_gain_cookies_100pct_bonus_doubles() -> void:
	var m := _make_main(0.0, 1.0)
	var gm := GameManager.new(m)
	gm.gain_cookies(4)
	assert_int(m.run_cookies).is_equal(8)


func test_gain_cookies_50pct_bonus_rounds_correctly() -> void:
	var m := _make_main(0.0, 0.5)
	var gm := GameManager.new(m)
	gm.gain_cookies(3)
	# 3 * 1.5 = 4.5 → roundi = 5
	assert_int(m.run_cookies).is_equal(5)


func test_gain_cookies_zero_bonus_key_missing() -> void:
	var m := _make_main()
	m.player_state["class"].erase("cookie_bonus")
	var gm := GameManager.new(m)
	gm.gain_cookies(6)
	assert_int(m.run_cookies).is_equal(6)


# --- contact_damage_reduction (regression via DamageHandler) ---

func test_damage_reduction_25pct_reduces_incoming_damage() -> void:
	var m: StubMain = auto_free(StubMain.new())
	m.setup(0.0, 0.0, 100.0)
	m.player_state["class"]["contact_damage_reduction"] = 0.25
	add_child(m)
	DamageHandler.damage_player(m, 20.0)
	# 20 * (1 - 0.25) = 15 → hp = 85
	assert_float(float(m.player_state["hp"])).is_equal_approx(85.0, 0.01)


func test_damage_reduction_capped_at_90pct() -> void:
	var m: StubMain = auto_free(StubMain.new())
	m.setup(0.0, 0.0, 100.0)
	m.player_state["class"]["contact_damage_reduction"] = 2.0  # exceeds cap
	add_child(m)
	DamageHandler.damage_player(m, 100.0)
	# Reduction capped at 0.9 → 100 * 0.1 = 10 damage → hp = 90
	assert_float(float(m.player_state["hp"])).is_equal_approx(90.0, 0.01)
