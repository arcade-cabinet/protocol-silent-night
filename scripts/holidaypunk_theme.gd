extends RefCounted
class_name HolidaypunkTheme

## Procedural holidaypunk theme generator.
## Creates StyleBoxFlat instances with neon borders, dark backgrounds,
## and holiday color accents. Applied to HUD panels, buttons, and bars.

const BG_DARK := Color(0.04, 0.03, 0.05, 0.9)
const BG_PANEL := Color(0.09, 0.07, 0.09, 0.94)
const NEON_CYAN := Color("69d6ff")
const NEON_RED := Color("ff314d")
const NEON_GOLD := Color("e8c14d")
const NEON_GREEN := Color("59d67d")
const NEON_WHITE := Color("f0f8ff")


static func make_panel_style(accent: Color = NEON_CYAN, bg: Color = BG_PANEL) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = bg
	style.border_color = accent
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 2
	style.corner_radius_top_right = 2
	style.corner_radius_bottom_left = 2
	style.corner_radius_bottom_right = 2
	style.shadow_color = Color(accent.r, accent.g, accent.b, 0.35)
	style.shadow_size = 6
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 8
	style.content_margin_bottom = 8
	return style


static func make_button_style(accent: Color = NEON_CYAN,
		bg: Color = Color(0.12, 0.08, 0.09, 0.94)) -> StyleBoxFlat:
	var style := make_panel_style(accent, bg)
	style.content_margin_left = 16
	style.content_margin_right = 16
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	return style


static func make_hover_style(accent: Color = NEON_CYAN) -> StyleBoxFlat:
	var style := make_button_style(accent, Color(0.16, 0.08, 0.09, 0.97))
	style.shadow_size = 10
	style.border_width_left = 3
	style.border_width_right = 3
	style.border_width_top = 3
	style.border_width_bottom = 3
	return style


static func make_disabled_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.07, 0.08, 0.56)
	style.border_color = Color(0.3, 0.32, 0.36, 0.6)
	style.border_width_left = 1
	style.border_width_right = 1
	style.border_width_top = 1
	style.border_width_bottom = 1
	style.content_margin_left = 16
	style.content_margin_right = 16
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	return style


static func make_bar_style(accent: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = accent
	style.shadow_color = Color(accent.r, accent.g, accent.b, 0.5)
	style.shadow_size = 4
	return style


static func make_bar_bg_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.08, 0.07, 0.08, 0.94)
	style.border_color = Color(0.3, 0.22, 0.2, 0.85)
	style.border_width_left = 1
	style.border_width_right = 1
	style.border_width_top = 1
	style.border_width_bottom = 1
	return style


static func apply_to_button(button: Button, accent: Color = NEON_CYAN) -> void:
	button.add_theme_stylebox_override("normal", make_button_style(accent))
	button.add_theme_stylebox_override("hover", make_hover_style(accent))
	button.add_theme_stylebox_override("pressed", make_panel_style(accent, Color(0.1, 0.2, 0.3, 0.95)))
	button.add_theme_stylebox_override("disabled", make_disabled_style())
	button.add_theme_stylebox_override("focus", make_hover_style(accent))
	button.add_theme_color_override("font_color", NEON_WHITE)
	button.add_theme_color_override("font_hover_color", accent)
	button.add_theme_color_override("font_pressed_color", accent)
	button.add_theme_color_override("font_disabled_color", Color(0.4, 0.45, 0.5, 0.7))


static func apply_to_panel(panel: PanelContainer, accent: Color = NEON_CYAN) -> void:
	panel.add_theme_stylebox_override("panel", make_panel_style(accent))


static func apply_to_progress_bar(bar: ProgressBar, accent: Color) -> void:
	bar.add_theme_stylebox_override("background", make_bar_bg_style())
	bar.add_theme_stylebox_override("fill", make_bar_style(accent))
