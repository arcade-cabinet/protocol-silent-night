extends RefCounted
class_name DifficultySelect

## Builds the difficulty selection screen with present box visuals.
## 3x2 grid: Priceless/Great/Good on top, Naughty/Nice/Unforgivable below.
## Permadeath toggle between rows.

const THEME := preload("res://scripts/holidaypunk_theme.gd")

const TIERS := [
	{"name": "Priceless", "mult": 1, "rewraps": 5, "color": "#55f7ff", "desc": "Gentle introduction"},
	{"name": "Great", "mult": 2, "rewraps": 4, "color": "#55ff88", "desc": "A proper challenge"},
	{"name": "Good", "mult": 3, "rewraps": 3, "color": "#ffd700", "desc": "This will hurt"},
	{"name": "Naughty", "mult": 4, "rewraps": 2, "color": "#ff8844", "desc": "Suffering is earned"},
	{"name": "Nice", "mult": 5, "rewraps": 1, "color": "#ff4466", "desc": "One chance left"},
	{"name": "Unforgivable", "mult": 6, "rewraps": 0, "color": "#ff0033", "desc": "No mercy. No rewraps."},
]


static func build(root: Control, on_select: Callable, current_tier: int = 1, current_perma: bool = false) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "DifficultySelect"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	THEME.apply_to_panel(panel, THEME.NEON_CYAN)
	panel.visible = false
	root.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 60)
	margin.add_theme_constant_override("margin_top", 40)
	margin.add_theme_constant_override("margin_right", 60)
	margin.add_theme_constant_override("margin_bottom", 40)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 16)
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "SELECT DIFFICULTY"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", THEME.NEON_WHITE)
	vbox.add_child(title)

	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 16)
	grid.add_theme_constant_override("v_separation", 12)
	vbox.add_child(grid)

	var perma_check := CheckButton.new()
	perma_check.text = "PERMADEATH"
	perma_check.button_pressed = current_perma
	perma_check.add_theme_font_size_override("font_size", 18)
	perma_check.add_theme_color_override("font_color", THEME.NEON_RED)

	for i in range(TIERS.size()):
		var tier: Dictionary = TIERS[i]
		if i == 3:
			vbox.add_child(perma_check)
		var btn := Button.new()
		var label := "%s\n%dx // %d rewraps\n%s" % [tier["name"], tier["mult"], tier["rewraps"], tier["desc"]]
		btn.text = label
		btn.custom_minimum_size = Vector2(280, 120)
		btn.add_theme_font_size_override("font_size", 14)
		THEME.apply_to_button(btn, Color(tier["color"]))
		if i + 1 == current_tier:
			btn.add_theme_stylebox_override("normal", THEME.make_hover_style(Color(tier["color"])))
		btn.pressed.connect(func() -> void:
			on_select.call(i + 1, perma_check.button_pressed))
		grid.add_child(btn)
		if i + 1 == 6:
			perma_check.button_pressed = true
			perma_check.disabled = true

	return {"panel": panel, "perma_check": perma_check}
