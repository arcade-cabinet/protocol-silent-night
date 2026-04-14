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
	var kicker := Label.new()
	kicker.text = "BLACK-TAG BAZAAR"
	kicker.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	kicker.add_theme_font_size_override("font_size", 14)
	kicker.add_theme_color_override("font_color", THEME.NEON_GOLD)
	vbox.add_child(kicker)
	var title := Label.new()
	title.text = "RIOT THE MARKET"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 36)
	title.add_theme_color_override("font_color", THEME.NEON_GREEN)
	vbox.add_child(title)
	var cookie_label := Label.new()
	cookie_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	cookie_label.add_theme_font_size_override("font_size", 18)
	cookie_label.add_theme_color_override("font_color", THEME.NEON_GOLD)
	cookie_label.custom_minimum_size = Vector2(0, 38)
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
	reroll_btn.text = "SHAKE THE STALLS (%d C)" % REROLL_COST
	reroll_btn.custom_minimum_size = Vector2(200, 50)
	THEME.apply_to_button(reroll_btn, THEME.NEON_GOLD)
	reroll_btn.pressed.connect(on_reroll)
	button_row.add_child(reroll_btn)
	var continue_btn := Button.new()
	continue_btn.text = "BACK TO THE LOT →"
	continue_btn.custom_minimum_size = Vector2(200, 50)
	THEME.apply_to_button(continue_btn, THEME.NEON_GREEN)
	continue_btn.pressed.connect(on_continue)
	button_row.add_child(continue_btn)
	return {
		"panel": panel, "item_row": item_row,
		"cookie_label": cookie_label, "on_buy": on_buy,
	}


static func refresh_market(state: Dictionary, items: Array, cookies: int) -> void:
	state["cookie_label"].text = "STASH %d C · %d CURSED OFFERS · REROLL %d C" % [cookies, items.size(), REROLL_COST]
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
	card_panel.custom_minimum_size = Vector2(236, 316)
	card_panel.add_theme_stylebox_override("panel", THEME.make_panel_style(accent, Color(0.02, 0.05, 0.03, 0.92)))
	var card_margin := MarginContainer.new()
	for side in ["margin_left", "margin_top", "margin_right", "margin_bottom"]:
		card_margin.add_theme_constant_override(side, 8)
	card_panel.add_child(card_margin)
	var card_vbox := VBoxContainer.new()
	card_vbox.alignment = BoxContainer.ALIGNMENT_BEGIN
	card_vbox.add_theme_constant_override("separation", 6)
	card_margin.add_child(card_vbox)
	var header_row := HBoxContainer.new()
	header_row.alignment = BoxContainer.ALIGNMENT_CENTER
	header_row.add_theme_constant_override("separation", 8)
	card_vbox.add_child(header_row)
	var slot_label := Label.new()
	slot_label.text = _slot_label(String(item.get("slot", "")))
	slot_label.add_theme_font_size_override("font_size", 11)
	slot_label.add_theme_color_override("font_color", THEME.NEON_WHITE)
	header_row.add_child(slot_label)
	var rarity_label := Label.new()
	rarity_label.text = _rarity_label(int(item.get("rarity", 1)))
	rarity_label.add_theme_font_size_override("font_size", 11)
	rarity_label.add_theme_color_override("font_color", accent)
	header_row.add_child(rarity_label)
	card_vbox.add_child(PREVIEW.build_preview(item))
	var name_label := Label.new()
	name_label.text = String(item.get("name", "?"))
	name_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	name_label.custom_minimum_size = Vector2(210, 0)
	name_label.add_theme_font_size_override("font_size", 14)
	name_label.add_theme_color_override("font_color", accent)
	card_vbox.add_child(name_label)
	var flavor_label := Label.new()
	flavor_label.text = String(item.get("flavor", ""))
	flavor_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	flavor_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	flavor_label.custom_minimum_size = Vector2(210, 0)
	flavor_label.add_theme_font_size_override("font_size", 11)
	flavor_label.add_theme_color_override("font_color", THEME.NEON_WHITE)
	card_vbox.add_child(flavor_label)
	var stats_label := Label.new()
	stats_label.text = _stat_line(item)
	stats_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	stats_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	stats_label.custom_minimum_size = Vector2(210, 0)
	stats_label.add_theme_font_size_override("font_size", 11)
	stats_label.add_theme_color_override("font_color", THEME.NEON_GREEN)
	card_vbox.add_child(stats_label)
	var buy_btn := Button.new()
	buy_btn.text = "BUY · %d C" % cost if cookies >= cost else "SHORT %d C" % (cost - cookies)
	buy_btn.custom_minimum_size = Vector2(210, 36)
	buy_btn.add_theme_font_size_override("font_size", 14)
	THEME.apply_to_button(buy_btn, accent)
	buy_btn.disabled = cookies < cost
	buy_btn.pressed.connect(on_buy.bind(index))
	card_vbox.add_child(buy_btn)
	return card_panel


static func _compute_cost(rarity: int) -> int:
	return 15 * rarity * rarity


static func _slot_label(slot: String) -> String:
	return {
		"weapon_mod": "BARREL",
		"wrapping_upgrade": "WRAP",
		"bow_accessory": "BOW",
		"tag_charm": "TAG",
	}.get(slot, slot.replace("_", " ").to_upper())


static func _rarity_label(rarity: int) -> String:
	return String(GearSystem.RARITIES.get(rarity, {}).get("name", "Common")).to_upper()


static func _stat_line(item: Dictionary) -> String:
	var stats: Dictionary = item.get("stats", {})
	var chunks: Array[String] = []
	for key in stats.keys():
		chunks.append(_format_stat(String(key), float(stats[key])))
		if chunks.size() == 2:
			break
	return " · ".join(chunks)


static func _format_stat(key: String, value: float) -> String:
	var pct := int(roundf(value * 100.0))
	return {
		"damage_flat": "DMG +%d" % int(roundf(value)),
		"damage_mult": "DMG +%d%%" % pct,
		"fire_rate_mult": "ROF +%d%%" % pct,
		"speed_mult": "SPD +%d%%" % pct,
		"hp_flat": "HP +%d" % int(roundf(value)),
		"hp_mult": "HP +%d%%" % pct,
		"range_mult": "RNG +%d%%" % pct,
		"pierce_flat": "PIERCE +%d" % int(roundf(value)),
		"crit_chance": "CRIT +%d%%" % pct,
		"cookie_bonus": "COOKIE +%d%%" % pct,
		"xp_bonus": "XP +%d%%" % pct,
		"bullet_speed_mult": "SHOT +%d%%" % pct,
		"shot_count_flat": "SHOT +%d" % int(roundf(value)),
		"spread_mult": "SPREAD %d%%" % pct,
		"contact_damage_reduction": "ARMOR +%d%%" % pct,
		"dash_cooldown_mult": "DASH -%d%%" % pct,
	}.get(key, "%s %.2f" % [key.replace("_", " ").to_upper(), value])


static func generate_items(rng: RandomNumberGenerator, archetypes: Dictionary,
		unlocked_flair: Array, level: int, difficulty: int) -> Array:
	return GEAR_GEN.generate_market(rng, 3, archetypes, unlocked_flair, level, difficulty)
