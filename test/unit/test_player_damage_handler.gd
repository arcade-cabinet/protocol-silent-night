extends GdUnitTestSuite

## Regression tests for player_damage_handler.gd.
## Focus: double-end_run when multiple hit callbacks fire after player death.

const HANDLER := preload("res://scripts/player_damage_handler.gd")


class StubUI:
	extends Node
	func show_message(_msg: String, _dur: float, _col: Color) -> void: pass


class StubGameMgr:
	var end_run_calls: Array = []
	func end_run(win: bool) -> void: end_run_calls.append(win)


class StubMain:
	extends Node
	var state: String = "playing"
	var test_mode: Dictionary = {}
	var dash_timer: float = 0.0
	var permadeath: bool = true  # no rewraps — simplifies death logic
	var rewraps: int = 0
	var shake_magnitude: float = 0.0
	var player_state: Dictionary = {}
	var audio_mgr = null
	var ui_mgr: StubUI
	var game_mgr: StubGameMgr

	func setup(hp: float) -> void:
		player_state = {"hp": hp, "max_hp": hp}
		ui_mgr = StubUI.new()
		add_child(ui_mgr)
		game_mgr = StubGameMgr.new()

	func _update_ui() -> void: pass


func _make_main(hp: float = 100.0) -> StubMain:
	var m: StubMain = auto_free(StubMain.new())
	m.setup(hp)
	add_child(m)
	return m


func test_lethal_damage_calls_end_run_once() -> void:
	var m := _make_main(10.0)
	HANDLER.damage_player(m, 20.0)
	assert_int(m.game_mgr.end_run_calls.size()).is_equal(1)
	assert_bool(m.game_mgr.end_run_calls[0]).is_false()


func test_second_damage_after_death_does_not_call_end_run_again() -> void:
	# Regression: if two projectiles hit in the same tick after HP reaches 0,
	# end_run must only be called once.
	var m := _make_main(10.0)
	HANDLER.damage_player(m, 20.0)  # player dies → end_run called, state="game_over"
	m.state = "game_over"           # simulate what end_run sets
	HANDLER.damage_player(m, 20.0)  # second hit — must be ignored
	assert_int(m.game_mgr.end_run_calls.size()).is_equal(1)


func test_damage_ignored_when_invincible() -> void:
	var m := _make_main(100.0)
	m.test_mode["invincible"] = true
	HANDLER.damage_player(m, 50.0)
	assert_float(float(m.player_state["hp"])).is_equal(100.0)
	assert_int(m.game_mgr.end_run_calls.size()).is_equal(0)


func test_damage_ignored_during_dash_iframes() -> void:
	var m := _make_main(100.0)
	m.dash_timer = 0.5
	HANDLER.damage_player(m, 50.0)
	assert_float(float(m.player_state["hp"])).is_equal(100.0)


func test_on_boss_killed_is_noop_when_state_not_playing() -> void:
	# Regression: player dies (state→game_over) and a projectile kills the boss
	# in the same frame — on_boss_killed must not call end_run a second time.
	var stub: StubMain = auto_free(StubMain.new())
	stub.state = "game_over"
	add_child(stub)
	var gm := preload("res://scripts/game_manager.gd").new(stub)
	gm.on_boss_killed()
	assert_str(stub.state).is_equal("game_over")
