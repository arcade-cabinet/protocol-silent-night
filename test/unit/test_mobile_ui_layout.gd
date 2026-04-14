extends GdUnitTestSuite

var _menus: GDScript = preload("res://scripts/ui_menus.gd")
var _screens: GDScript = preload("res://scripts/ui_screens.gd")


func test_start_screen_uses_vertical_mobile_card_list() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(390, 844)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var start: Dictionary = _menus.build_start_screen(root, func() -> void: pass)
	var classes_box: Node = start["classes_box"]
	assert_object(classes_box).is_instanceof(VBoxContainer)
	assert_bool(bool(start["uses_outer_scroll"])).is_false()
	assert_int(int((start["class_scroll"] as ScrollContainer).size_flags_vertical)).is_equal(Control.SIZE_EXPAND_FILL)


func test_level_screen_uses_vertical_mobile_upgrade_stack() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(390, 844)
	add_child(viewport)
	var root: Control = auto_free(Control.new())
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	var level_ui: Dictionary = _screens.build_level_screen(root)
	var upgrade_box: Node = level_ui["upgrade_box"]
	assert_object(upgrade_box).is_instanceof(VBoxContainer)
	assert_object(level_ui["decision_shell"]).is_instanceof(PanelContainer)
	assert_str((level_ui["level_hint"] as Label).text).contains("Pick one field patch")
