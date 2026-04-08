extends Node3D

const BOARD_GENERATOR := preload("res://scripts/board_generator.gd")

const CONFIG_PATH := "res://declarations/config/config.json"
const CLASSES_PATH := "res://declarations/classes/classes.json"
const ENEMIES_PATH := "res://declarations/enemies/enemies.json"
const UPGRADES_PATH := "res://declarations/upgrades/upgrades.json"
const WAVES_PATH := "res://declarations/waves/waves.json"

const MATERIAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/MATERIAL/1K-JPG"
const DECAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/DECAL/1K-JPG"
const PIXEL_SCALE := 8
const PIXEL_PALETTE := {
	".": Color(0, 0, 0, 0),
	"W": Color("ffffff"),
	"k": Color("000000"),
	"R": Color("ff0044"),
	"G": Color("00ffcc"),
	"Y": Color("ffd700"),
	"B": Color("0044ff"),
	"O": Color("ff8800"),
	"D": Color("333333"),
	"P": Color("9900ff"),
	"N": Color("8B4513"),
	"E": Color("00cc44"),
	"C": Color("FFD700")
}
const PIXEL_ART := {
	"elf": """
....E....
...EEE...
..EEEEE..
..WkWWkW.
...WWWW..
...EEEE..
..EE..EE.
...DDDD..
...D..D..
""",
	"santa": """
....R....
...RRR...
..WWWWW..
..WkWWkW.
..WWWWW..
..RRRRR..
.RRkRkRR.
.RRRRRRR.
...DDD...
""",
	"bumble": """
..WWWWW..
.WWWWWWW.
.WkBkWWW.
.WWWWWWW.
WWWWWWWWW
WWWWWWWWW
.WWWWWWW.
..WW.WW..
""",
	"grunt": """
...kkk...
...kkk...
..WkWkW..
..WWOWW..
...WWW...
..WWWWW..
.WWRWRWW.
.WWWWWWW.
..WWWWW..
""",
	"rusher": """
N......N
N......N
NN....NN
.NNNNNN.
.NkNNkN.
..NNNN..
...RR...
..NNNN..
.NN..NN.
""",
	"tank": """
...NNN...
..NkNkN..
..NNNNN..
NNNNNNNNN
N.NNNNN.N
N.NNNNN.N
..N.N.N..
..N...N..
""",
	"boss": """
Y......Y
YY....YY
.RRYYRR.
RRkRRkRR
RRRRRRRR
.RYYYYR.
.RRRRRR.
..RRRR..
.DD..DD.
""",
	"xp": """
WWWWWWW
WRRWRRW
WWWWWWW
WRRWRRW
WWWWWWW
"""
}

var config: Dictionary = {}
var class_defs: Dictionary = {}
var enemy_defs: Dictionary = {}
var upgrade_defs: Array = []
var wave_defs: Array = []

var board_generator := BOARD_GENERATOR.new()
var material_cache: Dictionary = {}
var texture_cache: Dictionary = {}

var runtime_root: Node3D
var board_root: Node3D
var actor_root: Node3D
var projectile_root: Node3D
var pickup_root: Node3D
var fx_root: Node3D
var world_environment: WorldEnvironment
var camera: Camera3D

var ui: CanvasLayer
var hud_root: MarginContainer
var start_screen: PanelContainer
var level_screen: PanelContainer
var end_screen: PanelContainer
var message_overlay: Label
var achievement_overlay: Label
var boss_panel: VBoxContainer
var boss_bar: ProgressBar
var hp_bar: ProgressBar
var xp_bar: ProgressBar
var hp_label: Label
var level_label: Label
var timer_label: Label
var wave_label: Label
var kills_label: Label
var end_title: Label
var end_message: Label
var end_waves: Label
var dash_button: Button
var joystick_base: ColorRect
var joystick_knob: ColorRect
var start_classes_box: HBoxContainer
var upgrade_box: HBoxContainer

var state: String = "menu"
var current_class_id: String = ""
var current_wave_index: int = -1
var wave_time_remaining: float = 0.0
var spawn_timer: float = 0.0
var kills: int = 0
var level: int = 1
var xp: int = 0
var xp_needed: int = 5
var message_timer: float = 0.0
var achievement_timer: float = 0.0
var wave_clear_timer: float = 0.0
var boss_ref: Dictionary = {}

var player_node: Node3D
var player_mesh: MeshInstance3D
var player_state: Dictionary = {}
var enemies: Array = []
var projectiles: Array = []
var pickups: Array = []
var vfx: Array = []
var board_data: Dictionary = {}
var obstacle_colliders: Array = []

var input_move := Vector2.ZERO
var move_velocity := Vector2.ZERO
var touch_active := false
var touch_origin := Vector2.ZERO
var touch_position := Vector2.ZERO
var dash_pressed := false
var dash_timer: float = 0.0
var dash_cooldown_timer: float = 0.0

var test_mode: Dictionary = {}


func _ready() -> void:
	_load_definitions()
	_build_world()
	_build_ui()
	_refresh_start_screen()
	_show_message("", 0.0)
	_show_achievement("", 0.0)


func configure_test_mode(options: Dictionary) -> void:
	test_mode = options.duplicate(true)


func start_run(class_id: String) -> void:
	if not class_defs.has(class_id):
		return
	_clear_runtime()
	current_class_id = class_id
	state = "playing"
	current_wave_index = -1
	kills = 0
	level = 1
	xp = 0
	xp_needed = 5
	dash_timer = 0.0
	dash_cooldown_timer = 0.0
	move_velocity = Vector2.ZERO
	boss_ref = {}
	_build_board()
	_spawn_player()
	_update_ui()
	start_screen.visible = false
	level_screen.visible = false
	end_screen.visible = false
	hud_root.visible = true
	dash_button.visible = true
	dash_button.disabled = false
	_start_next_wave()


func debug_force_level_up() -> void:
	_trigger_level_up()


func debug_spawn_boss() -> void:
	_spawn_boss(1.0)


func debug_end_run(win: bool) -> void:
	_end_run(win)


func debug_zone_at(world_position: Vector3) -> String:
	return _zone_at_world(world_position)


func debug_is_blocked(world_position: Vector3, radius: float = 0.6) -> bool:
	return not _can_occupy(world_position, radius)


func debug_tick(delta: float) -> void:
	_tick(delta)


func capture_screenshot(path: String) -> void:
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var absolute_path := ProjectSettings.globalize_path(path)
	var dir_path := absolute_path.get_base_dir()
	DirAccess.make_dir_recursive_absolute(dir_path)
	image.save_png(absolute_path)


func _process(delta: float) -> void:
	if bool(test_mode.get("manual_tick", false)):
		return
	_tick(delta)


func _tick(delta: float) -> void:
	_update_transient_overlays(delta)
	if state == "playing":
		_update_player(delta)
		_update_spawning(delta)
		_update_enemies(delta)
		_update_projectiles(delta)
		_update_pickups(delta)
		_update_vfx(delta)
		if current_wave_index < wave_defs.size() - 1:
			wave_time_remaining = maxf(0.0, wave_time_remaining - delta * _test_wave_scale())
			if wave_time_remaining <= 0.0 and state == "playing":
				_begin_wave_clear()
			timer_label.text = "%.1f" % wave_time_remaining
		else:
			timer_label.text = "BOSS"
	elif state == "wave_clear":
		wave_clear_timer -= delta
		if wave_clear_timer <= 0.0:
			_start_next_wave()
	_update_camera(delta)


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey:
		if event.physical_keycode == KEY_SHIFT:
			dash_pressed = event.pressed
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.position.x > get_viewport().size.x * 0.7 and touch.position.y > get_viewport().size.y * 0.65:
			dash_pressed = touch.pressed
			return
		touch_active = touch.pressed
		if touch_active:
			touch_origin = touch.position
			touch_position = touch.position
			_show_joystick(touch_origin, touch_position)
		else:
			input_move = Vector2.ZERO
			_hide_joystick()
	if event is InputEventScreenDrag and touch_active:
		var drag := event as InputEventScreenDrag
		touch_position = drag.position
		var delta_vec := touch_position - touch_origin
		input_move = delta_vec.limit_length(72.0) / 72.0
		_show_joystick(touch_origin, touch_origin + input_move * 52.0)


func _load_definitions() -> void:
	config = _read_json(CONFIG_PATH)
	class_defs = _read_json(CLASSES_PATH)
	enemy_defs = _read_json(ENEMIES_PATH)
	upgrade_defs = _read_json(UPGRADES_PATH)
	wave_defs = _read_json(WAVES_PATH)


func _save_manager() -> Node:
	return get_node_or_null("/root/SaveManager")


func _build_world() -> void:
	world_environment = WorldEnvironment.new()
	world_environment.name = "WorldEnvironment"
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color("09121b")
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.ambient_light_color = Color("a5bbd2")
	env.ambient_light_energy = 0.7
	env.fog_enabled = true
	env.fog_light_color = Color("2d4762")
	env.fog_light_energy = 0.2
	env.fog_density = 0.0022
	env.glow_enabled = true
	env.glow_intensity = 0.65
	world_environment.environment = env
	add_child(world_environment)

	camera = Camera3D.new()
	camera.name = "GameCamera"
	camera.projection = Camera3D.PROJECTION_PERSPECTIVE
	camera.fov = 55.0
	camera.position = Vector3(0, 23.0, 14.5)
	camera.look_at_from_position(camera.position, Vector3.ZERO, Vector3.UP)
	add_child(camera)

	var directional_light := DirectionalLight3D.new()
	directional_light.light_color = Color("d6ecff")
	directional_light.light_energy = 1.25
	directional_light.shadow_enabled = true
	directional_light.rotation_degrees = Vector3(-58, -34, 0)
	add_child(directional_light)

	runtime_root = Node3D.new()
	runtime_root.name = "Runtime"
	add_child(runtime_root)

	board_root = Node3D.new()
	board_root.name = "Board"
	runtime_root.add_child(board_root)

	actor_root = Node3D.new()
	actor_root.name = "Actors"
	runtime_root.add_child(actor_root)

	projectile_root = Node3D.new()
	projectile_root.name = "Projectiles"
	runtime_root.add_child(projectile_root)

	pickup_root = Node3D.new()
	pickup_root.name = "Pickups"
	runtime_root.add_child(pickup_root)

	fx_root = Node3D.new()
	fx_root.name = "Fx"
	runtime_root.add_child(fx_root)


func _update_camera(delta: float) -> void:
	if camera == null:
		return
	var target := Vector3.ZERO
	if player_node != null and state != "menu":
		target = player_node.position
	var arena_radius := float(config.get("arena_radius", 18.0))
	var target_position := target + Vector3(0, arena_radius * 1.28, arena_radius * 0.82)
	camera.position = camera.position.lerp(target_position, clampf(delta * 4.0, 0.0, 1.0))
	camera.look_at(target + Vector3(0, 0.8, 0), Vector3.UP)


func _build_ui() -> void:
	ui = CanvasLayer.new()
	ui.name = "UI"
	add_child(ui)

	var root := Control.new()
	root.name = "Root"
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(root)

	start_screen = PanelContainer.new()
	start_screen.name = "StartScreen"
	start_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	start_screen.self_modulate = Color(0.02, 0.04, 0.06, 0.94)
	root.add_child(start_screen)

	var start_margin := MarginContainer.new()
	start_margin.add_theme_constant_override("margin_left", 60)
	start_margin.add_theme_constant_override("margin_top", 48)
	start_margin.add_theme_constant_override("margin_right", 60)
	start_margin.add_theme_constant_override("margin_bottom", 48)
	start_screen.add_child(start_margin)

	var start_vbox := VBoxContainer.new()
	start_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	start_vbox.add_theme_constant_override("separation", 22)
	start_margin.add_child(start_vbox)

	var title := Label.new()
	title.text = "Protocol: Silent Night"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.modulate = Color("edf7ff")
	start_vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "10 waves to salvation"
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_font_size_override("font_size", 18)
	subtitle.modulate = Color("69d6ff")
	start_vbox.add_child(subtitle)

	start_classes_box = HBoxContainer.new()
	start_classes_box.name = "ClassCards"
	start_classes_box.alignment = BoxContainer.ALIGNMENT_CENTER
	start_classes_box.add_theme_constant_override("separation", 18)
	start_vbox.add_child(start_classes_box)

	var instruction := Label.new()
	instruction.text = "Desktop: WASD or arrows to move, Shift to dash. Mobile: drag anywhere and use the dash button."
	instruction.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	instruction.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	instruction.custom_minimum_size = Vector2(740, 0)
	instruction.modulate = Color("dceefb")
	start_vbox.add_child(instruction)

	hud_root = MarginContainer.new()
	hud_root.name = "HudMargin"
	hud_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud_root.add_theme_constant_override("margin_left", 18)
	hud_root.add_theme_constant_override("margin_top", 18)
	hud_root.add_theme_constant_override("margin_right", 18)
	hud_root.add_theme_constant_override("margin_bottom", 18)
	hud_root.visible = false
	root.add_child(hud_root)

	var hud_grid := GridContainer.new()
	hud_grid.columns = 4
	hud_grid.add_theme_constant_override("h_separation", 14)
	hud_grid.add_theme_constant_override("v_separation", 14)
	hud_root.add_child(hud_grid)

	var xp_panel := _make_hud_panel("LEVEL 1", "69d6ff")
	level_label = xp_panel["label"]
	xp_bar = xp_panel["bar"]
	hud_grid.add_child(xp_panel["node"])

	var hp_panel := _make_hud_panel("INTEGRITY", "ff617e")
	hp_bar = hp_panel["bar"]
	hp_label = hp_panel["value"]
	hud_grid.add_child(hp_panel["node"])

	var timer_panel := _make_hud_panel("WAVE 1/10", "ffe07a")
	wave_label = timer_panel["label"]
	timer_label = timer_panel["value"]
	timer_label.add_theme_font_size_override("font_size", 28)
	hud_grid.add_child(timer_panel["node"])

	var kills_panel := _make_hud_panel("PURGED", "ffd85a")
	kills_label = kills_panel["value"]
	hud_grid.add_child(kills_panel["node"])

	boss_panel = VBoxContainer.new()
	boss_panel.name = "BossPanel"
	boss_panel.set_anchors_preset(Control.PRESET_TOP_WIDE)
	boss_panel.offset_top = 110
	boss_panel.offset_left = 260
	boss_panel.offset_right = -260
	boss_panel.visible = false
	root.add_child(boss_panel)

	var boss_title := Label.new()
	boss_title.text = "KRAMPUS-PRIME"
	boss_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	boss_title.modulate = Color("ff4466")
	boss_title.add_theme_font_size_override("font_size", 22)
	boss_panel.add_child(boss_title)

	boss_bar = ProgressBar.new()
	boss_bar.max_value = 100
	boss_bar.value = 100
	boss_bar.custom_minimum_size = Vector2(0, 22)
	boss_panel.add_child(boss_bar)

	level_screen = PanelContainer.new()
	level_screen.name = "LevelScreen"
	level_screen.visible = false
	level_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	level_screen.self_modulate = Color(0.03, 0.08, 0.06, 0.94)
	root.add_child(level_screen)

	var level_margin := MarginContainer.new()
	level_margin.add_theme_constant_override("margin_left", 80)
	level_margin.add_theme_constant_override("margin_top", 80)
	level_margin.add_theme_constant_override("margin_right", 80)
	level_margin.add_theme_constant_override("margin_bottom", 80)
	level_screen.add_child(level_margin)

	var level_vbox := VBoxContainer.new()
	level_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	level_vbox.add_theme_constant_override("separation", 18)
	level_margin.add_child(level_vbox)

	var level_title := Label.new()
	level_title.name = "LevelTitle"
	level_title.text = "Festive Upgrade"
	level_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	level_title.modulate = Color("7aff8a")
	level_title.add_theme_font_size_override("font_size", 38)
	level_vbox.add_child(level_title)

	upgrade_box = HBoxContainer.new()
	upgrade_box.name = "UpgradeCards"
	upgrade_box.alignment = BoxContainer.ALIGNMENT_CENTER
	upgrade_box.add_theme_constant_override("separation", 18)
	level_vbox.add_child(upgrade_box)

	end_screen = PanelContainer.new()
	end_screen.name = "EndScreen"
	end_screen.visible = false
	end_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	end_screen.self_modulate = Color(0.02, 0.04, 0.06, 0.94)
	root.add_child(end_screen)

	var end_margin := MarginContainer.new()
	end_margin.add_theme_constant_override("margin_left", 80)
	end_margin.add_theme_constant_override("margin_top", 80)
	end_margin.add_theme_constant_override("margin_right", 80)
	end_margin.add_theme_constant_override("margin_bottom", 80)
	end_screen.add_child(end_margin)

	var end_vbox := VBoxContainer.new()
	end_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	end_vbox.add_theme_constant_override("separation", 16)
	end_margin.add_child(end_vbox)

	end_title = Label.new()
	end_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_title.add_theme_font_size_override("font_size", 42)
	end_vbox.add_child(end_title)

	end_message = Label.new()
	end_message.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_message.add_theme_font_size_override("font_size", 20)
	end_vbox.add_child(end_message)

	end_waves = Label.new()
	end_waves.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_waves.add_theme_font_size_override("font_size", 18)
	end_vbox.add_child(end_waves)

	var restart := Button.new()
	restart.text = "Main Menu"
	restart.pressed.connect(_return_to_menu)
	end_vbox.add_child(restart)

	message_overlay = Label.new()
	message_overlay.name = "MessageOverlay"
	message_overlay.set_anchors_preset(Control.PRESET_CENTER_TOP)
	message_overlay.offset_top = 160
	message_overlay.offset_left = -260
	message_overlay.offset_right = 260
	message_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_overlay.add_theme_font_size_override("font_size", 32)
	message_overlay.modulate = Color("edf7ff")
	root.add_child(message_overlay)

	achievement_overlay = Label.new()
	achievement_overlay.name = "AchievementOverlay"
	achievement_overlay.set_anchors_preset(Control.PRESET_CENTER_TOP)
	achievement_overlay.offset_top = 56
	achievement_overlay.offset_left = -340
	achievement_overlay.offset_right = 340
	achievement_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	achievement_overlay.add_theme_font_size_override("font_size", 20)
	achievement_overlay.modulate = Color("ffe680")
	root.add_child(achievement_overlay)

	dash_button = Button.new()
	dash_button.name = "DashButton"
	dash_button.text = "DASH"
	dash_button.visible = false
	dash_button.custom_minimum_size = Vector2(108, 108)
	dash_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	dash_button.offset_left = -140
	dash_button.offset_top = -140
	dash_button.offset_right = -22
	dash_button.offset_bottom = -22
	dash_button.button_down.connect(func() -> void: dash_pressed = true)
	dash_button.button_up.connect(func() -> void: dash_pressed = false)
	root.add_child(dash_button)

	joystick_base = ColorRect.new()
	joystick_base.name = "JoystickBase"
	joystick_base.visible = false
	joystick_base.color = Color(1, 1, 1, 0.15)
	joystick_base.custom_minimum_size = Vector2(92, 92)
	root.add_child(joystick_base)

	joystick_knob = ColorRect.new()
	joystick_knob.name = "JoystickKnob"
	joystick_knob.visible = false
	joystick_knob.color = Color(0.92, 0.97, 1.0, 0.9)
	joystick_knob.custom_minimum_size = Vector2(42, 42)
	root.add_child(joystick_knob)


func _make_hud_panel(label_text: String, accent: String) -> Dictionary:
	var panel := PanelContainer.new()
	panel.custom_minimum_size = Vector2(220, 92)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 6)
	margin.add_child(box)
	var label := Label.new()
	label.text = label_text
	label.modulate = Color(accent)
	box.add_child(label)
	var value := Label.new()
	value.text = "0"
	value.add_theme_font_size_override("font_size", 22)
	value.modulate = Color("edf7ff")
	box.add_child(value)
	var bar := ProgressBar.new()
	bar.max_value = 100
	bar.value = 100
	bar.custom_minimum_size = Vector2(0, 14)
	box.add_child(bar)
	return {"node": panel, "label": label, "value": value, "bar": bar}


func _refresh_start_screen() -> void:
	var save_manager := _save_manager()
	for child in start_classes_box.get_children():
		child.queue_free()
	for class_id in ["elf", "santa", "bumble"]:
		var def: Dictionary = class_defs[class_id]
		var button := Button.new()
		button.text = "%s\n%s" % [def["name"], def["weapon_name"]]
		button.custom_minimum_size = Vector2(220, 180)
		button.disabled = save_manager != null and not save_manager.is_unlocked(class_id)
		if button.disabled:
			button.text += "\nLOCKED"
		button.set_meta("class_id", class_id)
		button.pressed.connect(_on_class_button_pressed.bind(button))
		start_classes_box.add_child(button)


func _return_to_menu() -> void:
	state = "menu"
	move_velocity = Vector2.ZERO
	input_move = Vector2.ZERO
	touch_active = false
	end_screen.visible = false
	level_screen.visible = false
	dash_button.visible = false
	hud_root.visible = false
	start_screen.visible = true
	boss_panel.visible = false
	_hide_joystick()
	_clear_runtime()
	_refresh_start_screen()


func _build_board() -> void:
	obstacle_colliders.clear()
	board_data = board_generator.generate_board(int(config.get("board_seed", 1225)) + level, config)
	_build_board_foundation()
	_build_snow_drifts()
	_build_outer_ridge()


func _build_board_foundation() -> void:
	var arena_radius: float = float(config.get("arena_radius", 18.0))

	var outer_field := MeshInstance3D.new()
	var outer_field_mesh := PlaneMesh.new()
	outer_field_mesh.size = Vector2((arena_radius + 18.0) * 2.0, (arena_radius + 18.0) * 2.0)
	outer_field.mesh = outer_field_mesh
	outer_field.position = Vector3(0, -0.02, 0)
	outer_field.material_override = _outer_field_material(arena_radius)
	board_root.add_child(outer_field)

	var slab := MeshInstance3D.new()
	var slab_mesh := CylinderMesh.new()
	slab_mesh.top_radius = arena_radius + 0.45
	slab_mesh.bottom_radius = arena_radius + 0.8
	slab_mesh.height = 0.8
	slab.mesh = slab_mesh
	slab.position = Vector3(0, -0.4, 0)
	slab.material_override = _flat_material(Color("213347"))
	board_root.add_child(slab)

	var arena_surface := MeshInstance3D.new()
	var arena_surface_mesh := PlaneMesh.new()
	arena_surface_mesh.size = Vector2((arena_radius + 0.75) * 2.0, (arena_radius + 0.75) * 2.0)
	arena_surface.mesh = arena_surface_mesh
	arena_surface.position = Vector3(0, 0.03, 0)
	arena_surface.material_override = _arena_surface_material(arena_radius)
	board_root.add_child(arena_surface)


func _build_snow_drifts() -> void:
	var snow_material := _material_for_zone("snow")
	for drift in board_data.get("drifts", []):
		var node := MeshInstance3D.new()
		var mesh := CylinderMesh.new()
		var radius := float(drift.get("radius", 1.8))
		mesh.top_radius = radius
		mesh.bottom_radius = radius * 0.94
		mesh.height = 0.06
		node.mesh = mesh
		node.position = Vector3(float(drift["world"].x), 0.04, float(drift["world"].y))
		node.scale = Vector3(float(drift.get("stretch", 1.0)), 1.0, 1.0 / maxf(float(drift.get("stretch", 1.0)), 0.01))
		node.rotation.y = float(drift.get("rotation", 0.0))
		node.material_override = snow_material
		board_root.add_child(node)


func _build_outer_ridge() -> void:
	for ridge in board_data.get("ridges", []):
		var body := MeshInstance3D.new()
		var body_mesh := CylinderMesh.new()
		var ridge_radius := float(ridge.get("radius", 1.8))
		var ridge_height := float(ridge.get("height", 4.2))
		body_mesh.top_radius = ridge_radius * 0.82
		body_mesh.bottom_radius = ridge_radius * 1.15
		body_mesh.height = ridge_height
		body.mesh = body_mesh
		body.position = Vector3(float(ridge["world"].x), ridge_height * 0.42 - 0.45, float(ridge["world"].y))
		body.rotation.y = float(ridge.get("rotation", 0.0))
		body.material_override = _flat_material(Color("4f6a82"))
		board_root.add_child(body)

		if bool(ridge.get("snow_cap", true)):
			var cap := MeshInstance3D.new()
			var cap_mesh := SphereMesh.new()
			cap_mesh.radius = ridge_radius * 0.62
			cap_mesh.height = ridge_radius * 1.2
			cap.mesh = cap_mesh
			cap.position = body.position + Vector3(0, ridge_height * 0.42, 0)
			cap.material_override = _flat_material(Color("edf8ff"))
			board_root.add_child(cap)


func _spawn_player() -> void:
	player_node = Node3D.new()
	player_node.name = "Player"
	actor_root.add_child(player_node)
	var player_scale := 0.95
	match current_class_id:
		"santa":
			player_scale = 1.2
		"bumble":
			player_scale = 1.4
	player_mesh = _make_billboard_sprite(current_class_id, 2.35, Color(class_defs[current_class_id]["color"]))
	player_node.add_child(player_mesh)
	player_node.position = Vector3(0, 0.12, 0)
	player_node.scale = Vector3.ONE * player_scale

	var shadow := MeshInstance3D.new()
	var shadow_mesh := PlaneMesh.new()
	shadow_mesh.size = Vector2(1.15, 1.15)
	shadow.mesh = shadow_mesh
	shadow.position = Vector3(0, -0.58, 0)
	shadow.material_override = _shadow_material()
	player_node.add_child(shadow)

	var thruster_ring := MeshInstance3D.new()
	var thruster_mesh := TorusMesh.new()
	thruster_mesh.outer_radius = 0.32
	thruster_mesh.inner_radius = 0.06
	thruster_ring.mesh = thruster_mesh
	thruster_ring.rotation_degrees = Vector3(90, 0, 0)
	thruster_ring.position = Vector3(0, -0.12, 0)
	thruster_ring.material_override = _emissive_material(Color(class_defs[current_class_id]["accent"]), 1.1, 0.25)
	player_node.add_child(thruster_ring)

	var player_class: Dictionary = class_defs[current_class_id].duplicate(true)
	player_state = {
		"class": player_class,
		"hp": float(player_class["max_hp"]),
		"max_hp": float(player_class["max_hp"]),
		"last_shot": 0.0,
		"aura_level": 0,
		"aura_timer": 0.0,
		"shake": 0.0
	}
	hp_bar.max_value = player_state["max_hp"]
	xp_bar.max_value = xp_needed
	_update_ui()


func _start_next_wave() -> void:
	current_wave_index += 1
	if current_wave_index >= wave_defs.size():
		_end_run(true)
		return
	var wave: Dictionary = wave_defs[current_wave_index]
	var save_manager := _save_manager()
	wave_time_remaining = float(wave["duration"])
	spawn_timer = 0.0
	state = "playing"
	wave_label.text = "WAVE %d/10" % wave["id"]
	_show_message("WAVE %d" % wave["id"], 1.8, Color("ff4466") if int(wave["id"]) == 10 else Color("edf7ff"))
	if save_manager != null and int(wave["id"]) == 5 and save_manager.unlock("santa"):
		_show_achievement("MECHA-SANTA UNLOCKED")
		_refresh_start_screen()
	if save_manager != null:
		save_manager.register_wave_reached(int(wave["id"]))


func _begin_wave_clear() -> void:
	state = "wave_clear"
	wave_clear_timer = 2.0
	_show_message("WAVE CLEARED", 1.6, Color("69d6ff"))
	for enemy in enemies:
		_spawn_pickup(enemy["node"].position, enemy["drop_xp"])
		enemy["node"].queue_free()
	enemies.clear()


func _update_spawning(delta: float) -> void:
	if boss_ref.size() > 0:
		return
	var wave: Dictionary = wave_defs[current_wave_index]
	spawn_timer += delta * _test_wave_scale()
	if spawn_timer < float(wave["spawn_interval"]):
		return
	spawn_timer = 0.0
	var enemy_type: String = wave["enemy_types"][randi() % wave["enemy_types"].size()]
	if enemy_type == "boss":
		_spawn_boss(float(wave["hp_scale"]))
	else:
		_spawn_enemy(enemy_type, float(wave["hp_scale"]))


func _spawn_enemy(enemy_type: String, hp_scale: float) -> void:
	var def: Dictionary = enemy_defs[enemy_type]
	var enemy_node := Node3D.new()
	enemy_node.name = "Enemy_%s" % enemy_type
	var mesh_instance := _make_billboard_sprite(enemy_type, 2.0, Color(def["color"]))
	enemy_node.add_child(mesh_instance)
	var shadow := MeshInstance3D.new()
	var shadow_mesh := PlaneMesh.new()
	shadow_mesh.size = Vector2(1.1, 1.1)
	shadow.mesh = shadow_mesh
	shadow.position = Vector3(0, -0.56, 0)
	shadow.material_override = _shadow_material()
	enemy_node.add_child(shadow)
	actor_root.add_child(enemy_node)
	var angle := randf() * TAU
	var radius := float(config["arena_radius"]) - 1.5
	enemy_node.position = Vector3(cos(angle) * radius, 0.58, sin(angle) * radius)
	var scale_value := float(def["scale"])
	enemy_node.scale = Vector3.ONE * scale_value
	enemies.append({
		"id": enemy_type,
		"node": enemy_node,
		"hp": float(def["max_hp"]) * hp_scale,
		"max_hp": float(def["max_hp"]) * hp_scale,
		"speed": float(def["speed"]),
		"contact_damage": float(def["contact_damage"]),
		"drop_xp": int(def["drop_xp"]),
		"color": Color(def["color"]),
		"attack_timer": 0.0
	})


func _spawn_boss(hp_scale: float) -> void:
	if boss_ref.size() > 0:
		return
	var def: Dictionary = enemy_defs["boss"]
	var boss_node := Node3D.new()
	boss_node.name = "Boss"
	var body := _make_billboard_sprite("boss", 4.4, Color(def["color"]))
	boss_node.add_child(body)
	var shadow := MeshInstance3D.new()
	var shadow_mesh := PlaneMesh.new()
	shadow_mesh.size = Vector2(2.9, 2.9)
	shadow.mesh = shadow_mesh
	shadow.position = Vector3(0, -0.92, 0)
	shadow.material_override = _shadow_material()
	boss_node.add_child(shadow)
	var ring := MeshInstance3D.new()
	var torus := TorusMesh.new()
	torus.outer_radius = 1.6
	torus.inner_radius = 0.15
	ring.mesh = torus
	ring.rotation_degrees = Vector3(90, 0, 0)
	ring.position = Vector3(0, 1.3, 0)
	ring.material_override = _emissive_material(Color("ffe07a"), 2.0, 0.2)
	boss_node.add_child(ring)
	boss_node.position = Vector3(0, 0.18, -float(config["arena_radius"]) + 2.5)
	actor_root.add_child(boss_node)
	boss_ref = {
		"id": "boss",
		"node": boss_node,
		"ring": ring,
		"hp": float(def["max_hp"]) * hp_scale * _test_boss_hp_scale(),
		"max_hp": float(def["max_hp"]) * hp_scale * _test_boss_hp_scale(),
		"speed": float(def["speed"]),
		"contact_damage": float(def["contact_damage"]),
		"color": Color(def["color"]),
		"attack_timer": 0.0
	}
	boss_panel.visible = true
	boss_bar.max_value = boss_ref["max_hp"]
	boss_bar.value = boss_ref["hp"]
	_show_message("KRAMPUS DETECTED", 2.2, Color("ff4466"))


func _update_player(delta: float) -> void:
	if player_node == null:
		return
	var desired_move := _read_move_input()
	move_velocity = move_velocity.lerp(desired_move, clampf(delta * 8.0, 0.0, 1.0))
	if dash_cooldown_timer > 0.0:
		dash_cooldown_timer -= delta
		dash_button.disabled = dash_cooldown_timer > 0.0
	if dash_pressed and dash_cooldown_timer <= 0.0:
		dash_timer = float(config["dash_duration"])
		dash_cooldown_timer = float(config["dash_cooldown"])
		dash_pressed = false
	var speed := float(player_state["class"]["speed"]) * _test_player_speed_scale()
	if dash_timer > 0.0:
		dash_timer -= delta
		speed *= 2.8
	_move_actor(player_node, Vector3(move_velocity.x, 0.0, move_velocity.y), speed, delta, 0.62)
	if move_velocity.length() > 0.01:
		player_mesh.rotation.y = atan2(move_velocity.x, move_velocity.y)
	_auto_fire(delta)
	_update_player_aura(delta)


func _read_move_input() -> Vector2:
	var move := input_move
	if not touch_active:
		move = Vector2.ZERO
		if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
			move.x -= 1.0
		if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
			move.x += 1.0
		if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
			move.y -= 1.0
		if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
			move.y += 1.0
	if move.length() > 1.0:
		move = move.normalized()
	return move


func _auto_fire(delta: float) -> void:
	player_state["last_shot"] += delta
	if player_state["last_shot"] < float(player_state["class"]["fire_rate"]) / _test_player_fire_scale():
		return
	var target := _closest_target()
	if target.is_empty():
		return
	player_state["last_shot"] = 0.0
	var origin := player_node.position + Vector3(0, 0.55, 0)
	var target_position: Vector3 = target["node"].position
	var dir := (target_position - origin).normalized()
	var shot_count := int(player_state["class"]["shot_count"])
	var spread := float(player_state["class"]["spread"])
	for shot_index in range(shot_count):
		var shot_dir := dir
		if shot_count > 1:
			var normalized_index := float(shot_index) - float(shot_count - 1) * 0.5
			shot_dir = dir.rotated(Vector3.UP, normalized_index * spread)
		else:
			shot_dir = dir.rotated(Vector3.UP, randf_range(-spread, spread) * 0.35)
		_spawn_projectile(origin, shot_dir, false, float(player_state["class"]["damage"]) * _test_player_damage_scale(), int(player_state["class"]["pierce"]), float(player_state["class"]["bullet_speed"]), float(player_state["class"]["bullet_scale"]))


func _closest_target() -> Dictionary:
	var best: Dictionary = {}
	var best_distance := INF
	var range_limit := float(player_state["class"]["range"])
	for enemy in enemies:
		var distance := player_node.position.distance_to(enemy["node"].position)
		if distance < range_limit and distance < best_distance:
			best_distance = distance
			best = enemy
	if boss_ref.size() > 0:
		var boss_distance := player_node.position.distance_to(boss_ref["node"].position)
		if boss_distance < range_limit + 4.0 and boss_distance < best_distance:
			best = boss_ref
	return best


func _spawn_projectile(origin: Vector3, direction: Vector3, hostile: bool, damage: float, pierce: int, speed: float, scale_value: float) -> void:
	var node := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = scale_value
	sphere.height = scale_value * 2.0
	node.mesh = sphere
	node.material_override = _emissive_material(Color("ff617e") if hostile else Color(player_state["class"]["color"]), 1.6, 0.08)
	node.position = origin
	projectile_root.add_child(node)
	projectiles.append({
		"node": node,
		"direction": direction,
		"hostile": hostile,
		"damage": damage,
		"pierce": pierce,
		"speed": speed,
		"life": 1.0
	})


func _update_projectiles(delta: float) -> void:
	for index in range(projectiles.size() - 1, -1, -1):
		var projectile: Dictionary = projectiles[index]
		projectile["life"] -= delta
		projectile["node"].position += projectile["direction"] * float(projectile["speed"]) * delta
		var remove: bool = projectile["life"] <= 0.0
		if not remove and bool(projectile["hostile"]) and _projectile_hits_obstacle(projectile["node"].position):
			_spawn_hit_fx(Vector3(projectile["node"].position.x, 0.72, projectile["node"].position.z), Color("dceefb"))
			remove = true
		if projectile["hostile"]:
			if player_node != null and projectile["node"].position.distance_to(player_node.position) < 0.9:
				_damage_player(float(projectile["damage"]))
				remove = true
		else:
			for enemy_index in range(enemies.size() - 1, -1, -1):
				var enemy: Dictionary = enemies[enemy_index]
				if projectile["node"].position.distance_to(enemy["node"].position) < 0.9 * float(enemy["node"].scale.x):
					enemy["hp"] -= float(projectile["damage"])
					_spawn_hit_fx(enemy["node"].position, enemy["color"])
					projectile["pierce"] -= 1
					if enemy["hp"] <= 0.0:
						_kill_enemy(enemy_index)
					if projectile["pierce"] <= 0:
						remove = true
						break
			if not remove and boss_ref.size() > 0 and projectile["node"].position.distance_to(boss_ref["node"].position) < 1.8:
				boss_ref["hp"] -= float(projectile["damage"])
				boss_bar.value = boss_ref["hp"]
				_spawn_hit_fx(boss_ref["node"].position, boss_ref["color"])
				projectile["pierce"] -= 1
				if boss_ref["hp"] <= 0.0:
					boss_ref["node"].queue_free()
					boss_ref = {}
					boss_panel.visible = false
					_end_run(true)
				if projectile["pierce"] <= 0:
					remove = true
		if remove:
			projectile["node"].queue_free()
			projectiles.remove_at(index)
		else:
			projectiles[index] = projectile


func _update_enemies(delta: float) -> void:
	for index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[index]
		var direction: Vector3 = (player_node.position - enemy["node"].position).normalized()
		_move_actor(enemy["node"], direction, float(enemy["speed"]), delta, 0.52 + float(enemy["node"].scale.x) * 0.3)
		if enemy["node"].position.distance_to(player_node.position) < 0.9 + float(enemy["node"].scale.x) * 0.35:
			_damage_player(float(enemy["contact_damage"]) * delta * 2.0)
		enemies[index] = enemy
	if boss_ref.size() > 0:
		var boss_dir: Vector3 = (player_node.position - boss_ref["node"].position).normalized()
		if boss_ref["node"].position.distance_to(player_node.position) > 8.0:
			_move_actor(boss_ref["node"], boss_dir, float(boss_ref["speed"]), delta, 1.2)
		boss_ref["ring"].rotation_degrees.y += 120.0 * delta
		boss_ref["attack_timer"] += delta
		if boss_ref["attack_timer"] >= 1.15 / _test_boss_attack_scale():
			boss_ref["attack_timer"] = 0.0
			for shot in range(-2, 3):
				_spawn_projectile(boss_ref["node"].position + Vector3(0, 0.6, 0), boss_dir.rotated(Vector3.UP, shot * 0.12), true, 18.0, 1, 18.0, 0.35)
		if boss_ref["node"].position.distance_to(player_node.position) < 1.65:
			_damage_player(float(boss_ref["contact_damage"]) * delta * 1.5)


func _update_pickups(delta: float) -> void:
	for index in range(pickups.size() - 1, -1, -1):
		var pickup: Dictionary = pickups[index]
		var to_player: Vector3 = player_node.position - pickup["node"].position
		var dist := Vector2(to_player.x, to_player.z).length()
		pickup["time"] = float(pickup.get("time", 0.0)) + delta
		pickup["node"].rotation_degrees.y += 120.0 * delta
		if dist <= float(config["pickup_magnet_radius"]) or bool(test_mode.get("auto_collect", false)):
			pickup["node"].position += to_player.normalized() * delta * 10.0
		else:
			pickup["node"].position.y = float(pickup["base_y"]) + sin(float(pickup["time"]) * 4.0 + float(pickup["phase"])) * 0.12
		if dist <= float(config["pickup_auto_collect_radius"]) or bool(test_mode.get("auto_collect", false)):
			_gain_xp(int(pickup["value"]))
			pickup["node"].queue_free()
			pickups.remove_at(index)
		else:
			pickups[index] = pickup


func _update_vfx(delta: float) -> void:
	for index in range(vfx.size() - 1, -1, -1):
		var fx: Dictionary = vfx[index]
		fx["life"] -= delta
		fx["node"].scale = fx["node"].scale.lerp(Vector3.ZERO, delta * 8.0)
		if fx["life"] <= 0.0:
			fx["node"].queue_free()
			vfx.remove_at(index)
		else:
			vfx[index] = fx


func _update_player_aura(delta: float) -> void:
	if int(player_state["aura_level"]) <= 0:
		return
	player_state["aura_timer"] += delta
	if player_state["aura_timer"] < 0.55:
		return
	player_state["aura_timer"] = 0.0
	var aura_radius := 2.8 + float(player_state["aura_level"]) * 0.65
	var aura_damage := 7.0 * float(player_state["aura_level"]) * _test_player_damage_scale()
	for enemy_index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[enemy_index]
		if enemy["node"].position.distance_to(player_node.position) <= aura_radius:
			enemy["hp"] -= aura_damage
			_spawn_hit_fx(enemy["node"].position, Color("66fff4"))
			if enemy["hp"] <= 0.0:
				_kill_enemy(enemy_index)
			else:
				enemies[enemy_index] = enemy
	if boss_ref.size() > 0 and boss_ref["node"].position.distance_to(player_node.position) <= aura_radius + 1.0:
		boss_ref["hp"] -= aura_damage * 0.45
		boss_bar.value = boss_ref["hp"]


func _kill_enemy(enemy_index: int) -> void:
	var enemy: Dictionary = enemies[enemy_index]
	_spawn_pickup(enemy["node"].position, enemy["drop_xp"])
	_spawn_hit_fx(enemy["node"].position, enemy["color"])
	enemy["node"].queue_free()
	enemies.remove_at(enemy_index)
	kills += 1
	kills_label.text = str(kills)


func _spawn_pickup(world_position: Vector3, value: int) -> void:
	var node := Node3D.new()
	var sprite := _make_billboard_sprite("xp", 1.25, Color("8cff8e"))
	node.add_child(sprite)
	node.position = world_position + Vector3(0, 0.18, 0)
	pickup_root.add_child(node)
	pickups.append({
		"node": node,
		"value": value,
		"base_y": node.position.y,
		"phase": randf() * TAU,
		"time": 0.0
	})


func _spawn_hit_fx(world_position: Vector3, color: Color) -> void:
	var node := MeshInstance3D.new()
	var sphere := SphereMesh.new()
	sphere.radius = 0.32
	sphere.height = 0.64
	node.mesh = sphere
	node.position = world_position + Vector3(0, 0.7, 0)
	node.material_override = _emissive_material(color, 1.1, 0.18)
	fx_root.add_child(node)
	vfx.append({
		"node": node,
		"life": 0.25
	})


func _gain_xp(amount: int) -> void:
	xp += amount
	if xp >= xp_needed:
		_trigger_level_up()
	else:
		_update_ui()


func _trigger_level_up() -> void:
	state = "level_up"
	xp -= xp_needed
	level += 1
	xp_needed = int(round(xp_needed * 1.45))
	xp_bar.max_value = xp_needed
	level_label.text = "LEVEL %d" % level
	level_screen.visible = true
	_show_message("FESTIVE UPGRADE", 1.4, Color("7aff8a"))
	for child in upgrade_box.get_children():
		child.queue_free()
	var choices := upgrade_defs.duplicate(true)
	choices.shuffle()
	choices = choices.slice(0, 3)
	for choice in choices:
		var button := Button.new()
		button.text = "%s\n%s" % [choice["name"], choice["description"]]
		button.custom_minimum_size = Vector2(220, 160)
		button.set_meta("upgrade_id", choice["id"])
		button.pressed.connect(_on_upgrade_button_pressed.bind(button))
		upgrade_box.add_child(button)
	if bool(test_mode.get("auto_choose_upgrade", false)) and choices.size() > 0:
		_apply_upgrade(choices[0]["id"])


func _apply_upgrade(upgrade_id: String) -> void:
	var cls: Dictionary = player_state["class"]
	match upgrade_id:
		"damage":
			cls["damage"] = float(cls["damage"]) * 1.25
		"fire_rate":
			cls["fire_rate"] = float(cls["fire_rate"]) * 0.82
		"health":
			player_state["max_hp"] += 50.0
			player_state["hp"] = minf(player_state["max_hp"], float(player_state["hp"]) + 50.0)
		"speed":
			cls["speed"] = float(cls["speed"]) * 1.15
		"range":
			cls["range"] = float(cls["range"]) * 1.2
		"aura":
			player_state["aura_level"] = int(player_state["aura_level"]) + 1
	level_screen.visible = false
	if xp >= xp_needed:
		_trigger_level_up()
		return
	state = "playing"
	_update_ui()


func _damage_player(amount: float) -> void:
	if bool(test_mode.get("invincible", false)):
		return
	if dash_timer > 0.0:
		return
	player_state["hp"] = maxf(0.0, float(player_state["hp"]) - amount)
	if float(player_state["hp"]) <= 0.0:
		_end_run(false)
	else:
		_update_ui()


func _end_run(win: bool) -> void:
	state = "win" if win else "game_over"
	end_screen.visible = true
	hud_root.visible = false
	dash_button.visible = false
	boss_panel.visible = false
	var save_manager := _save_manager()
	if win and save_manager != null and save_manager.unlock("bumble"):
		_show_achievement("THE BUMBLE UNLOCKED")
		_refresh_start_screen()
	end_title.text = "CAMPAIGN SECURED" if win else "OVERWHELMED"
	end_title.modulate = Color("69d6ff") if win else Color("ff617e")
	end_message.text = "Krampus-Prime purged." if win else "Operator down."
	end_waves.text = "Waves cleared: %d/10" % max(1, current_wave_index + 1)


func _update_ui() -> void:
	if hp_bar != null:
		hp_bar.max_value = player_state.get("max_hp", 100.0)
		hp_bar.value = player_state.get("hp", 100.0)
	if hp_label != null:
		hp_label.text = "%d / %d" % [int(round(player_state.get("hp", 100.0))), int(round(player_state.get("max_hp", 100.0)))]
	if xp_bar != null:
		xp_bar.max_value = xp_needed
		xp_bar.value = xp
	if level_label != null:
		level_label.text = "LEVEL %d" % level
	if kills_label != null:
		kills_label.text = str(kills)


func _show_message(text: String, duration: float, color: Color = Color.WHITE) -> void:
	message_overlay.text = text
	message_overlay.modulate = color
	message_timer = duration


func _show_achievement(text: String, duration: float = 3.0) -> void:
	achievement_overlay.text = text
	achievement_timer = duration


func _update_transient_overlays(delta: float) -> void:
	if message_timer > 0.0:
		message_timer -= delta
		message_overlay.visible = true
		message_overlay.modulate.a = clampf(message_timer / 0.3 if message_timer < 0.3 else 1.0, 0.0, 1.0)
	else:
		message_overlay.visible = false
	if achievement_timer > 0.0:
		achievement_timer -= delta
		achievement_overlay.visible = true
		achievement_overlay.modulate.a = clampf(achievement_timer / 0.3 if achievement_timer < 0.3 else 1.0, 0.0, 1.0)
	else:
		achievement_overlay.visible = false


func _show_joystick(base_pos: Vector2, knob_pos: Vector2) -> void:
	joystick_base.visible = true
	joystick_knob.visible = true
	joystick_base.position = base_pos - joystick_base.custom_minimum_size * 0.5
	joystick_knob.position = knob_pos - joystick_knob.custom_minimum_size * 0.5


func _hide_joystick() -> void:
	joystick_base.visible = false
	joystick_knob.visible = false


func _clear_runtime() -> void:
	for array_ref in [enemies, projectiles, pickups, vfx]:
		for entry in array_ref:
			if entry.has("node") and entry["node"] != null:
				entry["node"].queue_free()
		array_ref.clear()
	obstacle_colliders.clear()
	boss_ref = {}
	for child in board_root.get_children():
		child.queue_free()
	for child in actor_root.get_children():
		child.queue_free()
	if player_node != null:
		player_node.queue_free()
	player_node = null


func _make_obstacle(obstacle: Dictionary) -> void:
	var node := Node3D.new()
	node.position = Vector3(obstacle["world"].x, 0.55, obstacle["world"].y)
	var mesh_instance := MeshInstance3D.new()
	var obstacle_type := String(obstacle["type"])
	match obstacle_type:
		"gift_stack":
			var box := BoxMesh.new()
			box.size = Vector3(1.1, 1.1, 1.1)
			mesh_instance.mesh = box
			mesh_instance.material_override = _flat_material(Color("d6365a"))
			var ribbon := MeshInstance3D.new()
			var ribbon_box := BoxMesh.new()
			ribbon_box.size = Vector3(0.18, 1.18, 1.18)
			ribbon.mesh = ribbon_box
			ribbon.material_override = _flat_material(Color("ffd66e"))
			node.add_child(ribbon)
			var bow := MeshInstance3D.new()
			var bow_mesh := TorusMesh.new()
			bow_mesh.outer_radius = 0.26
			bow_mesh.inner_radius = 0.07
			bow.mesh = bow_mesh
			bow.rotation_degrees = Vector3(90, 0, 0)
			bow.position = Vector3(0, 0.62, 0)
			bow.material_override = _emissive_material(Color("ffd66e"), 1.2, 0.2)
			node.add_child(bow)
		"bollard_cluster":
			var cylinder := CylinderMesh.new()
			cylinder.top_radius = 0.22
			cylinder.bottom_radius = 0.26
			cylinder.height = 1.2
			mesh_instance.mesh = cylinder
			mesh_instance.material_override = _flat_material(Color("74dfff"))
			for offset in [Vector3(0.34, -0.1, 0.18), Vector3(-0.28, 0.0, -0.22)]:
				var side := MeshInstance3D.new()
				var side_mesh := CylinderMesh.new()
				side_mesh.top_radius = 0.15
				side_mesh.bottom_radius = 0.18
				side_mesh.height = 0.86
				side.mesh = side_mesh
				side.position = offset
				side.material_override = _flat_material(Color("4ec9ff"))
				node.add_child(side)
		_:
			var crate := BoxMesh.new()
			crate.size = Vector3(1.35, 0.95, 1.35)
			mesh_instance.mesh = crate
			mesh_instance.material_override = _flat_material(Color("605b74"))
			var stripe := MeshInstance3D.new()
			var stripe_mesh := BoxMesh.new()
			stripe_mesh.size = Vector3(1.4, 0.12, 0.2)
			stripe.mesh = stripe_mesh
			stripe.position = Vector3(0, 0.18, 0.48)
			stripe.material_override = _emissive_material(Color("ffe07a"), 1.0, 0.18)
			node.add_child(stripe)
	node.add_child(mesh_instance)
	board_root.add_child(node)
	obstacle_colliders.append({
		"world": Vector2(node.position.x, node.position.z),
		"radius": _obstacle_radius(obstacle_type),
		"type": obstacle_type
	})


func _make_landmark(landmark: Dictionary) -> void:
	var node := Node3D.new()
	node.position = Vector3(landmark["world"].x, 0.7, landmark["world"].y)
	match String(landmark["type"]):
		"candy_cane_gate":
			for dir in [-1.0, 1.0]:
				var pole := MeshInstance3D.new()
				var pole_mesh := CylinderMesh.new()
				pole_mesh.top_radius = 0.15
				pole_mesh.bottom_radius = 0.15
				pole_mesh.height = 2.2
				pole.mesh = pole_mesh
				pole.position = Vector3(dir * 0.55, 0.6, 0)
				pole.material_override = _flat_material(Color("ff5d7d") if dir < 0.0 else Color("f4fcff"))
				node.add_child(pole)
			var crossbar := MeshInstance3D.new()
			var crossbar_mesh := BoxMesh.new()
			crossbar_mesh.size = Vector3(1.36, 0.18, 0.24)
			crossbar.mesh = crossbar_mesh
			crossbar.position = Vector3(0, 1.55, 0)
			crossbar.material_override = _emissive_material(Color("ffe07a"), 1.1, 0.24)
			node.add_child(crossbar)
		"wreath_machine":
			var ring := MeshInstance3D.new()
			var torus := TorusMesh.new()
			torus.outer_radius = 0.75
			torus.inner_radius = 0.16
			ring.mesh = torus
			ring.rotation_degrees = Vector3(90, 0, 0)
			ring.material_override = _emissive_material(Color("49d98c"), 1.6, 0.2)
			node.add_child(ring)
			var core := MeshInstance3D.new()
			var core_mesh := CylinderMesh.new()
			core_mesh.top_radius = 0.22
			core_mesh.bottom_radius = 0.28
			core_mesh.height = 1.05
			core.mesh = core_mesh
			core.position = Vector3(0, 0.15, 0)
			core.material_override = _flat_material(Color("23313e"))
			node.add_child(core)
		"present_heap":
			for offset in [Vector3(-0.45, 0, 0), Vector3(0.45, 0, 0), Vector3(0, 0.45, 0.4)]:
				var gift := MeshInstance3D.new()
				var gift_mesh := BoxMesh.new()
				gift_mesh.size = Vector3(0.8, 0.8, 0.8)
				gift.mesh = gift_mesh
				gift.position = offset
				gift.material_override = _flat_material([Color("d6365a"), Color("49d98c"), Color("ffd66e")][randi() % 3])
				node.add_child(gift)
		"signal_pylon":
			var stem := MeshInstance3D.new()
			var stem_mesh := CylinderMesh.new()
			stem_mesh.top_radius = 0.18
			stem_mesh.bottom_radius = 0.24
			stem_mesh.height = 2.6
			stem.mesh = stem_mesh
			stem.material_override = _flat_material(Color("9ec9ff"))
			node.add_child(stem)
			var beacon := MeshInstance3D.new()
			var beacon_mesh := SphereMesh.new()
			beacon_mesh.radius = 0.28
			beacon_mesh.height = 0.56
			beacon.mesh = beacon_mesh
			beacon.position = Vector3(0, 1.1, 0)
			beacon.material_override = _emissive_material(Color("ff617e"), 2.0, 0.12)
			node.add_child(beacon)
	board_root.add_child(node)


func _obstacle_radius(obstacle_type: String) -> float:
	match obstacle_type:
		"gift_stack":
			return 0.76
		"bollard_cluster":
			return 0.58
		_:
			return 0.84


func _zone_at_world(world_position: Vector3) -> String:
	return "arena" if Vector2(world_position.x, world_position.z).length() <= float(config["arena_radius"]) else "void"


func _can_occupy(world_position: Vector3, radius: float) -> bool:
	if Vector2(world_position.x, world_position.z).length() > float(config["arena_radius"]) - 1.2:
		return false
	var world_flat := Vector2(world_position.x, world_position.z)
	for collider in obstacle_colliders:
		var clearance := float(collider["radius"]) + radius
		if world_flat.distance_to(collider["world"]) < clearance:
			return false
	return true


func _move_actor(node: Node3D, direction: Vector3, speed: float, delta: float, radius: float) -> void:
	if direction.length_squared() <= 0.0001:
		return
	var next_position := node.position + direction * speed * delta
	if _can_occupy(next_position, radius):
		node.position = next_position
		return
	var flat_direction := Vector2(direction.x, direction.z)
	if flat_direction.length_squared() <= 0.0001:
		return
	var slide_axis := Vector2(-flat_direction.y, flat_direction.x).normalized()
	for slide in [slide_axis, -slide_axis]:
		var slide_position := node.position + Vector3(slide.x, 0.0, slide.y) * speed * delta * 0.72
		if _can_occupy(slide_position, radius):
			node.position = slide_position
			return


func _projectile_hits_obstacle(world_position: Vector3) -> bool:
	var world_flat := Vector2(world_position.x, world_position.z)
	for collider in obstacle_colliders:
		if world_flat.distance_to(collider["world"]) < float(collider["radius"]) + 0.18:
			return true
	return false


func _pixel_texture(art_id: String) -> Texture2D:
	var key := "pixel:%s" % art_id
	if texture_cache.has(key):
		return texture_cache[key]
	if not PIXEL_ART.has(art_id):
		return null
	var rows: PackedStringArray = String(PIXEL_ART[art_id]).strip_edges().split("\n")
	var height := rows.size()
	var width := rows[0].length()
	var image := Image.create(width * PIXEL_SCALE, height * PIXEL_SCALE, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	for y in range(height):
		var row := rows[y]
		for x in range(width):
			var symbol := row.substr(x, 1)
			if not PIXEL_PALETTE.has(symbol):
				continue
			var color: Color = PIXEL_PALETTE[symbol]
			if color.a <= 0.0:
				continue
			for py in range(PIXEL_SCALE):
				for px in range(PIXEL_SCALE):
					image.set_pixel(x * PIXEL_SCALE + px, y * PIXEL_SCALE + py, color)
	var texture := ImageTexture.create_from_image(image)
	texture_cache[key] = texture
	return texture


func _billboard_material(art_id: String, glow_color: Color = Color.WHITE) -> Material:
	var key := "billboard:%s:%s" % [art_id, glow_color.to_html()]
	if material_cache.has(key):
		return material_cache[key]
	var material := StandardMaterial3D.new()
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	material.albedo_texture = _pixel_texture(art_id)
	material.albedo_color = Color.WHITE
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.emission_enabled = true
	material.emission = glow_color
	material.emission_energy_multiplier = 0.25
	material_cache[key] = material
	return material


func _make_billboard_sprite(art_id: String, base_height: float, glow_color: Color = Color.WHITE) -> MeshInstance3D:
	var texture := _pixel_texture(art_id)
	var sprite := MeshInstance3D.new()
	var quad := QuadMesh.new()
	var aspect := float(texture.get_width()) / float(texture.get_height())
	quad.size = Vector2(base_height * aspect, base_height)
	sprite.mesh = quad
	sprite.position = Vector3(0, base_height * 0.5, 0)
	sprite.material_override = _billboard_material(art_id, glow_color)
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	return sprite


func _arena_surface_material(arena_radius: float) -> Material:
	var key := "arena_surface:%s" % String.num(arena_radius, 2)
	if material_cache.has(key):
		return material_cache[key]
	var shader := Shader.new()
	shader.code = """
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_opaque;

uniform vec4 base_color : source_color = vec4(0.66, 0.76, 0.85, 1.0);
uniform vec4 grid_color : source_color = vec4(0.18, 0.28, 0.39, 1.0);
uniform float arena_radius = 18.0;
uniform float grid_scale = 0.5;
uniform float grid_strength = 0.22;

varying vec3 world_pos;

void vertex() {
	world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	float radial = length(world_pos.xz);
	if (radial > arena_radius) {
		discard;
	}
	float gx = smoothstep(0.95, 1.0, fract((world_pos.x + arena_radius) * grid_scale));
	float gz = smoothstep(0.95, 1.0, fract((world_pos.z + arena_radius) * grid_scale));
	vec3 color = base_color.rgb;
	color -= grid_color.rgb * (gx + gz) * grid_strength;
	float edge = smoothstep(arena_radius - 1.8, arena_radius, radial);
	color = mix(color, vec3(0.25, 0.37, 0.49), edge * 0.45);
	ALBEDO = color;
	ROUGHNESS = 0.88;
	SPECULAR = 0.12;
	EMISSION = color * 0.05;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("arena_radius", arena_radius)
	material_cache[key] = material
	return material


func _outer_field_material(arena_radius: float) -> Material:
	var key := "outer_field:%s" % String.num(arena_radius, 2)
	if material_cache.has(key):
		return material_cache[key]
	var shader := Shader.new()
	shader.code = """
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_opaque;

uniform float arena_radius = 18.0;
varying vec3 world_pos;

void vertex() {
	world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	float radial = length(world_pos.xz);
	float inner = smoothstep(arena_radius + 1.0, arena_radius + 6.0, radial);
	float gx = smoothstep(0.95, 1.0, fract((world_pos.x + arena_radius) * 0.28));
	float gz = smoothstep(0.95, 1.0, fract((world_pos.z + arena_radius) * 0.28));
	vec3 color = mix(vec3(0.18, 0.25, 0.34), vec3(0.07, 0.11, 0.18), inner);
	color += vec3(0.05, 0.08, 0.12) * gx;
	color += vec3(0.05, 0.08, 0.12) * gz;
	ALBEDO = color;
	ROUGHNESS = 0.94;
	SPECULAR = 0.05;
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("arena_radius", arena_radius)
	material_cache[key] = material
	return material


func _flat_material(color: Color) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.08
	mat.roughness = 0.42
	return mat


func _emissive_material(color: Color, energy: float = 1.4, roughness: float = 0.22) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.05
	mat.roughness = roughness
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	return mat


func _shadow_material() -> Material:
	var key := "shadow_disc"
	if material_cache.has(key):
		return material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_color = Color(0, 0, 0, 0.38)
	material_cache[key] = mat
	return mat


func _material_for_zone(zone: String) -> Material:
	match zone:
		"ice":
			return _pbr_material("Ice001", Color("b8ddff"))
		"asphalt":
			return _pbr_material("Asphalt001", Color("405266"))
		_:
			return _pbr_material("Snow001", Color("e3edf6"))


func _decal_material(material_name: String) -> Material:
	var key := "decal:%s" % material_name
	if material_cache.has(key):
		return material_cache[key]
	var material := StandardMaterial3D.new()
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	material.albedo_texture = _load_texture("%s/%s/%s_1K-JPG_Color.jpg" % [DECAL_ROOT, material_name, material_name])
	material.albedo_color = Color(1, 1, 1, 0.82)
	material.roughness = 0.55
	material.emission_enabled = true
	material.emission = Color("ffd56d")
	material.emission_energy_multiplier = 0.3
	material_cache[key] = material
	return material


func _pbr_material(material_name: String, tint: Color) -> Material:
	if material_cache.has(material_name):
		return material_cache[material_name]
	var base_path := "%s/%s" % [MATERIAL_ROOT, material_name]
	var material := StandardMaterial3D.new()
	material.albedo_texture = _load_texture("%s/%s_1K-JPG_Color.jpg" % [base_path, material_name])
	material.normal_enabled = true
	material.normal_texture = _load_texture("%s/%s_1K-JPG_NormalGL.jpg" % [base_path, material_name])
	material.roughness_texture = _load_texture("%s/%s_1K-JPG_Roughness.jpg" % [base_path, material_name])
	material.albedo_color = tint
	material.uv1_scale = Vector3(1.18, 1.18, 1.0)
	material.metallic = 0.04
	if material_name.begins_with("Ice"):
		material.roughness = 0.08
		material.emission_enabled = true
		material.emission = Color("b9efff")
		material.emission_energy_multiplier = 0.22
	elif material_name.begins_with("Snow"):
		material.roughness = 0.92
	else:
		material.roughness = 0.48
	material_cache[material_name] = material
	return material


func _load_texture(path: String) -> Texture2D:
	if texture_cache.has(path):
		return texture_cache[path]
	if not FileAccess.file_exists(path):
		return null
	var image := Image.load_from_file(path)
	if image == null or image.is_empty():
		return null
	var texture := ImageTexture.create_from_image(image)
	texture_cache[path] = texture
	return texture


func _read_json(path: String) -> Variant:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		push_error("Failed to open %s" % path)
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed == null:
		push_error("Failed to parse %s" % path)
		return {}
	return parsed


func _on_class_button_pressed(button: Button) -> void:
	start_run(String(button.get_meta("class_id", "")))


func _on_upgrade_button_pressed(button: Button) -> void:
	_apply_upgrade(String(button.get_meta("upgrade_id", "")))


func _test_wave_scale() -> float:
	return float(test_mode.get("wave_scale", 1.0))


func _test_player_damage_scale() -> float:
	return float(test_mode.get("player_damage_scale", 1.0))


func _test_player_speed_scale() -> float:
	return float(test_mode.get("player_speed_scale", 1.0))


func _test_player_fire_scale() -> float:
	return float(test_mode.get("player_fire_scale", 1.0))


func _test_boss_hp_scale() -> float:
	return float(test_mode.get("boss_hp_scale", 1.0))


func _test_boss_attack_scale() -> float:
	return float(test_mode.get("boss_attack_scale", 1.0))
