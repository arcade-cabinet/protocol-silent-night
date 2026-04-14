extends GdUnitTestSuite

const STAGE_MARKS := preload("res://scripts/enemy_stage_marks.gd")
const MATERIAL_FACTORY := preload("res://scripts/material_factory.gd")


func test_enemy_markers_enter_alert_pose_when_telegraphed() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	STAGE_MARKS.attach_enemy_markers(root, MATERIAL_FACTORY.new(), Color("ff8844"), 1.0, "tank")
	var enemy := {
		"id": "tank",
		"node": root,
		"color": Color("ff8844"),
		"behavior_state": "prep_slam",
		"behavior_timer": 0.3,
		"telegraphed": true,
		"phase_level": 4,
		"enemy_uid": 7,
	}
	STAGE_MARKS.update_enemy_markers(enemy)
	var spikes := root.get_node("ThreatMarks/ThreatSpikes") as Node3D
	var ring := root.get_node("ThreatMarks/ThreatRing") as MeshInstance3D
	assert_bool(spikes.visible).is_true()
	assert_float(ring.scale.x).is_greater(1.0)


func test_boss_markers_brighten_and_expand_in_phase_three() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	STAGE_MARKS.attach_boss_markers(root, MATERIAL_FACTORY.new(), Color("ff2244"))
	var boss_ref := {
		"node": root,
		"color": Color("ff2244"),
		"attack_timer": 0.6,
	}
	STAGE_MARKS.update_boss_markers(boss_ref, 1)
	var ring := root.get_node("ThreatMarks/ThreatRing") as MeshInstance3D
	var phase_one_scale: float = ring.scale.x
	var phase_one_visible := 0
	for idx in range(4):
		if (root.get_node("ThreatMarks/ThreatFlare%d" % idx) as MeshInstance3D).visible:
			phase_one_visible += 1
	STAGE_MARKS.update_boss_markers(boss_ref, 3)
	var phase_three_visible := 0
	for idx in range(4):
		if (root.get_node("ThreatMarks/ThreatFlare%d" % idx) as MeshInstance3D).visible:
			phase_three_visible += 1
	assert_float(ring.scale.x).is_greater(phase_one_scale)
	assert_int(phase_three_visible).is_greater(phase_one_visible)
