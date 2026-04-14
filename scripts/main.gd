extends Node3D
const PROGRESSION_MANAGER := preload("res://scripts/progression_manager.gd")
const GAME_MANAGER := preload("res://scripts/game_manager.gd")
const WORLD_BUILDER := preload("res://scripts/world_builder.gd")
const MAIN_HELPERS := preload("res://scripts/main_helpers.gd")
const BOARD_HELPERS := preload("res://scripts/board_helpers.gd")
const PLAYER_DAMAGE_HANDLER := preload("res://scripts/player_damage_handler.gd")
const PICKUP_MAGNET_RING := preload("res://scripts/pickup_magnet_ring.gd")
const FLAIR_ANIMATOR_SCR := preload("res://scripts/flair_animator.gd")
const BETWEEN_MATCH_FLOW := preload("res://scripts/between_match_flow.gd")
const ORIENTATION_GATE := preload("res://scripts/orientation_gate.gd")
var config: Dictionary = {}
var enemy_defs: Dictionary = {}
var upgrade_defs: Array = []
var present_defs: Dictionary = {}
var mat_factory := preload("res://scripts/material_factory.gd").new()
var pix_renderer := preload("res://scripts/pixel_art_renderer.gd").new()
var board_generator := preload("res://scripts/board_generator.gd").new()
var board_builder := preload("res://scripts/board_builder.gd").new(mat_factory, pix_renderer)
var ui_mgr := preload("res://scripts/ui_manager.gd").new()
var combat := preload("res://scripts/combat_resolver.gd").new(mat_factory, pix_renderer)
var enemies_ai := preload("res://scripts/enemy_director.gd").new(mat_factory, pix_renderer)
var player_ctrl := preload("res://scripts/player_controller.gd").new(mat_factory, pix_renderer)
var obstacles_builder := preload("res://scripts/obstacle_builder.gd").new(mat_factory)
var audio_mgr := preload("res://scripts/audio_manager.gd").new()
var dmg_numbers := preload("res://scripts/damage_numbers.gd").new()
var present_animator := preload("res://scripts/present_animator.gd").new()
var weather_director: RefCounted
var afterimages: Array = []
var particles := preload("res://scripts/particle_effects.gd").new()
var boss_phases := preload("res://scripts/boss_phases.gd").new()
var gear_sys := GearSystem.new()
var board_obj_factory := preload("res://scripts/board_object_factory.gd").new(mat_factory)
var scroll_pickup_mgr := preload("res://scripts/scroll_pickup.gd").new(mat_factory, pix_renderer)
var board_obj_handler := preload("res://scripts/board_object_handler.gd").new(board_obj_factory, scroll_pickup_mgr)
var between_match: RefCounted
var progression: RefCounted
var game_mgr: RefCounted
var mobile_feedback := preload("res://scripts/mobile_feedback.gd").new()
var flair_animator: Node
var orientation_gate: Dictionary = {}
var shake_magnitude: float = 0.0
var screen_shake := preload("res://scripts/screen_shake.gd").new()
var music_director := preload("res://scripts/music_director.gd").new()
var pickup_magnet_ring: MeshInstance3D
var _widget_time: float = 0.0
var runtime_root: Node3D
var board_root: Node3D
var actor_root: Node3D
var projectile_root: Node3D
var pickup_root: Node3D
var fx_root: Node3D
var camera: Camera3D
var title_screen: PanelContainer:
	get: return ui_mgr.title_screen
var start_screen: PanelContainer:
	get: return ui_mgr.start_screen
var level_screen: PanelContainer:
	get: return ui_mgr.level_screen
var dash_button: Button:
	get: return ui_mgr.dash_button
var boss_panel: VBoxContainer:
	get: return ui_mgr.boss_panel
var difficulty_panel: PanelContainer:
	get: return ui_mgr.difficulty_panel
var state: String = "menu"
var current_class_id: String = ""
var current_wave_index: int = -1
var wave_time_remaining: float = 0.0
var spawn_timer: float = 0.0
var boss_ref: Dictionary = {}
var kills: int:
	get: return progression.kills if progression != null else 0
var level: int:
	get: return progression.level if progression != null else 1
var xp: int:
	get: return progression.xp if progression != null else 0
var xp_needed: int:
	get: return progression.xp_needed if progression != null else 5
var player_node: Node3D
var player_mesh: Node3D
var player_state: Dictionary = {}
var enemies: Array = []
var projectiles: Array = []
var pickups: Array = []
var vfx: Array = []
var board_data: BoardLayout
var obstacle_colliders: Array = []
var current_wave: Dictionary = {}
var run_seed: int = 0
var level_lookback: Array = []
var difficulty_tier: int = 1
var permadeath: bool = false
var endless_mode: bool = false
var rewraps: int = 5
var run_cookies: int = 0
var run_scrolls: Array = []
var coal_queue: Array = []
var board_objects: Array = []
var input_move := Vector2.ZERO
var move_velocity := Vector2.ZERO
var touch_active := false; var touch_origin := Vector2.ZERO; var touch_position := Vector2.ZERO
var dash_pressed := false; var dash_timer := 0.0; var dash_cooldown_timer := 0.0
var wave_clear_timer := 0.0; var test_mode := {}
func _ready() -> void:
	_load_definitions()
	WORLD_BUILDER.build_world(self)
	weather_director = preload("res://scripts/weather_director.gd").new(self)
	_init_services()
	_refresh_start_screen()
	ui_mgr.show_message("", 0.0)
	MAIN_HELPERS.apply_reduced_motion(self, _save_manager())
func _init_services() -> void:
	audio_mgr.attach(runtime_root.get_node("Audio"), _save_manager())
	combat.audio_mgr = audio_mgr
	enemies_ai.audio_mgr = audio_mgr
	ui_mgr.build_ui(self, _return_to_menu, func() -> void: dash_pressed = true, func() -> void: dash_pressed = false, _on_difficulty_selected, _activate_coal)
	flair_animator = FLAIR_ANIMATOR_SCR.new()
	runtime_root.add_child(flair_animator)
	pickup_magnet_ring = PICKUP_MAGNET_RING.build(runtime_root)
	progression = PROGRESSION_MANAGER.new(ui_mgr)
	progression.audio_mgr = audio_mgr
	game_mgr = GAME_MANAGER.new(self)
	between_match = BETWEEN_MATCH_FLOW.new(self)
	between_match.build_screens(ui_mgr.root_control)
	ui_mgr.ensure_menus(audio_mgr, _save_manager(), _return_to_menu, _return_to_menu)
	orientation_gate = ORIENTATION_GATE.build(ui_mgr.root_control)
const DEBUG_HELPERS := preload("res://scripts/debug_helpers.gd")
func configure_test_mode(options: Dictionary) -> void: test_mode = options.duplicate(true)
func start_run(class_id: String) -> void: game_mgr.start_run(class_id)
func debug_force_level_up() -> void: DEBUG_HELPERS.force_level_up(self)
func debug_spawn_boss() -> void: DEBUG_HELPERS.spawn_boss(self)
func debug_end_run(win: bool) -> void: DEBUG_HELPERS.end_run(self, win)
func capture_screenshot(path: String) -> void: await DEBUG_HELPERS.capture_screenshot(self, path)
func debug_zone_at(wp: Vector3) -> String: return "arena" if absf(wp.x) <= float(config["arena_radius"]) * 1.6 and absf(wp.z) <= float(config["arena_radius"]) else "void"
func debug_is_blocked(wp: Vector3, r: float = 0.6) -> bool: return not _can_occupy(wp, r)
func debug_tick(delta: float) -> void: _tick(delta)

func _process(delta: float) -> void:
	if not bool(test_mode.get("manual_tick", false)):
		_tick(delta)

func _tick(delta: float) -> void:
	ui_mgr.update_transient_overlays(delta)
	if ORIENTATION_GATE.refresh(orientation_gate, self):
		input_move = Vector2.ZERO; move_velocity = Vector2.ZERO
		touch_active = false; dash_pressed = false; ui_mgr.hide_joystick()
		ui_mgr.refresh_widgets(self); return
	ui_mgr.refresh_widgets(self)
	if state == "playing":
		game_mgr.tick_playing(delta)
		music_director.tick(delta, audio_mgr, enemies.size(), float(player_state.get("hp", 100.0)) / maxf(1.0, float(player_state.get("max_hp", 100.0))), not boss_ref.is_empty())
		_widget_time += delta
		if player_node != null: PICKUP_MAGNET_RING.update(pickup_magnet_ring, player_node.position, float(config.get("pickup_magnet_radius", 1.0)), 1.0, _widget_time)
	elif state == "wave_clear":
		wave_clear_timer -= delta
		if wave_clear_timer <= 0.0:
			game_mgr.start_next_wave()
	shake_magnitude = WORLD_BUILDER.update_camera(camera, player_node, state, config, delta, shake_magnitude)
	screen_shake.update(delta, camera)
	if weather_director != null: weather_director.tick(delta)

func _unhandled_input(event: InputEvent) -> void: MAIN_HELPERS.handle_input(self, event)
func _notification(what: int) -> void: MAIN_HELPERS.handle_notification(self, what)

func _load_definitions() -> void: MAIN_HELPERS.load_definitions(self)

func _save_manager() -> Node: return get_node_or_null("/root/SaveManager")
func _refresh_start_screen() -> void: ui_mgr.refresh_start_screen(_save_manager(), _on_class_button_pressed, present_defs)
func _return_to_menu() -> void: BOARD_HELPERS.return_to_menu(self)

func _trigger_level_up() -> void:
	if mobile_feedback != null: mobile_feedback.trigger(self, "level_up")
	if player_node != null: particles.spawn_level_up_burst(fx_root, player_node.position)
	MAIN_HELPERS.trigger_level_up(self)

func _apply_upgrade(upgrade_id: String) -> void: MAIN_HELPERS.apply_upgrade(self, upgrade_id)

func _damage_player(amount: float) -> void: PLAYER_DAMAGE_HANDLER.damage_player(self, amount)

func _update_ui() -> void:
	ui_mgr.update_hud(player_state, progression.xp_needed, progression.xp, progression.level, progression.kills, run_cookies, coal_queue)

func _kill_enemy(enemy_index: int) -> void:
	MAIN_HELPERS.kill_enemy(self, enemy_index)

func _spawn_hit_fx(world_position: Vector3, color: Color) -> void: combat.spawn_hit_fx(fx_root, vfx, world_position, color)
func _activate_coal(idx: int) -> void: MAIN_HELPERS.activate_coal(self, idx)
func _can_occupy(wp: Vector3, r: float) -> bool:
	return WORLD_BUILDER.can_occupy(wp, r, float(config["arena_radius"]), obstacle_colliders)
func _move_actor(n: Node3D, d: Vector3, s: float, dt: float, r: float) -> void:
	WORLD_BUILDER.move_actor(n, d, s, dt, r, float(config["arena_radius"]), obstacle_colliders)
func _on_class_button_pressed(b: Button) -> void:
	MAIN_HELPERS.on_class_button_pressed(self, b)

func _on_difficulty_selected(tier: int, permadeath_flag: bool, endless_flag: bool = false) -> void:
	MAIN_HELPERS.on_difficulty_selected(self, tier, permadeath_flag, endless_flag)
func _on_upgrade_button_pressed(b: Button) -> void: _apply_upgrade(String(b.get_meta("upgrade_id", "")))
func _test_scale(key: String) -> float: return float(test_mode.get(key, 1.0))
