extends RefCounted

const UI_BUILDER := preload("res://scripts/ui_builder.gd")
const DIFFICULTY_SELECT := preload("res://scripts/difficulty_select.gd")
const COAL_SIDEBAR := preload("res://scripts/coal_sidebar_ui.gd")
const UI_WIDGETS := preload("res://scripts/ui_widgets.gd")
const PRESENT_SELECT := preload("res://scripts/present_select_ui.gd")

var hud_root: Container
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
var cookie_label: Label
var end_title: Label
var end_message: Label
var end_waves: Label
var dash_button: Button
var pause_button: Button
var joystick_base: ColorRect
var joystick_knob: ColorRect
var start_classes_box: Container
var radar_canvas: Control
var upgrade_box: HBoxContainer
var difficulty_panel: PanelContainer
var coal_sidebar_state: Dictionary = {}
var _last_coal_signature: String = ""
var widgets: Dictionary = {}
var audio_mgr: RefCounted
var _hp_pulse_time: float = 0.0
var _banner_target: String = ""
var _banner_char_idx: int = 0
var _banner_timer: float = 0.0

var message_timer: float = 0.0
var achievement_timer: float = 0.0
var root_control: Control


func build_ui(parent: Node, on_menu_return: Callable, on_dash_down: Callable, on_dash_up: Callable, on_difficulty_selected: Callable = Callable(), on_coal_activate: Callable = Callable()) -> CanvasLayer:
	var ui := CanvasLayer.new()
	ui.name = "UI"
	parent.add_child(ui)
	var root := Control.new()
	root.name = "Root"
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ui.add_child(root)
	root_control = root

	var start := UI_BUILDER.build_start_screen(root)
	start_screen = start["screen"]
	start_classes_box = start["classes_box"]
	radar_canvas = start["radar_canvas"]

	var hud := UI_BUILDER.build_hud(root)
	hud_root = hud["hud_root"]
	level_label = hud["level_label"]
	xp_bar = hud["xp_bar"]
	hp_bar = hud["hp_bar"]
	hp_label = hud["hp_label"]
	wave_label = hud["wave_label"]
	timer_label = hud["timer_label"]
	kills_label = hud["kills_label"]
	cookie_label = hud["cookie_label"]

	var boss := UI_BUILDER.build_boss_panel(root)
	boss_panel = boss["boss_panel"]
	boss_bar = boss["boss_bar"]

	var lvl := UI_BUILDER.build_level_screen(root)
	level_screen = lvl["level_screen"]
	upgrade_box = lvl["upgrade_box"]

	var end := UI_BUILDER.build_end_screen(root, on_menu_return)
	end_screen = end["end_screen"]
	end_title = end["end_title"]
	end_message = end["end_message"]
	end_waves = end["end_waves"]

	var overlays := UI_BUILDER.build_overlays_and_controls(root, on_dash_down, on_dash_up)
	message_overlay = overlays["message_overlay"]
	achievement_overlay = overlays["achievement_overlay"]
	dash_button = overlays["dash_button"]
	joystick_base = overlays["joystick_base"]
	joystick_knob = overlays["joystick_knob"]
	pause_button = overlays["pause_button"]
	if pause_button != null:
		pause_button.pressed.connect(func() -> void: toggle_pause(parent.get_tree()))

	if on_difficulty_selected.is_valid():
		var diff := DIFFICULTY_SELECT.build(root, on_difficulty_selected)
		difficulty_panel = diff["panel"]

	if on_coal_activate.is_valid():
		coal_sidebar_state = COAL_SIDEBAR.build_sidebar(root, on_coal_activate)

	widgets = UI_WIDGETS.build_all(root)
	PRESENT_SELECT.init_preview(root)

	return ui


func refresh_widgets(main: Node) -> void: UI_WIDGETS.refresh(widgets, main)
func register_combo_kill() -> void: UI_WIDGETS.register_kill(widgets)
func ensure_menus(p_audio_mgr: RefCounted, sm: Node, on_restart: Callable, on_quit: Callable) -> void:
	audio_mgr = p_audio_mgr
	UI_WIDGETS.ensure_menus(widgets, root_control, p_audio_mgr, sm, on_restart, on_quit)
func open_settings() -> void: UI_WIDGETS.open_settings(widgets)
func toggle_pause(tree: SceneTree) -> void: UI_WIDGETS.toggle_pause(widgets, tree)


func refresh_coal_sidebar(coal_queue: Array) -> void:
	if coal_sidebar_state.is_empty():
		return
	var signature: String = ",".join(coal_queue.map(func(e): return str(e)))
	if signature == _last_coal_signature:
		return
	_last_coal_signature = signature
	COAL_SIDEBAR.refresh(coal_sidebar_state, coal_queue)


func refresh_start_screen(save_manager: Node, on_class_pressed: Callable, present_defs: Dictionary = {}) -> void:
	for child in start_classes_box.get_children():
		child.queue_free()
	if not present_defs.is_empty():
		_build_present_buttons(present_defs, save_manager, on_class_pressed)


func _build_present_buttons(present_defs: Dictionary, save_manager: Node, on_class_pressed: Callable) -> void:
	PRESENT_SELECT.build_present_buttons(start_classes_box, present_defs, save_manager, on_class_pressed, radar_canvas, audio_mgr)


func show_message(text: String, duration: float, color: Color = Color.WHITE) -> void:
	_banner_target = text
	_banner_char_idx = 0
	_banner_timer = 0.0
	message_overlay.text = ""
	message_overlay.modulate = color
	message_timer = duration


func show_achievement(text: String, duration: float = 3.0) -> void:
	achievement_overlay.text = text
	achievement_timer = duration


func update_transient_overlays(delta: float) -> void:
	UI_WIDGETS.tick_overlays(self, delta)


func show_joystick(base_pos: Vector2, knob_pos: Vector2) -> void:
	joystick_base.visible = true
	joystick_knob.visible = true
	joystick_base.position = base_pos - joystick_base.custom_minimum_size * 0.5
	joystick_knob.position = knob_pos - joystick_knob.custom_minimum_size * 0.5


func hide_joystick() -> void:
	joystick_base.visible = false
	joystick_knob.visible = false


func update_hud(player_state: Dictionary, xp_needed: int, xp: int, level: int, kills: int, cookies: int = 0, coal_queue: Array = []) -> void:
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
	if cookie_label != null:
		cookie_label.text = "%d C" % cookies
	refresh_coal_sidebar(coal_queue)
