extends RefCounted

const MOBILE_BREAKPOINT := 920.0


static func for_viewport(viewport_size: Vector2, safe_area_override: Rect2 = Rect2()) -> Dictionary:
	var viewport_rect := Rect2(Vector2.ZERO, viewport_size)
	var safe_rect := _resolve_safe_rect(viewport_rect, safe_area_override)
	var shortest := minf(viewport_size.x, viewport_size.y)
	var portrait := viewport_size.y > viewport_size.x * 1.02
	var mobile := OS.has_feature("mobile") or portrait or shortest <= MOBILE_BREAKPOINT
	var edge_pad := clampf(shortest * 0.04, 16.0, 36.0)
	var section_gap := clampf(shortest * 0.03, 12.0, 28.0)
	var action_inset := clampf(shortest * 0.045, 18.0, 32.0)
	return {
		"size": viewport_size,
		"safe_rect": safe_rect,
		"safe_left": safe_rect.position.x,
		"safe_top": safe_rect.position.y,
		"safe_right": viewport_size.x - safe_rect.end.x,
		"safe_bottom": viewport_size.y - safe_rect.end.y,
		"is_mobile": mobile,
		"is_portrait": portrait,
		"edge_pad": edge_pad,
		"section_gap": section_gap,
		"action_inset": action_inset,
		"dash_button_size": clampf(shortest * 0.24, 96.0, 140.0),
		"pause_button_size": clampf(shortest * 0.12, 48.0, 64.0),
		"joystick_base_size": clampf(shortest * 0.24, 92.0, 132.0),
		"joystick_knob_size": clampf(shortest * 0.11, 42.0, 58.0),
		"joystick_drag_radius": clampf(shortest * 0.18, 72.0, 104.0),
		"joystick_visual_radius": clampf(shortest * 0.13, 52.0, 76.0),
	}


static func dash_rect(viewport_size: Vector2, safe_area_override: Rect2 = Rect2()) -> Rect2:
	var profile := for_viewport(viewport_size, safe_area_override)
	var size := float(profile["dash_button_size"])
	var inset := float(profile["action_inset"])
	var safe_rect: Rect2 = profile["safe_rect"]
	return Rect2(
		Vector2(safe_rect.end.x - inset - size, safe_rect.end.y - inset - size),
		Vector2.ONE * size
	)


static func center_panel_size(viewport_size: Vector2, desired: Vector2, min_size: Vector2 = Vector2(280.0, 280.0), safe_area_override: Rect2 = Rect2()) -> Vector2:
	var profile := for_viewport(viewport_size, safe_area_override)
	var safe_rect: Rect2 = profile["safe_rect"]
	var edge_pad := float(profile["edge_pad"])
	var max_size := Vector2(
		maxf(min_size.x, safe_rect.size.x - edge_pad * 2.0),
		maxf(min_size.y, safe_rect.size.y - edge_pad * 2.0)
	)
	return Vector2(
		clampf(desired.x, min_size.x, max_size.x),
		clampf(desired.y, min_size.y, max_size.y)
	)


static func _resolve_safe_rect(viewport_rect: Rect2, safe_area_override: Rect2 = Rect2()) -> Rect2:
	var safe_area: Rect2 = safe_area_override if safe_area_override.size != Vector2.ZERO else Rect2(DisplayServer.get_display_safe_area())
	if safe_area.size.x <= 0.0 or safe_area.size.y <= 0.0:
		return viewport_rect
	safe_area = safe_area.intersection(viewport_rect)
	if safe_area.size.x < viewport_rect.size.x * 0.5 or safe_area.size.y < viewport_rect.size.y * 0.5:
		return viewport_rect
	return safe_area
