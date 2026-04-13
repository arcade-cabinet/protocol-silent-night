extends RefCounted

const PRESENT_FACTORY := preload("res://scripts/present_factory.gd")
const GEAR_VISUALIZER := preload("res://scripts/gear_visualizer.gd")
const PLAYER_TOUCH_INPUT := preload("res://scripts/player_touch_input.gd")

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer
var present_factory: RefCounted = PRESENT_FACTORY.new()
var _touch_memory := {"move_index": -1, "dash_index": -1}


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_player(actor_root: Node3D, class_id: String, present_defs: Dictionary = {}, gear_system: RefCounted = null, animator: Node = null) -> Dictionary:
	if not present_defs.has(class_id):
		push_error("spawn_player: class_id '%s' not found in present_defs" % class_id)
	return _spawn_present_player(actor_root, class_id, present_defs.get(class_id, {}), gear_system, animator)


func _spawn_present_player(actor_root: Node3D, class_id: String, def: Dictionary, gear_system: RefCounted = null, animator: Node = null) -> Dictionary:
	var player_node := Node3D.new()
	player_node.name = "Player"
	actor_root.add_child(player_node)
	var visual: Node3D = present_factory.build_present(def)
	visual.scale = Vector3.ONE * 1.3
	player_node.add_child(visual)
	GEAR_VISUALIZER.attach(visual, gear_system, animator)
	player_node.position = Vector3(0, 0.12, 0)
	var player_class := {
		"id": class_id,
		"name": def.get("name", class_id),
		"max_hp": float(def.get("max_hp", 100)),
		"speed": float(def.get("speed", 12.0)),
		"fire_rate": float(def.get("fire_rate", 0.22)),
		"damage": float(def.get("damage", 14.0)),
		"range": float(def.get("range", 15.0)),
		"bullet_speed": float(def.get("bullet_speed", 26.0)),
		"bullet_scale": 0.3,
		"shot_count": int(def.get("shot_count", 1)),
		"spread": float(def.get("spread", 0.06)),
		"pierce": int(def.get("pierce", 1)),
		"color": def.get("bow_color", "#ffd700"),
		"dash_cooldown": 1.0,
		"contact_damage_reduction": 0.0,
		"xp_bonus": 0.0,
		"cookie_bonus": 0.0,
		"crit_chance": 0.0,
	}
	if gear_system != null:
		player_class = gear_system.apply_modifiers(player_class)

	var player_class_res := ClassResource.from_dict(class_id, player_class)
	var player_state := {
		"class": player_class_res,
		"hp": player_class_res.max_hp,
		"max_hp": player_class_res.max_hp,
		"last_shot": 0.0,
		"aura_level": 0,
		"aura_timer": 0.0,
		"shake": 0.0
	}
	return {"node": player_node, "mesh": visual, "state": player_state}


func read_move_input(input_move: Vector2, touch_active: bool) -> Vector2:
	var move := input_move
	if not touch_active:
		move = Vector2.ZERO
		if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
			move.x -= 1.0
		if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
			move.x += 1.0
		if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
			move.y -= 1.0
		if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
			move.y += 1.0
		# Gamepad: left stick with 0.15 dead-zone, D-pad as fallback.
		var joy_x := Input.get_joy_axis(0, JOY_AXIS_LEFT_X)
		var joy_y := Input.get_joy_axis(0, JOY_AXIS_LEFT_Y)
		if absf(joy_x) > 0.15 or absf(joy_y) > 0.15:
			move += Vector2(joy_x, joy_y)
		if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_LEFT): move.x -= 1.0
		if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_RIGHT): move.x += 1.0
		if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_UP): move.y -= 1.0
		if Input.is_joy_button_pressed(0, JOY_BUTTON_DPAD_DOWN): move.y += 1.0
	if move.length() > 1.0:
		move = move.normalized()
	return move


func auto_fire(delta: float, player_state: Dictionary, player_node: Node3D, on_closest_target: Callable, on_spawn_projectile: Callable, fire_scale: float, damage_scale: float) -> bool:
	player_state["last_shot"] += delta
	var cls: ClassResource = player_state["class"]
	if player_state["last_shot"] < cls.fire_rate / fire_scale:
		return false
	var target: Dictionary = on_closest_target.call()
	if target.is_empty():
		return false

	player_state["last_shot"] = 0.0
	var target_node: Node3D = target["node"]
	var dir := (target_node.global_position - player_node.global_position).normalized()
	var shot_count: int = cls.shot_count
	var spread: float = cls.spread
	for shot_index in range(shot_count):
		var shot_dir := dir
		if shot_count > 1:
			shot_dir = dir.rotated(Vector3.UP, randf_range(-spread, spread) * 0.35)
		on_spawn_projectile.call(player_node.global_position + Vector3(0, 0.4, 0), shot_dir, false, cls.damage * damage_scale, cls.pierce, cls.bullet_speed, cls.bullet_scale)
	return true


func update_player_aura(delta: float, player_state: Dictionary, player_node: Node3D, enemies: Array, boss_ref: Dictionary, damage_scale: float, on_kill_enemy: Callable, on_spawn_hit_fx: Callable, boss_bar: ProgressBar, on_spawn_damage_number: Callable, on_boss_killed: Callable) -> void:
	player_state["aura_timer"] += delta
	if player_state["aura_timer"] < 0.25:
		return
	player_state["aura_timer"] = 0.0
	
	var cls: ClassResource = player_state["class"]
	var aura_range := 3.5
	var aura_damage := cls.damage * 0.4 * damage_scale
	
	for enemy_index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[enemy_index]
		if not is_instance_valid(enemy.get("node")):
			enemies.remove_at(enemy_index)
			continue
		var dist := player_node.global_position.distance_to(enemy["node"].global_position)
		if dist <= aura_range:
			if on_spawn_hit_fx.is_valid(): on_spawn_hit_fx.call(enemy["node"].global_position, Color.WHITE)
			if on_spawn_damage_number.is_valid(): on_spawn_damage_number.call(enemy["node"], aura_damage)
			enemy["hp"] -= aura_damage
			if enemy["hp"] <= 0 and on_kill_enemy.is_valid():
				on_kill_enemy.call(enemy_index)
	
	if not boss_ref.is_empty() and is_instance_valid(boss_ref.get("node")):
		var dist := player_node.global_position.distance_to(boss_ref["node"].global_position)
		if dist <= aura_range:
			if on_spawn_hit_fx.is_valid(): on_spawn_hit_fx.call(boss_ref["node"].global_position, Color.WHITE)
			if on_spawn_damage_number.is_valid(): on_spawn_damage_number.call(boss_ref["node"], aura_damage)
			boss_ref["hp"] -= aura_damage
			if boss_bar != null:
				boss_bar.value = boss_ref["hp"]
			if boss_ref["hp"] <= 0 and on_boss_killed.is_valid():
				on_boss_killed.call()

func handle_input(event: InputEvent, viewport_size: Vector2, state: Dictionary) -> void:
	if event is InputEventKey and event.physical_keycode == KEY_SHIFT:
		state["dash_pressed"] = event.pressed
	if event is InputEventJoypadButton:
		var joy := event as InputEventJoypadButton
		if joy.button_index == JOY_BUTTON_RIGHT_SHOULDER or joy.button_index == JOY_BUTTON_A:
			state["dash_pressed"] = joy.pressed
	PLAYER_TOUCH_INPUT.handle(event, viewport_size, state, _touch_memory)
