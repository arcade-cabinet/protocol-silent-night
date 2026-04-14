extends SceneTree

## Visual test: spawns a present on the actual game board at gameplay scale.
## Run: godot --path . -s res://test/e2e/capture_present_gameplay.gd

var _main: Node = null
var _shot_dir := "res://.artifacts/screenshots"


func _initialize() -> void:
	DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
	DisplayServer.window_set_size(Vector2i(1440, 900))
	var save_script := preload("res://scripts/save_manager.gd")
	var save := _ensure_autoload(save_script, "SaveManager")
	save.set_save_path_for_tests("user://present_gameplay_test.json")
	save.reset_state_for_tests()
	save.load_state()
	_main = load("res://scenes/main.tscn").instantiate()
	root.add_child(_main)
	call_deferred("_run")


func _run() -> void:
	await process_frame
	_main.configure_test_mode({"invincible": true, "auto_collect": true})
	_main.start_run("holly_striker")
	await process_frame

	# Now inject a present character next to the player
	var spawner := PresentSpawner.new()
	spawner.load_definitions("res://declarations/presents/presents.json")
	var showcase := [
		{"id": "holly_striker", "pos": Vector3(2.5, 0.12, 0.0)},
		{"id": "p_03", "pos": Vector3(-2.5, 0.12, 0.0)},
		{"id": "p_08", "pos": Vector3(0.0, 0.12, 2.5)},
	]
	for entry in showcase:
		var present := spawner.spawn_player(String(entry["id"]), 0.55)
		present.position = entry["pos"]
		_main.runtime_root.get_node("Actors").add_child(present)

	await process_frame
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var image := root.get_viewport().get_texture().get_image()
	var path := ProjectSettings.globalize_path("%s/present_gameplay.png" % _shot_dir)
	DirAccess.make_dir_recursive_absolute(path.get_base_dir())
	image.save_png(path)

	var save_node := root.get_node_or_null("SaveManager")
	if save_node != null:
		save_node.reset_state_for_tests()
	quit(0)


func _ensure_autoload(script: GDScript, node_name: String) -> Node:
	var existing := root.get_node_or_null(node_name)
	if existing != null:
		return existing
	var inst: Node = script.new() as Node
	inst.name = node_name
	root.add_child(inst)
	return inst
