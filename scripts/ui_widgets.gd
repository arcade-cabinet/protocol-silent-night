extends RefCounted

## Static helper for wiring Phase 5 HUD widgets into the live
## ui_manager. Owns build + per-tick refresh so ui_manager stays
## under the 200 LOC hook budget.

const MINIMAP := preload("res://scripts/minimap_widget.gd")
const THREAT := preload("res://scripts/threat_indicator.gd")
const TARGET_HINT := preload("res://scripts/target_hint_widget.gd")
const SETTINGS := preload("res://scripts/settings_menu.gd")
const SETTINGS_RUNTIME := preload("res://scripts/settings_menu_runtime.gd")
const PAUSE := preload("res://scripts/pause_menu.gd")
const COMBO := preload("res://scripts/combo_counter.gd")
const COMBAT_HELPERS := preload("res://scripts/combat_helpers.gd")


static func build_all(root: Control) -> Dictionary:
	var state: Dictionary = {}
	state["minimap"] = MINIMAP.build(root)
	state["threat"] = THREAT.build(root)
	state["target_hint"] = TARGET_HINT.build(root)
	state["combo_counter"] = COMBO.new()
	state["combo_label"] = _build_combo_label(root)
	state["vignette"] = _build_vignette(root)
	return state


static func _build_combo_label(root: Control) -> Label:
	var lbl := Label.new()
	lbl.name = "ComboLabel"
	lbl.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	lbl.offset_left = -220
	lbl.offset_top = 56
	lbl.offset_right = -20
	lbl.offset_bottom = 100
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	lbl.add_theme_font_size_override("font_size", 24)
	lbl.add_theme_color_override("font_color", Color.WHITE)
	lbl.visible = false
	root.add_child(lbl)
	return lbl


static func _build_vignette(root: Control) -> ColorRect:
	var rect := ColorRect.new()
	rect.name = "Vignette"
	rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rect.color = Color(0.6, 0.0, 0.05, 0.0)
	rect.z_index = 100
	root.add_child(rect)
	return rect


static func refresh(state: Dictionary, main: Node) -> void:
	if state.is_empty() or main == null:
		return
	_refresh_minimap(state, main)
	_refresh_threat(state, main)
	_refresh_target_hint(state, main)
	_refresh_combo(state, main)
	_refresh_vignette(state, main)


static func _refresh_minimap(state: Dictionary, main: Node) -> void:
	if main.player_node == null:
		return
	var ppos3: Vector3 = main.player_node.position
	MINIMAP.refresh(state["minimap"], Vector2(ppos3.x, ppos3.z), main.enemies, main.pickups, main.boss_ref if not main.boss_ref.is_empty() else null)


static func _refresh_threat(state: Dictionary, main: Node) -> void:
	if main.boss_ref.is_empty() or main.player_node == null:
		THREAT.update(state["threat"], null, null, "red")
		return
	var boss_node: Node3D = main.boss_ref.get("node")
	if boss_node == null or not is_instance_valid(boss_node):
		THREAT.update(state["threat"], null, null, "red")
		return
	var tier: String = "gold" if float(main.boss_ref.get("hp", 1.0)) < float(main.boss_ref.get("max_hp", 1.0)) * 0.3 else "red"
	THREAT.update(state["threat"], boss_node.position, main.player_node.position, tier)


static func _refresh_target_hint(state: Dictionary, main: Node) -> void:
	var target: Dictionary = COMBAT_HELPERS.closest_target(main) if main.player_node != null else {}
	var player_class = main.player_state.get("class") if main.player_state is Dictionary else null
	TARGET_HINT.update(state["target_hint"], main.camera, main.player_node, target, player_class)


static func _refresh_combo(state: Dictionary, main: Node) -> void:
	var counter: RefCounted = state["combo_counter"]
	counter.tick(main.get_process_delta_time() if main.has_method("get_process_delta_time") else 0.016)
	var s: Dictionary = counter.get_state()
	var label: Label = state["combo_label"]
	if int(s["count"]) < 3:
		label.visible = false
	else:
		label.visible = true
		label.text = "KILLS x%d" % int(s["count"])
		label.add_theme_color_override("font_color", COMBO.tier_color(int(s["tier"])))


static func _refresh_vignette(state: Dictionary, main: Node) -> void:
	var rect: ColorRect = state["vignette"]
	if main.player_state.is_empty():
		rect.color.a = 0.0
		return
	var hp_pct: float = float(main.player_state.get("hp", 100.0)) / maxf(1.0, float(main.player_state.get("max_hp", 100.0)))
	var alpha: float = clampf((0.4 - hp_pct) * 1.2, 0.0, 0.45)
	rect.color.a = alpha


static func register_kill(state: Dictionary) -> void:
	if state.is_empty():
		return
	(state["combo_counter"] as RefCounted).register_kill()


static func open_settings(state: Dictionary) -> void:
	if state.has("settings"):
		SETTINGS.show(state["settings"])


static func ensure_menus(state: Dictionary, root: Control, audio_mgr: RefCounted, sm: Node, on_restart: Callable, on_quit: Callable) -> void:
	if not state.has("settings"):
		state["settings"] = SETTINGS.build(root, audio_mgr, sm, Callable())
	if not state.has("pause"):
		var resume := func() -> void:
			PAUSE.hide(state["pause"])
			if root != null and root.get_tree() != null:
				root.get_tree().paused = false
		var open_set := func() -> void: SETTINGS.show(state.get("settings", {}))
		state["pause"] = PAUSE.build(root, resume, on_restart, open_set, on_quit)


static func toggle_pause(state: Dictionary, tree: SceneTree) -> void:
	if not state.has("pause"):
		return
	var panel: PanelContainer = state["pause"]["panel"]
	if panel.visible:
		PAUSE.hide(state["pause"])
		if tree != null: tree.paused = false
	else:
		PAUSE.show(state["pause"])
		if tree != null: tree.paused = true


static func tick_overlays(mgr: Object, delta: float) -> void:
	if mgr.hp_bar != null:
		var hp_pct: float = mgr.hp_bar.value / maxf(1.0, mgr.hp_bar.max_value)
		if hp_pct < 0.3:
			mgr._hp_pulse_time += delta
			var pulse: float = 0.85 + (sin(mgr._hp_pulse_time * 6.0) + 1.0) * 0.15
			mgr.hp_bar.modulate = Color(1.0, pulse * 0.5, pulse * 0.5, 1.0)
		else:
			mgr.hp_bar.modulate = Color.WHITE
			mgr._hp_pulse_time = 0.0
	if mgr.message_timer > 0.0:
		mgr.message_timer -= delta
		mgr.message_overlay.visible = true
		mgr.message_overlay.modulate.a = clampf(mgr.message_timer / 0.3 if mgr.message_timer < 0.3 else 1.0, 0.0, 1.0)
		if mgr._banner_char_idx < mgr._banner_target.length():
			mgr._banner_timer += delta
			while mgr._banner_timer >= 0.05 and mgr._banner_char_idx < mgr._banner_target.length():
				mgr._banner_timer -= 0.05
				mgr._banner_char_idx += 1
			mgr.message_overlay.text = mgr._banner_target.substr(0, mgr._banner_char_idx)
	else:
		mgr.message_overlay.visible = false
	if mgr.achievement_timer > 0.0:
		mgr.achievement_timer -= delta
		mgr.achievement_overlay.visible = true
		mgr.achievement_overlay.modulate.a = clampf(mgr.achievement_timer / 0.3 if mgr.achievement_timer < 0.3 else 1.0, 0.0, 1.0)
	else:
		mgr.achievement_overlay.visible = false
	if mgr.widgets.has("settings"):
		SETTINGS_RUNTIME.tick(mgr.widgets["settings"], mgr.root_control, mgr.root_control.get_node_or_null("/root/SaveManager"), Callable(SETTINGS, "_quality_note_text"))


static func update_hud(ui: RefCounted, player_state: Dictionary, xp_needed: int, xp: int, level: int, kills: int, cookies: int = 0, coal_queue: Array = []) -> void:
	if ui.hp_bar != null:
		ui.hp_bar.max_value = player_state.get("max_hp", 100.0)
		ui.hp_bar.value = player_state.get("hp", 100.0)
	if ui.hp_label != null:
		ui.hp_label.text = "%d / %d" % [int(round(player_state.get("hp", 100.0))), int(round(player_state.get("max_hp", 100.0)))]
	if ui.xp_bar != null:
		ui.xp_bar.max_value = xp_needed
		ui.xp_bar.value = xp
	if ui.level_label != null:
		ui.level_label.text = "LEVEL %d" % level
	if ui.kills_label != null:
		ui.kills_label.text = str(kills)
	if ui.cookie_label != null:
		ui.cookie_label.text = "%d C" % cookies
