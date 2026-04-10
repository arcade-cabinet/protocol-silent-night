extends RefCounted
class_name BossPhases

## 3-phase Krampus-Prime boss fight (BT HSM pattern).
## Phase 1 (100%→66% HP): Circle-strafe + ranged fan at 0.9s.
## Phase 2 (66%→33% HP): Circle-strafe + charge every 4s + AOE telegraph.
## Phase 3 (33%→0% HP): Charge every 2.5s + multi-shot at 0.8s + minion summon every 6s.

const BossBTHelpers := preload("res://scripts/boss_bt_helpers.gd")

var phase_timer: float = 0.0
var aoe_timer: float = 0.0
var summon_timer: float = 0.0
var multi_shot_timer: float = 0.0
var current_phase: int = 1
var aoe_telegraphs: Array = []


static func get_phase(boss_ref: Dictionary) -> int:
	var hp_ratio := float(boss_ref.get("hp", 1.0)) / maxf(float(boss_ref.get("max_hp", 1.0)), 0.01)
	if hp_ratio > 0.66:
		return 1
	if hp_ratio > 0.33:
		return 2
	return 3


func update_boss(delta: float, boss_ref: Dictionary, player_node: Node3D,
		on_move: Callable, on_projectile: Callable, on_damage_player: Callable,
		on_show_message: Callable, on_spawn_enemy: Callable,
		fx_root: Node3D, boss_attack_scale: float,
		on_phase_changed: Callable = Callable()) -> void:
	if boss_ref.is_empty():
		return
	var phase := get_phase(boss_ref)
	if phase != current_phase:
		_on_phase_change(phase, boss_ref, on_show_message)
		if on_phase_changed.is_valid():
			on_phase_changed.call(phase)
		current_phase = phase
	var boss_node: Node3D = boss_ref["node"]
	var boss_pos: Vector3 = boss_node.position
	var to_player: Vector3 = player_node.position - boss_pos
	to_player.y = 0.0
	var boss_dir: Vector3 = to_player.normalized() if to_player.length_squared() > 0.0001 else Vector3.FORWARD
	# Phase-specific movement
	var base_speed: float = float(boss_ref["speed"])
	if phase >= 2:
		BossBTHelpers.charge_tick(boss_ref, delta, 4.0 if phase == 2 else 2.5)
		BossBTHelpers.update_charge_phase(boss_ref, delta)
	if phase >= 2 and BossBTHelpers.is_charging(boss_ref):
		on_move.call(boss_node, boss_dir, base_speed * BossBTHelpers.CHARGE_SPEED_MULT, delta, 1.2)
	else:
		var strafe_dir := BossBTHelpers.circle_strafe_dir(boss_pos, player_node.position)
		on_move.call(boss_node, strafe_dir, base_speed * (1.0 + (phase - 1) * 0.12), delta, 1.2)
	boss_ref["ring"].rotation_degrees.y += (80.0 + phase * 40.0) * delta
	# Ranged attack
	boss_ref["attack_timer"] += delta
	var fire_interval := (0.9 if phase == 1 else 1.2) / boss_attack_scale
	if boss_ref["attack_timer"] >= fire_interval:
		boss_ref["attack_timer"] = 0.0
		var spread := 2 + phase
		for shot in range(-spread, spread + 1):
			on_projectile.call(boss_pos + Vector3(0, 0.6, 0),
				boss_dir.rotated(Vector3.UP, shot * 0.1), true, 18.0 + phase * 4.0, 1, 18.0, 0.35)
	# Phase 3 multi-shot burst
	if phase >= 3:
		multi_shot_timer += delta
		if multi_shot_timer >= 0.8 / boss_attack_scale:
			multi_shot_timer = 0.0
			BossBTHelpers.multi_shot(boss_pos, boss_dir, on_projectile, 14.0, 20.0)
	if boss_pos.distance_to(player_node.position) < 1.65:
		on_damage_player.call(float(boss_ref["contact_damage"]) * delta * (1.0 + phase * 0.3))
	if phase >= 2:
		_update_aoe(delta, boss_ref, player_node, on_damage_player, fx_root)
	if phase >= 3:
		_update_summons(delta, boss_ref, on_spawn_enemy)
	_update_telegraphs(delta, fx_root, player_node)


func _on_phase_change(new_phase: int, boss_ref: Dictionary, on_msg: Callable) -> void:
	match new_phase:
		2:
			on_msg.call("KRAMPUS ENRAGED", 2.0, Color("ff8844"))
			boss_ref["ring"].material_override.emission = Color("ff6622")
		3:
			on_msg.call("KRAMPUS UNLEASHED", 2.0, Color("ff2244"))
			boss_ref["ring"].material_override.emission = Color("ff0033")
			boss_ref["ring"].material_override.emission_energy_multiplier = 3.5


func _update_aoe(delta: float, boss_ref: Dictionary, player_node: Node3D,
		on_damage_player: Callable, fx_root: Node3D) -> void:
	aoe_timer += delta
	if aoe_timer < 3.5:
		return
	aoe_timer = 0.0
	var target_pos := player_node.position
	var telegraph := _spawn_telegraph(fx_root, target_pos)
	aoe_telegraphs.append({"node": telegraph, "life": 0.8, "position": target_pos, "damage": 25.0, "radius": 3.5, "on_damage": on_damage_player})


func _update_summons(delta: float, _boss_ref: Dictionary, on_spawn_enemy: Callable) -> void:
	summon_timer += delta
	if summon_timer < 6.0:
		return
	summon_timer = 0.0
	for _i in range(2):
		on_spawn_enemy.call()


func _update_telegraphs(delta: float, _fx_root: Node3D, player_node: Node3D) -> void:
	for i in range(aoe_telegraphs.size() - 1, -1, -1):
		var t: Dictionary = aoe_telegraphs[i]
		t["life"] -= delta
		if t["life"] <= 0.0:
			var p_pos := player_node.position
			var t_pos: Vector3 = t["position"]
			var in_aoe := is_instance_valid(player_node) and \
				Vector2(p_pos.x, p_pos.z).distance_to(Vector2(t_pos.x, t_pos.z)) <= float(t["radius"])
			if in_aoe:
				t["on_damage"].call(float(t["damage"]))
			t["node"].queue_free()
			aoe_telegraphs.remove_at(i)
		else:
			var pulse := 1.0 - float(t["life"]) / 0.8
			t["node"].scale = Vector3.ONE * (float(t["radius"]) * pulse)
			var mat := t["node"].material_override as StandardMaterial3D
			if mat != null:
				mat.albedo_color.a = 0.15 + pulse * 0.4
			aoe_telegraphs[i] = t


func _spawn_telegraph(root: Node3D, pos: Vector3) -> MeshInstance3D:
	var mesh := MeshInstance3D.new()
	var disc := CylinderMesh.new()
	disc.top_radius = 1.0
	disc.bottom_radius = 1.0
	disc.height = 0.05
	mesh.mesh = disc
	mesh.position = Vector3(pos.x, 0.08, pos.z)
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.albedo_color = Color(1.0, 0.2, 0.1, 0.15)
	mat.emission_enabled = true
	mat.emission = Color("ff4422")
	mat.emission_energy_multiplier = 2.0
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mesh.material_override = mat
	root.add_child(mesh)
	return mesh


func clear() -> void:
	for t in aoe_telegraphs:
		if t.has("node") and t["node"] != null:
			t["node"].queue_free()
	aoe_telegraphs.clear()
	current_phase = 1
	aoe_timer = 0.0
	summon_timer = 0.0
	multi_shot_timer = 0.0
	phase_timer = 0.0
