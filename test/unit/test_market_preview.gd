extends GdUnitTestSuite

const PREVIEW := preload("res://scripts/market_preview.gd")
const MARKET := preload("res://scripts/market_screen.gd")


func _valid_item(slot: String, rarity: int = 2, flair: Array = []) -> Dictionary:
	return {
		"id": "preview_%s_%d" % [slot, rarity],
		"name": "Test %s" % slot,
		"slot": slot,
		"rarity": rarity,
		"stats": {"damage_mult": 0.07},
		"flair": flair,
		"flavor": "test flavor",
		"color": "#ff8822",
	}


func test_build_preview_returns_subviewport_container() -> void:
	var container: SubViewportContainer = PREVIEW.build_preview(_valid_item("weapon_mod"))
	auto_free(container)
	assert_object(container).is_not_null()
	assert_int(container.get_child_count()).is_equal(1)
	var viewport: Node = container.get_child(0)
	assert_bool(viewport is SubViewport).is_true()


func test_preview_viewport_has_camera_and_scene() -> void:
	var container: SubViewportContainer = PREVIEW.build_preview(_valid_item("bow_accessory"))
	auto_free(container)
	var viewport: SubViewport = container.get_child(0) as SubViewport
	var scene: Node3D = viewport.get_child(0) as Node3D
	assert_object(scene).is_not_null()
	var has_camera := false
	var has_light := false
	var has_mesh := false
	for child in scene.get_children():
		if child is Camera3D:
			has_camera = true
		elif child is DirectionalLight3D:
			has_light = true
		elif child is MeshInstance3D:
			has_mesh = true
	assert_bool(has_camera).is_true()
	assert_bool(has_light).is_true()
	assert_bool(has_mesh).is_true()


func test_preview_equips_gear_onto_placeholder() -> void:
	var flair := [{"type": "halo_ring", "radius": 0.8, "color": "#ffd700"}]
	var container: SubViewportContainer = PREVIEW.build_preview(_valid_item("bow_accessory", 5, flair))
	auto_free(container)
	var viewport: SubViewport = container.get_child(0) as SubViewport
	var scene: Node3D = viewport.get_child(0) as Node3D
	# Scene should have: camera, 2 lights, placeholder body + bow, Gear_bow_accessory node, halo torus
	# Minimum 6 children
	assert_int(scene.get_child_count()).is_greater_equal(6)


func test_market_card_has_preview_name_and_buy_button() -> void:
	var row: HBoxContainer = auto_free(HBoxContainer.new())
	add_child(row)
	var cookie_label: Label = auto_free(Label.new())
	add_child(cookie_label)
	var items: Array = [_valid_item("weapon_mod", 3)]
	var cookies := 500
	var buy_called: int = -1
	var on_buy := func(idx: int) -> void: buy_called = idx
	MARKET.refresh_market({"cookie_label": cookie_label, "item_row": row, "on_buy": on_buy}, items, cookies)
	assert_int(row.get_child_count()).is_equal(1)
	var card: Control = row.get_child(0) as Control
	assert_object(card).is_not_null()
	# Walk card's descendant tree for a Label containing the item name and a Button.
	var found_name := false
	var found_button := false
	var stack: Array = [card]
	while stack.size() > 0:
		var node: Node = stack.pop_back()
		if node is Label and (node as Label).text.contains("weapon_mod"):
			found_name = true
		if node is Button:
			found_button = true
		for child in node.get_children():
			stack.append(child)
	assert_bool(found_name).is_true()
	assert_bool(found_button).is_true()


func test_preview_with_empty_flair_still_succeeds() -> void:
	var container: SubViewportContainer = PREVIEW.build_preview(_valid_item("tag_charm", 1, []))
	auto_free(container)
	assert_object(container).is_not_null()
