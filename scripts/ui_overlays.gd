extends RefCounted

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const VIEWPORT_PROFILE := preload("res://scripts/viewport_profile.gd")


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var edge_pad := float(layout["edge_pad"])
	var end_screen := PanelContainer.new()
	end_screen.name = "EndScreen"
	end_screen.visible = false
	end_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	end_screen.self_modulate = Color(0.02, 0.04, 0.06, 0.94)
	root.add_child(end_screen)

	var end_margin := MarginContainer.new()
	end_margin.add_theme_constant_override("margin_left", int(round(float(layout["safe_left"]) + edge_pad)))
	end_margin.add_theme_constant_override("margin_top", int(round(float(layout["safe_top"]) + edge_pad)))
	end_margin.add_theme_constant_override("margin_right", int(round(float(layout["safe_right"]) + edge_pad)))
	end_margin.add_theme_constant_override("margin_bottom", int(round(float(layout["safe_bottom"]) + edge_pad)))
	end_screen.add_child(end_margin)

	var scroll := ScrollContainer.new()
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	end_margin.add_child(scroll)

	var end_vbox := VBoxContainer.new()
	end_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	end_vbox.add_theme_constant_override("separation", 16)
	scroll.add_child(end_vbox)

	var end_title := Label.new()
	end_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	end_title.add_theme_font_size_override("font_size", 32 if is_mobile else 42)
	end_vbox.add_child(end_title)

	var end_message := Label.new()
	end_message.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_message.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	end_message.add_theme_font_size_override("font_size", 18 if is_mobile else 20)
	end_vbox.add_child(end_message)

	var end_waves := Label.new()
	end_waves.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	end_waves.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	end_waves.add_theme_font_size_override("font_size", 16 if is_mobile else 18)
	end_vbox.add_child(end_waves)

	var restart := Button.new()
	restart.text = "Main Menu"
	restart.custom_minimum_size = Vector2(220, 56) if is_mobile else Vector2(180, 48)
	restart.pressed.connect(on_menu_return)
	end_vbox.add_child(restart)
	return {"end_screen": end_screen, "end_title": end_title, "end_message": end_message, "end_waves": end_waves}


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	var layout := VIEWPORT_PROFILE.for_viewport(root.get_viewport_rect().size)
	var is_mobile := bool(layout["is_mobile"])
	var message_overlay := Label.new()
	message_overlay.name = "MessageOverlay"
	message_overlay.set_anchors_preset(Control.PRESET_TOP_WIDE)
	message_overlay.offset_top = float(layout["safe_top"]) + (96.0 if is_mobile else 160.0)
	message_overlay.offset_bottom = message_overlay.offset_top + 84.0
	message_overlay.offset_left = float(layout["safe_left"]) + float(layout["edge_pad"])
	message_overlay.offset_right = -(float(layout["safe_right"]) + float(layout["edge_pad"]))
	message_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	message_overlay.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	message_overlay.add_theme_font_size_override("font_size", 24 if is_mobile else 32)
	message_overlay.modulate = Color("edf7ff")
	root.add_child(message_overlay)

	var achievement_overlay := Label.new()
	achievement_overlay.name = "AchievementOverlay"
	achievement_overlay.set_anchors_preset(Control.PRESET_TOP_WIDE)
	achievement_overlay.offset_top = float(layout["safe_top"]) + 20.0
	achievement_overlay.offset_bottom = achievement_overlay.offset_top + 54.0
	achievement_overlay.offset_left = float(layout["safe_left"]) + float(layout["edge_pad"])
	achievement_overlay.offset_right = -(float(layout["safe_right"]) + float(layout["edge_pad"]))
	achievement_overlay.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	achievement_overlay.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	achievement_overlay.add_theme_font_size_override("font_size", 18 if is_mobile else 20)
	achievement_overlay.modulate = Color("ffe680")
	root.add_child(achievement_overlay)

	var dash_rect := VIEWPORT_PROFILE.dash_rect(root.get_viewport_rect().size)
	var dash_button := Button.new()
	dash_button.name = "DashButton"
	dash_button.text = "DASH"
	dash_button.visible = false
	dash_button.custom_minimum_size = dash_rect.size
	dash_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	dash_button.offset_left = -(root.get_viewport_rect().size.x - dash_rect.position.x)
	dash_button.offset_top = -(root.get_viewport_rect().size.y - dash_rect.position.y)
	dash_button.offset_right = dash_button.offset_left + dash_rect.size.x
	dash_button.offset_bottom = dash_button.offset_top + dash_rect.size.y
	dash_button.button_down.connect(on_dash_down)
	dash_button.button_up.connect(on_dash_up)
	root.add_child(dash_button)

	var joystick_base := ColorRect.new()
	joystick_base.name = "JoystickBase"
	joystick_base.visible = false
	joystick_base.color = Color(1, 1, 1, 0.15)
	joystick_base.custom_minimum_size = Vector2.ONE * float(layout["joystick_base_size"])
	root.add_child(joystick_base)

	var joystick_knob := ColorRect.new()
	joystick_knob.name = "JoystickKnob"
	joystick_knob.visible = false
	joystick_knob.color = Color(0.92, 0.97, 1.0, 0.9)
	joystick_knob.custom_minimum_size = Vector2.ONE * float(layout["joystick_knob_size"])
	root.add_child(joystick_knob)

	var pause_button := Button.new()
	pause_button.name = "PauseButton"
	pause_button.text = "II"
	pause_button.visible = false
	pause_button.custom_minimum_size = Vector2.ONE * float(layout["pause_button_size"])
	pause_button.set_anchors_preset(Control.PRESET_TOP_LEFT)
	pause_button.offset_left = float(layout["safe_left"]) + float(layout["action_inset"])
	pause_button.offset_top = float(layout["safe_top"]) + float(layout["action_inset"])
	pause_button.offset_right = pause_button.offset_left + float(layout["pause_button_size"])
	pause_button.offset_bottom = pause_button.offset_top + float(layout["pause_button_size"])
	root.add_child(pause_button)
	return {
		"message_overlay": message_overlay,
		"achievement_overlay": achievement_overlay,
		"dash_button": dash_button,
		"joystick_base": joystick_base,
		"joystick_knob": joystick_knob,
		"pause_button": pause_button,
	}
