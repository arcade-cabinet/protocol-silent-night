extends RefCounted

## Right-side sidebar showing coal buff queue.
## Tap a coal to activate, long-press to sell.

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const COAL_EFFECTS := preload("res://scripts/coal_effects.gd")


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
		var entry: Variant = coal_queue[i]
		var rarity: String = "common"
		if entry is Dictionary:
			rarity = String(entry.get("rarity", "common"))
		var button := Button.new()
		button.text = "COAL" if rarity == "common" else rarity.to_upper()[0] + "OAL"
		button.custom_minimum_size = Vector2(56, 40)
		button.add_theme_font_size_override("font_size", 11)
		var rarity_c: Color = COAL_EFFECTS.rarity_color(rarity)
		THEME.apply_to_button(button, rarity_c)
		button.modulate = Color(1.0, 1.0, 1.0, 1.0)
		button.pressed.connect(on_activate.bind(i))
		sidebar.add_child(button)
		_start_idle_pulse(button, rarity_c)


static func _start_idle_pulse(button: Button, tint: Color) -> void:
	var tree: SceneTree = button.get_tree() if button.is_inside_tree() else null
	if tree == null:
		return
	var tween := button.create_tween()
	tween.set_loops()
	tween.tween_property(button, "modulate", Color(1.15, 1.15, 1.15, 1.0), 0.55)
	tween.tween_property(button, "modulate", Color(0.85, 0.85, 0.85, 1.0), 0.55)


static func animate_consume(button: Button, on_done: Callable = Callable()) -> void:
	if button == null or not is_instance_valid(button):
		if on_done.is_valid():
			on_done.call()
		return
	button.disabled = true
	var tween := button.create_tween().set_parallel(true)
	tween.tween_property(button, "scale", Vector2(1.4, 1.4), 0.12)
	tween.tween_property(button, "modulate", Color(2.0, 2.0, 2.0, 1.0), 0.12)
	var collapse := button.create_tween().set_parallel(true)
	collapse.tween_interval(0.12)
	collapse.tween_property(button, "scale", Vector2.ZERO, 0.22)
	collapse.tween_property(button, "modulate:a", 0.0, 0.22)
	collapse.chain().tween_callback(func() -> void:
		if is_instance_valid(button):
			button.queue_free()
		if on_done.is_valid():
			on_done.call()
	)
