extends GdUnitTestSuite

const TARGET_HINT := preload("res://scripts/target_hint_widget.gd")


func test_target_hint_tracks_visible_mobile_target() -> void:
	var viewport: SubViewport = auto_free(SubViewport.new())
	viewport.size = Vector2i(844, 390)
	add_child(viewport)
	var world := Node3D.new()
	viewport.add_child(world)
	var camera := Camera3D.new()
	camera.current = true
	camera.look_at_from_position(Vector3(0.0, 8.0, 8.0), Vector3(0.0, 0.5, 0.0), Vector3.UP)
	world.add_child(camera)
	var player := Node3D.new()
	player.position = Vector3.ZERO
	world.add_child(player)
	var enemy := Node3D.new()
	enemy.position = Vector3(1.5, 0.0, -1.0)
	world.add_child(enemy)
	var cls := ClassResource.new()
	cls.damage = 34.0
	cls.range_val = 16.0
	cls.fire_rate = 0.5
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	viewport.add_child(root)
	await get_tree().process_frame
	var state: Dictionary = TARGET_HINT.build(root)
	TARGET_HINT.update(state, camera, player, {"id": "rusher", "node": enemy}, cls)
	assert_bool((state["line"] as Line2D).visible).is_true()
	assert_bool((state["reticle"] as PanelContainer).visible).is_true()
	assert_str((state["label"] as Label).text).contains("BREACH LOCK")
