extends GdUnitTestSuite

const KIT := preload("res://scripts/enemy_silhouette_kit.gd")
const REACT := preload("res://scripts/enemy_reactivity.gd")


func test_register_hit_tilts_visual_root() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var visual := Node3D.new()
	visual.name = "Present_elf"
	root.add_child(visual)
	KIT.decorate_enemy(visual, "elf", {"bow_color": "#00ffcc", "arm_color": "#f0ffe8"})
	var enemy := {"node": root}
	REACT.register_hit(enemy, Vector3(1, 0, 0), 0.9)
	REACT.update_enemy(enemy, 0.05)
	assert_float(visual.rotation_degrees.x).is_less(0.0)
	assert_float(visual.scale.x).is_greater(1.0)


func test_spawn_death_echo_tracks_collapse_vfx() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	var visual := Node3D.new()
	visual.name = "Present_santa"
	root.add_child(visual)
	KIT.decorate_enemy(visual, "santa", {"bow_color": "#ffd700", "base_color": "#cc2244"})
	var vfx: Array = []
	REACT.spawn_death_echo(root, vfx, {"node": root, "hit_sign": -1.0})
	assert_int(vfx.size()).is_equal(1)
	assert_str(String(vfx[0].get("mode", ""))).is_equal("collapse")
