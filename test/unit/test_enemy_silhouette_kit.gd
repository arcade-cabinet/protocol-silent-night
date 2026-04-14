extends GdUnitTestSuite

const KIT := preload("res://scripts/enemy_silhouette_kit.gd")


func test_elf_silhouette_adds_mohawk_and_piercings() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	KIT.decorate_enemy(root, "elf", {"bow_color": "#00ffcc", "arm_color": "#f0ffe8"})
	assert_object(root.get_node_or_null("EnemySilhouette/Mohawk")).is_not_null()
	assert_object(root.get_node_or_null("EnemySilhouette/Piercing-1")).is_not_null()
	assert_object(root.get_node_or_null("EnemySilhouette/Piercing1")).is_not_null()


func test_santa_silhouette_adds_siege_cage() -> void:
	var root: Node3D = auto_free(Node3D.new())
	add_child(root)
	KIT.decorate_enemy(root, "santa", {"bow_color": "#ffd700", "base_color": "#cc2244"})
	assert_object(root.get_node_or_null("EnemySilhouette/SiegeCage/Crossbar")).is_not_null()
	assert_object(root.get_node_or_null("EnemySilhouette/SiegeCage/Stack-1")).is_not_null()
	assert_object(root.get_node_or_null("EnemySilhouette/SiegeCage/Stack1")).is_not_null()


func test_boss_fallback_builds_authored_shell() -> void:
	var shell: Node3D = auto_free(KIT.build_boss_fallback(Color("ff3a61")))
	add_child(shell)
	assert_object(shell.get_node_or_null("Chest")).is_not_null()
	assert_object(shell.get_node_or_null("CrownHalo")).is_not_null()
	assert_object(shell.get_node_or_null("Horn-1")).is_not_null()
	assert_object(shell.get_node_or_null("Horn1")).is_not_null()
