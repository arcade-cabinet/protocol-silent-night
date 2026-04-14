extends GdUnitTestSuite

const KIT := preload("res://scripts/enemy_silhouette_kit.gd")
const POSE := preload("res://scripts/enemy_pose_language.gd")


func test_santa_pose_deploys_cage_and_ram_when_alerted() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	KIT.decorate_enemy(root, "santa", {"bow_color": "#ffd700", "base_color": "#cc2244"})
	var enemy := {
		"id": "santa",
		"node": root,
		"telegraphed": true,
		"phase_level": 3,
		"behavior_timer": 0.4,
	}
	POSE.update_enemy_pose(enemy)
	var cage := root.get_node("EnemySilhouette/SiegeCage") as Node3D
	var ram := root.get_node("EnemySilhouette/Ram") as MeshInstance3D
	assert_float(cage.position.z).is_greater(0.0)
	assert_float(ram.position.z).is_greater(0.6)


func test_boss_pose_widens_horns_and_lifts_halo_in_phase_three() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var shell := KIT.build_boss_fallback(Color("ff3a61"))
	root.add_child(shell)
	var boss_ref := {"node": root, "attack_timer": 0.6}
	POSE.update_boss_pose(boss_ref, 1)
	var halo := root.get_node("BossFallback/CrownHalo") as MeshInstance3D
	var phase_one_y: float = halo.position.y
	var horn := root.get_node("BossFallback/Horn1") as Node3D
	var phase_one_x: float = horn.position.x
	POSE.update_boss_pose(boss_ref, 3)
	assert_float(halo.position.y).is_greater(phase_one_y)
	assert_float(horn.position.x).is_greater(phase_one_x)
