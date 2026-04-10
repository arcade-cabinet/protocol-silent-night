extends RefCounted


static func build_level_screen(root: Control) -> Dictionary:
	var level_screen := PanelContainer.new()
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

	var upgrade_box := HBoxContainer.new()
	upgrade_box.name = "UpgradeCards"
	upgrade_box.alignment = BoxContainer.ALIGNMENT_CENTER
	upgrade_box.add_theme_constant_override("separation", 18)
	level_vbox.add_child(upgrade_box)

	return {"level_screen": level_screen, "upgrade_box": upgrade_box}


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	var end_screen := PanelContainer.new()
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

	var end_title := Label.new()
	end_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_title.add_theme_font_size_override("font_size", 42)
	end_vbox.add_child(end_title)

	var end_message := Label.new()
	end_message.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_message.add_theme_font_size_override("font_size", 20)
	end_vbox.add_child(end_message)

	var end_waves := Label.new()
	end_waves.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_waves.add_theme_font_size_override("font_size", 18)
	end_vbox.add_child(end_waves)

	var restart := Button.new()
	restart.text = "Main Menu"
	restart.pressed.connect(on_menu_return)
	end_vbox.add_child(restart)

	return {"end_screen": end_screen, "end_title": end_title, "end_message": end_message, "end_waves": end_waves}


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	var message_overlay := Label.new()
	message_overlay.name = "MessageOverlay"
	message_overlay.set_anchors_preset(Control.PRESET_CENTER_TOP)
	message_overlay.offset_top = 160
	message_overlay.offset_left = -260
	message_overlay.offset_right = 260
	message_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_overlay.add_theme_font_size_override("font_size", 32)
	message_overlay.modulate = Color("edf7ff")
	root.add_child(message_overlay)

	var achievement_overlay := Label.new()
	achievement_overlay.name = "AchievementOverlay"
	achievement_overlay.set_anchors_preset(Control.PRESET_CENTER_TOP)
	achievement_overlay.offset_top = 56
	achievement_overlay.offset_left = -340
	achievement_overlay.offset_right = 340
	achievement_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	achievement_overlay.add_theme_font_size_override("font_size", 20)
	achievement_overlay.modulate = Color("ffe680")
	root.add_child(achievement_overlay)

	var dash_button := Button.new()
	dash_button.name = "DashButton"
	dash_button.text = "DASH"
	dash_button.visible = false
	dash_button.custom_minimum_size = Vector2(108, 108)
	dash_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	dash_button.offset_left = -140
	dash_button.offset_top = -140
	dash_button.offset_right = -22
	dash_button.offset_bottom = -22
	dash_button.button_down.connect(on_dash_down)
	dash_button.button_up.connect(on_dash_up)
	root.add_child(dash_button)

	var joystick_base := ColorRect.new()
	joystick_base.name = "JoystickBase"
	joystick_base.visible = false
	joystick_base.color = Color(1, 1, 1, 0.15)
	joystick_base.custom_minimum_size = Vector2(92, 92)
	root.add_child(joystick_base)

	var joystick_knob := ColorRect.new()
	joystick_knob.name = "JoystickKnob"
	joystick_knob.visible = false
	joystick_knob.color = Color(0.92, 0.97, 1.0, 0.9)
	joystick_knob.custom_minimum_size = Vector2(42, 42)
	root.add_child(joystick_knob)

	var pause_button := Button.new()
	pause_button.name = "PauseButton"
	pause_button.text = "II"
	pause_button.visible = false
	pause_button.custom_minimum_size = Vector2(48, 48)
	pause_button.set_anchors_preset(Control.PRESET_TOP_LEFT)
	pause_button.offset_left = 12
	pause_button.offset_top = 12
	pause_button.offset_right = 60
	pause_button.offset_bottom = 60
	root.add_child(pause_button)

	return {
		"message_overlay": message_overlay,
		"achievement_overlay": achievement_overlay,
		"dash_button": dash_button,
		"joystick_base": joystick_base,
		"joystick_knob": joystick_knob,
		"pause_button": pause_button,
	}
