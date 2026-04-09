extends RefCounted

## Market screen: 3 random gear items for sale, buy with Cookies,
## reroll for 10C. Uses GearGenerator for procedural items.

const THEME := preload("res://scripts/holidaypunk_theme.gd")
const GEAR_GEN := preload("res://scripts/gear_generator.gd")
const PREVIEW := preload("res://scripts/market_preview.gd")
const REROLL_COST := 10


static func build_market_screen(root: Control, on_buy: Callable,
		on_reroll: Callable, on_continue: Callable) -> Dictionary:
	var panel := PanelContainer.new()
	panel.name = "MarketScreen"
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_GREEN, Color(0.02, 0.06, 0.04, 0.94)))
	panel.visible = false
	root.add_child(panel)
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 80)
	margin.add_theme_constant_override("margin_top", 60)
	margin.add_theme_constant_override("margin_right", 80)
	margin.add_theme_constant_override("margin_bottom", 60)
	panel.add_child(margin)
	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 16)
	margin.add_child(vbox)
	var title := Label.new()
	title.text = "PRESENT MARKET"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", THEME.NEON_GREEN)
	vbox.add_child(title)
	var cookie_label := Label.new()
	cookie_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cookie_label.add_theme_font_size_override("font_size", 18)
	cookie_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(cookie_label)
	var item_row := HBoxContainer.new()
	item_row.alignment = BoxContainer.ALIGNMENT_CENTER
	item_row.add_theme_constant_override("separation", 14)
	vbox.add_child(item_row)
	var button_row := HBoxContainer.new()
	button_row.alignment = BoxContainer.ALIGNMENT_CENTER
	button_row.add_theme_constant_override("separation", 14)
	vbox.add_child(button_row)
	var reroll_btn := Button.new()
	reroll_btn.text = "REROLL (%d C)" % REROLL_COST
	reroll_btn.custom_minimum_size = Vector2(200, 50)
	THEME.apply_to_button(reroll_btn, THEME.NEON_GOLD)
	reroll_btn.pressed.connect(on_reroll)
	button_row.add_child(reroll_btn)
	var continue_btn := Button.new()
	continue_btn.text = "LEAVE MARKET →"
	continue_btn.custom_minimum_size = Vector2(200, 50)
	THEME.apply_to_button(continue_btn, THEME.NEON_GREEN)
	continue_btn.pressed.connect(on_continue)
	button_row.add_child(continue_btn)
	return {
		"panel": panel, "item_row": item_row,
		"cookie_label": cookie_label, "on_buy": on_buy,
	}


static func refresh_market(state: Dictionary, items: Array, cookies: int) -> void:
	state["cookie_label"].text = "Cookies: %d C" % cookies
	var row: HBoxContainer = state["item_row"]
	for child in row.get_children():
		child.queue_free()
	var on_buy: Callable = state["on_buy"]
	for i in range(items.size()):
		row.add_child(_build_market_card(items[i], i, cookies, on_buy))


static func _build_market_card(item: Dictionary, index: int, cookies: int, on_buy: Callable) -> Control:
	var cost: int = _compute_cost(int(item.get("rarity", 1)))
	var accent := Color(String(item.get("color", "#ffffff")))
	var card_panel := PanelContainer.new()
	card_panel.custom_minimum_size = Vector2(230, 280)
	card_panel.add_theme_stylebox_override("panel", THEME.make_panel_style(accent, Color(0.02, 0.05, 0.03, 0.92)))
	var card_margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		card_margin.add_theme_constant_override(side, 8)
	card_panel.add_child(card_margin)
	var card_vbox := VBoxContainer.new()
	card_vbox.alignment = BoxContainer.ALIGNMENT_BEGIN
	card_vbox.add_theme_constant_override("separation", 6)
	card_margin.add_child(card_vbox)
	card_vbox.add_child(PREVIEW.build_preview(item))
	var name_label := Label.new()
	name_label.text = String(item.get("name", "?"))
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_label.custom_minimum_size = Vector2(210, 0)
	name_label.add_theme_font_size_override("font_size", 13)
	name_label.add_theme_color_override("font_color", accent)
	card_vbox.add_child(name_label)
	var buy_btn := Button.new()
	buy_btn.text = "BUY · %d C" % cost
	buy_btn.custom_minimum_size = Vector2(210, 36)
	buy_btn.add_theme_font_size_override("font_size", 14)
	THEME.apply_to_button(buy_btn, accent)
	buy_btn.disabled = cookies < cost
	buy_btn.pressed.connect(on_buy.bind(index))
	card_vbox.add_child(buy_btn)
	return card_panel


static func _compute_cost(rarity: int) -> int:
	return 15 * rarity * rarity


static func generate_items(rng: RandomNumberGenerator, archetypes: Dictionary,
		unlocked_flair: Array, level: int, difficulty: int) -> Array:
	return GEAR_GEN.generate_market(rng, 3, archetypes, unlocked_flair, level, difficulty)
