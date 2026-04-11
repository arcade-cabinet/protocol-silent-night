extends RefCounted

var ui_mgr: RefCounted
var audio_mgr: RefCounted = null

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
	if audio_mgr != null: audio_mgr.play_level_up()
	xp -= xp_needed
	level += 1
	# Cap prevents XP wall that stops upgrades coming at late levels.
	xp_needed = mini(int(round(xp_needed * 1.45)), 500)
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
	var cls: ClassResource = player_state["class"]
	match upgrade_id:
		"damage":
			# Diminishing returns after 5 stacks — no hard cap, death still wins.
			var damage_stacks: int = int(player_state.get("damage_stacks", 0))
			var mult := 1.25 if damage_stacks < 5 else 1.10
			cls.damage *= mult
			player_state["damage_stacks"] = damage_stacks + 1
		"fire_rate":
			# Diminishing returns after 5 stacks — interval floor approaches but never 0.
			var fr_stacks: int = int(player_state.get("fire_rate_stacks", 0))
			var mult := 0.82 if fr_stacks < 5 else 0.92
			cls.fire_rate *= mult
			player_state["fire_rate_stacks"] = fr_stacks + 1
		"health":
			# Multiplicative so health stays relevant against scaling enemy damage.
			var increase := maxf(25.0, float(player_state["max_hp"]) * 0.25)
			player_state["max_hp"] = float(player_state["max_hp"]) + increase
			player_state["hp"] = minf(player_state["max_hp"], float(player_state["hp"]) + increase)
		"speed":
			cls.speed *= 1.15
		"range":
			cls.range_val *= 1.2
		"aura":
			player_state["aura_level"] = int(player_state["aura_level"]) + 1


func record_kill() -> void:
	kills += 1
	ui_mgr.kills_label.text = str(kills)
