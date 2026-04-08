extends RefCounted

var ui_mgr: RefCounted

var xp: int = 0
var xp_needed: int = 5
var level: int = 1
var kills: int = 0


func _init(ui_manager: RefCounted = null) -> void:
	ui_mgr = ui_manager


func reset(starting_xp_needed: int = 5) -> void:
	xp = 0
	xp_needed = starting_xp_needed
	level = 1
	kills = 0


func gain_xp(amount: int, on_level_up: Callable, on_update_ui: Callable) -> void:
	xp += amount
	if xp >= xp_needed:
		on_level_up.call()
	else:
		on_update_ui.call()


func trigger_level_up(state_setter: Callable, upgrade_defs: Array, test_mode: Dictionary, on_apply_upgrade: Callable, on_upgrade_button_pressed: Callable) -> void:
	state_setter.call("level_up")
	xp -= xp_needed
	level += 1
	xp_needed = int(round(xp_needed * 1.45))
	ui_mgr.xp_bar.max_value = xp_needed
	ui_mgr.level_label.text = "LEVEL %d" % level
	ui_mgr.level_screen.visible = true
	ui_mgr.show_message("FESTIVE UPGRADE", 1.4, Color("7aff8a"))
	for child in ui_mgr.upgrade_box.get_children():
		child.queue_free()
	var choices := upgrade_defs.duplicate(true)
	choices.shuffle()
	choices = choices.slice(0, 3)
	for choice in choices:
		var button := Button.new()
		button.text = "%s\n%s" % [choice["name"], choice["description"]]
		button.custom_minimum_size = Vector2(220, 160)
		button.set_meta("upgrade_id", choice["id"])
		button.pressed.connect(on_upgrade_button_pressed.bind(button))
		ui_mgr.upgrade_box.add_child(button)
	if bool(test_mode.get("auto_choose_upgrade", false)) and choices.size() > 0:
		on_apply_upgrade.call(choices[0]["id"])


func apply_upgrade(upgrade_id: String, player_state: Dictionary) -> void:
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


func record_kill() -> void:
	kills += 1
	ui_mgr.kills_label.text = str(kills)
