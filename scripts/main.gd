extends Node3D

const PROGRESSION_MANAGER := preload("res://scripts/progression_manager.gd")
const GAME_MANAGER := preload("res://scripts/game_manager.gd")
const WORLD_BUILDER := preload("res://scripts/world_builder.gd")

var config: Dictionary = {}
var class_defs: Dictionary = {}
var enemy_defs: Dictionary = {}
var upgrade_defs: Array = []
var wave_defs: Array = []
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
var afterimages: Array = []
var progression: RefCounted
var game_mgr: RefCounted
var shake_magnitude: float = 0.0

var runtime_root: Node3D
var board_root: Node3D
var actor_root: Node3D
var projectile_root: Node3D
var pickup_root: Node3D
var fx_root: Node3D
var camera: Camera3D

var start_screen: PanelContainer:
	get: return ui_mgr.start_screen
var level_screen: PanelContainer:
	get: return ui_mgr.level_screen
var dash_button: Button:
	get: return ui_mgr.dash_button
var boss_panel: VBoxContainer:
	get: return ui_mgr.boss_panel
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
var board_data: Dictionary = {}
var obstacle_colliders: Array = []
var current_wave: Dictionary = {}
var run_seed: int = 0
var input_move := Vector2.ZERO
var move_velocity := Vector2.ZERO
var touch_active := false
var touch_origin := Vector2.ZERO
var touch_position := Vector2.ZERO
var dash_pressed := false
var dash_timer: float = 0.0
var dash_cooldown_timer: float = 0.0
var wave_clear_timer: float = 0.0
var test_mode: Dictionary = {}


func _ready() -> void:
	_load_definitions()
	WORLD_BUILDER.build_world(self)
	audio_mgr.attach(runtime_root.get_node("Audio"))
	combat.audio_mgr = audio_mgr
	enemies_ai.audio_mgr = audio_mgr
	ui_mgr.build_ui(self, _return_to_menu, func() -> void: dash_pressed = true, func() -> void: dash_pressed = false)
	progression = PROGRESSION_MANAGER.new(ui_mgr)
	progression.audio_mgr = audio_mgr
	game_mgr = GAME_MANAGER.new(self)
	_refresh_start_screen()
	ui_mgr.show_message("", 0.0)

func configure_test_mode(options: Dictionary) -> void: test_mode = options.duplicate(true)
func start_run(class_id: String) -> void: game_mgr.start_run(class_id)
func debug_force_level_up() -> void: _trigger_level_up()
func debug_spawn_boss() -> void: game_mgr.spawn_boss(1.0)
func debug_end_run(win: bool) -> void: game_mgr.end_run(win)
func debug_zone_at(wp: Vector3) -> String: return "arena" if Vector2(wp.x, wp.z).length() <= float(config["arena_radius"]) else "void"
func debug_is_blocked(wp: Vector3, radius: float = 0.6) -> bool: return not _can_occupy(wp, radius)
func debug_tick(delta: float) -> void: _tick(delta)

func capture_screenshot(path: String) -> void:
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var absolute_path := ProjectSettings.globalize_path(path)
	DirAccess.make_dir_recursive_absolute(absolute_path.get_base_dir())
	image.save_png(absolute_path)

func _process(delta: float) -> void:
	if not bool(test_mode.get("manual_tick", false)):
		_tick(delta)

func _tick(delta: float) -> void:
	ui_mgr.update_transient_overlays(delta)
	if state == "playing":
		game_mgr.tick_playing(delta)
	elif state == "wave_clear":
		wave_clear_timer -= delta
		if wave_clear_timer <= 0.0:
			game_mgr.start_next_wave()
	shake_magnitude = WORLD_BUILDER.update_camera(camera, player_node, state, config, delta, shake_magnitude)

func _unhandled_input(event: InputEvent) -> void:
	var s := {"dash_pressed": dash_pressed, "touch_active": touch_active, "touch_origin": touch_origin, "touch_position": touch_position, "input_move": input_move}
	player_ctrl.handle_input(event, Vector2(get_viewport().size), s)
	dash_pressed = s.get("dash_pressed", dash_pressed)
	touch_active = s.get("touch_active", touch_active)
	touch_origin = s.get("touch_origin", touch_origin)
	touch_position = s.get("touch_position", touch_position)
	input_move = s.get("input_move", input_move)
	if s.get("show_joystick", false):
		ui_mgr.show_joystick(s["joystick_base"], s["joystick_knob"])
	if s.get("hide_joystick", false):
		ui_mgr.hide_joystick()

func _load_definitions() -> void:
	for pair in [["config", "res://declarations/config/config.json"], ["class_defs", "res://declarations/classes/classes.json"], ["enemy_defs", "res://declarations/enemies/enemies.json"], ["upgrade_defs", "res://declarations/upgrades/upgrades.json"], ["wave_defs", "res://declarations/waves/waves.json"], ["present_defs", "res://declarations/presents/presents.json"]]:
		self.set(pair[0], WORLD_BUILDER.read_json(pair[1]))

func _save_manager() -> Node:
	return get_node_or_null("/root/SaveManager")
func _refresh_start_screen() -> void:
	ui_mgr.refresh_start_screen(class_defs, _save_manager(), _on_class_button_pressed, present_defs)
func _return_to_menu() -> void:
	game_mgr.return_to_menu()

func _trigger_level_up() -> void:
	progression.trigger_level_up(func(s: String) -> void: state = s, upgrade_defs, test_mode, _apply_upgrade, _on_upgrade_button_pressed)

func _apply_upgrade(upgrade_id: String) -> void:
	progression.apply_upgrade(upgrade_id, player_state)
	ui_mgr.level_screen.visible = false
	if progression.xp >= progression.xp_needed:
		_trigger_level_up()
		return
	state = "playing"
	_update_ui()

func _damage_player(amount: float) -> void:
	if bool(test_mode.get("invincible", false)) or dash_timer > 0.0:
		return
	if audio_mgr != null: audio_mgr.play_damage()
	player_state["hp"] = maxf(0.0, float(player_state["hp"]) - amount)
	shake_magnitude = 0.3
	if float(player_state["hp"]) <= 0.0:
		game_mgr.end_run(false)
	else:
		_update_ui()

func _update_ui() -> void:
	ui_mgr.update_hud(player_state, progression.xp_needed, progression.xp, progression.level, progression.kills)

func _kill_enemy(enemy_index: int) -> void:
	var enemy: Dictionary = enemies[enemy_index]
	combat.spawn_pickup(pickup_root, pickups, enemy["node"].position, enemy["drop_xp"])
	combat.spawn_hit_fx(fx_root, vfx, enemy["node"].position, enemy["color"])
	enemy["node"].queue_free()
	enemies.remove_at(enemy_index)
	progression.record_kill()
	var sm := _save_manager()
	if sm != null and sm.has_method("record_kill"): sm.record_kill()

func _spawn_hit_fx(world_position: Vector3, color: Color) -> void:
	combat.spawn_hit_fx(fx_root, vfx, world_position, color)
func _can_occupy(world_position: Vector3, radius: float) -> bool:
	return WORLD_BUILDER.can_occupy(world_position, radius, float(config["arena_radius"]), obstacle_colliders)
func _move_actor(node: Node3D, direction: Vector3, speed: float, delta: float, radius: float) -> void:
	WORLD_BUILDER.move_actor(node, direction, speed, delta, radius, float(config["arena_radius"]), obstacle_colliders)
func _on_class_button_pressed(button: Button) -> void:
	start_run(String(button.get_meta("class_id", "")))
func _on_upgrade_button_pressed(button: Button) -> void:
	_apply_upgrade(String(button.get_meta("upgrade_id", "")))
func _test_scale(key: String) -> float:
	return float(test_mode.get(key, 1.0))
