extends RefCounted

## Right-side sidebar showing coal buff queue.
## Tap a coal to activate, long-press to sell.

const THEME := preload("res://scripts/holidaypunk_theme.gd")


static func build_sidebar(root: Control, on_activate: Callable) -> Dictionary:
	var sidebar := VBoxContainer.new()
	sidebar.name = "CoalSidebar"
	sidebar.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	sidebar.offset_left = -72
	sidebar.offset_top = 80
	sidebar.offset_right = -12
	sidebar.offset_bottom = -150
	sidebar.alignment = BoxContainer.ALIGNMENT_BEGIN
	sidebar.add_theme_constant_override("separation", 6)
	sidebar.visible = false
	root.add_child(sidebar)
	return {"sidebar": sidebar, "on_activate": on_activate}


static func refresh(state: Dictionary, coal_queue: Array) -> void:
	var sidebar: VBoxContainer = state["sidebar"]
	var on_activate: Callable = state["on_activate"]
	for child in sidebar.get_children():
		child.queue_free()
	sidebar.visible = coal_queue.size() > 0
	for i in range(coal_queue.size()):
		var button := Button.new()
		button.text = "COAL"
		button.custom_minimum_size = Vector2(56, 40)
		button.add_theme_font_size_override("font_size", 11)
		THEME.apply_to_button(button, Color("444444"))
		button.pressed.connect(on_activate.bind(i))
		sidebar.add_child(button)
