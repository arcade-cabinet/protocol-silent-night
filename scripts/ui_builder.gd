extends RefCounted

const UI_SCREENS := preload("res://scripts/ui_screens.gd")
const UI_OVERLAYS := preload("res://scripts/ui_overlays.gd")
const THEME := preload("res://scripts/holidaypunk_theme.gd")


const RADAR_CHART := preload("res://scripts/stat_radar_chart.gd")


static func build_hud(root: Control) -> Dictionary:
	return UI_SCREENS.build_hud(root)


static func build_boss_panel(root: Control) -> Dictionary:
	return UI_SCREENS.build_boss_panel(root)


static func build_level_screen(root: Control) -> Dictionary:
	return UI_SCREENS.build_level_screen(root)


static func build_end_screen(root: Control, on_menu_return: Callable) -> Dictionary:
	return UI_OVERLAYS.build_end_screen(root, on_menu_return)


static func build_overlays_and_controls(root: Control, on_dash_down: Callable, on_dash_up: Callable) -> Dictionary:
	return UI_OVERLAYS.build_overlays_and_controls(root, on_dash_down, on_dash_up)


