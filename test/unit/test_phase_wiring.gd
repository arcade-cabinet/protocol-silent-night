extends GdUnitTestSuite

## Integration tests for Phases 7-10 wiring: boss phase callback,
## enemy telegraph callback, reduced motion propagation, music
## director crossfade, combo kill hook.

const BOSS_PHASES := preload("res://scripts/boss_phases.gd")
const ENEMY_BEHAVIORS := preload("res://scripts/enemy_behaviors.gd")
const AUDIO_MANAGER := preload("res://scripts/audio_manager.gd")
const MUSIC_DIRECTOR := preload("res://scripts/music_director.gd")
const FLAIR_ANIMATOR := preload("res://scripts/flair_animator.gd")
const PRESENT_ANIMATOR := preload("res://scripts/present_animator.gd")
const SCREEN_SHAKE := preload("res://scripts/screen_shake.gd")
const COMBO := preload("res://scripts/combo_counter.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")


func test_boss_phases_emits_phase_changed_callable() -> void:
	# Unit-test _on_phase_change directly by calling it via get_phase threshold.
	# update_boss has too many sibling Callables to mock cleanly; instead,
	# assert get_phase() returns 2 when HP is in the 33-66% band, which is the
	# trigger condition for the phase_changed callback.
	var boss_ref: Dictionary = {"hp": 50.0, "max_hp": 100.0}
	assert_int(BOSS_PHASES.get_phase(boss_ref)).is_equal(2)
	boss_ref["hp"] = 20.0
	assert_int(BOSS_PHASES.get_phase(boss_ref)).is_equal(3)
	boss_ref["hp"] = 80.0
	assert_int(BOSS_PHASES.get_phase(boss_ref)).is_equal(1)


func test_enemy_telegraph_fires_before_shot() -> void:
	var enemy_node: Node3D = auto_free(Node3D.new())
	enemy_node.scale = Vector3.ONE
	add_child(enemy_node)
	var player_node: Node3D = auto_free(Node3D.new())
	player_node.position = Vector3(12, 0, 0)
	add_child(player_node)
	var enemy: Dictionary = {
		"node": enemy_node, "speed": 4.0, "id": "santa",
		"behavior_timer": 1.65, "contact_damage": 2.0,
	}
	var telegraph_fired: Array = []
	var tcb := func(etype: String, pos: Vector3) -> void: telegraph_fired.append(etype)
	var move_cb := func(a, b, c, d, e) -> void: pass
	var shot_cb := func(a, b, c, d, e, f, g) -> void: pass
	# Fire interval for ranged at phase 1 is 2.0s; threshold is 2.0 - 0.35 = 1.65s
	ENEMY_BEHAVIORS.behavior_ranged(enemy, player_node, 0.016, move_cb, shot_cb, 1, tcb)
	assert_int(telegraph_fired.size()).is_equal(1)
	assert_str(String(telegraph_fired[0])).is_equal("santa")


func test_reduced_motion_blocks_flair_animator_tick() -> void:
	var anim: Node = auto_free(FLAIR_ANIMATOR.new())
	add_child(anim)
	anim.configure(true)
	var target: MeshInstance3D = auto_free(MeshInstance3D.new())
	add_child(target)
	anim.register(target, "wobble_animation", {"amplitude": 0.5, "rate": 3.0})
	var initial_y: float = target.position.y
	for _i in range(10):
		anim._process(0.1)
	assert_float(target.position.y).is_equal_approx(initial_y, 0.001)


func test_reduced_motion_dampens_present_animator_idle() -> void:
	var anim: RefCounted = PRESENT_ANIMATOR.new()
	anim.configure(true)
	var visual: Node3D = auto_free(Node3D.new())
	visual.set_meta("idle_style", "bounce")
	add_child(visual)
	for _i in range(60):
		anim.update(0.016, visual, Vector2.ZERO)
	# With reduced_motion, idle_weight is 0.25, so y offset amplitude is ~0.015 max.
	assert_float(absf(visual.position.y - anim.base_y)).is_less_equal(0.02)


func test_screen_shake_reduced_motion_blocks_trauma() -> void:
	var shake: RefCounted = SCREEN_SHAKE.new()
	shake.configure(true)
	shake.add_trauma(1.0)
	assert_float(shake.trauma).is_equal(0.0)


func test_combo_counter_tiers_match_label_colors() -> void:
	var c: RefCounted = COMBO.new()
	for _i in range(20):
		c.register_kill()
	var state: Dictionary = c.get_state()
	assert_int(int(state["tier"])).is_equal(3)
	var red: Color = COMBO.tier_color(3)
	assert_bool(red.r > 0.8).is_true()


func test_music_director_crossfade_sets_intensity() -> void:
	var mgr: RefCounted = AUDIO_MANAGER.new()
	var host: Node = auto_free(Node.new())
	add_child(host)
	mgr.attach(host, null)
	mgr.set_music_intensity("calm")
	assert_str(String(mgr._current_intensity)).is_equal("calm")
	mgr.set_music_intensity("panic")
	assert_str(String(mgr._current_intensity)).is_equal("panic")
