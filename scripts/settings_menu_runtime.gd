extends RefCounted


static func budget_note_text(root: Control) -> String:
	if root == null or root.get_tree() == null:
		return "Session: no run telemetry yet"
	var scene: Node = root.get_tree().current_scene
	if scene == null or not scene.has_method("get"):
		return "Session: no run telemetry yet"
	var gm: Variant = scene.get("game_mgr")
	if gm != null and gm.has_method("frame_budget_summary"):
		var summary: Dictionary = gm.frame_budget_summary()
		if bool(summary.get("has_data", false)):
			return "Session: %.0f fps avg · %.0f%% slow · %.1f ms worst" % [
				float(summary.get("fps", 0.0)),
				float(summary.get("slow_ratio", 0.0)) * 100.0,
				float(summary.get("worst_ms", 0.0)),
			]
	return "Session: no run telemetry yet"


static func tick(state: Dictionary, root: Control, sm: Node, quality_note_text: Callable) -> void:
	if state.is_empty() or not state.has("quality_note") or not state.has("panel"):
		return
	var panel: PanelContainer = state["panel"]
	if panel == null or not panel.visible:
		return
	var quality_note: Label = state["quality_note"]
	quality_note.text = quality_note_text.call(root, sm)
