extends GdUnitTestSuite

var _menus: GDScript = preload("res://scripts/ui_menus.gd")
var _screens: GDScript = preload("res://scripts/ui_screens.gd")
var _difficulty: GDScript = preload("res://scripts/difficulty_select.gd")


func test_start_screen_uses_wide_phone_card_row() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(844, 390)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var start: Dictionary = _menus.build_start_screen(root, func() -> void: pass)
	var classes_box: Node = start["classes_box"]
	assert_object(classes_box).is_instanceof(HBoxContainer)
	assert_bool(bool(start["uses_outer_scroll"])).is_true()
	assert_int(int((start["class_scroll"] as ScrollContainer).horizontal_scroll_mode)).is_equal(ScrollContainer.SCROLL_MODE_AUTO)


func test_level_screen_uses_wide_phone_upgrade_row() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(844, 390)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var level_ui: Dictionary = _screens.build_level_screen(root)
	var upgrade_box: Node = level_ui["upgrade_box"]
	assert_object(upgrade_box).is_instanceof(HBoxContainer)
	assert_object(level_ui["decision_shell"]).is_null()
	assert_str((level_ui["level_hint"] as Label).text).contains("Rip one upgrade")


func test_difficulty_screen_uses_wide_phone_grid() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(844, 390)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var diff: Dictionary = _difficulty.build(root, func(_tier: int, _perma: bool, _endless: bool) -> void: pass)
	_difficulty.prepare(diff, {"name": "Holly Striker", "tagline": "Archetype variant 1", "bow_color": "#69d6ff"})
	assert_bool(bool(diff["uses_outer_scroll"])).is_true()
	assert_object(diff["decision_shell"]).is_null()
	assert_object(diff["tier_container"]).is_instanceof(GridContainer)
	assert_str((diff["present_label"] as Label).text).contains("HOLLY STRIKER")
