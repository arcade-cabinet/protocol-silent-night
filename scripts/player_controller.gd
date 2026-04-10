extends RefCounted

const PRESENT_FACTORY := preload("res://scripts/present_factory.gd")
const GEAR_VISUALIZER := preload("res://scripts/gear_visualizer.gd")

var materials: RefCounted  # MaterialFactory
var pixels: RefCounted  # PixelArtRenderer
var present_factory: RefCounted = PRESENT_FACTORY.new()


func _init(material_factory: RefCounted, pixel_renderer: RefCounted) -> void:
	materials = material_factory
	pixels = pixel_renderer


func spawn_player(actor_root: Node3D, class_id: String, present_defs: Dictionary = {}, gear_system: RefCounted = null, animator: Node = null) -> Dictionary:
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
	}
	if gear_system != null:
		player_class = gear_system.apply_modifiers(player_class)
	var player_state := {
		"class": player_class,
		"hp": float(player_class["max_hp"]),
		"max_hp": float(player_class["max_hp"]),
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
	if move.length() > 1.0:
		move = move.normalized()
	return move


func auto_fire(delta: float, player_state: Dictionary, player_node: Node3D, on_closest_target: Callable, on_spawn_projectile: Callable, fire_scale: float, damage_scale: float) -> bool:
	player_state["last_shot"] += delta
	if player_state["last_shot"] < float(player_state["class"]["fire_rate"]) / fire_scale:
		return false
	var target: Dictionary = on_closest_target.call()
	if target.is_empty():
		return false
	player_state["last_shot"] = 0.0
	var origin := player_node.position + Vector3(0, 0.55, 0)
	var target_position: Vector3 = target["node"].position
	var dir := (target_position - origin).normalized()
	var shot_count := int(player_state["class"]["shot_count"])
	var spread := float(player_state["class"]["spread"])
	for shot_index in range(shot_count):
		var shot_dir := dir
		if shot_count > 1:
			var normalized_index := float(shot_index) - float(shot_count - 1) * 0.5
			shot_dir = dir.rotated(Vector3.UP, normalized_index * spread)
		else:
			shot_dir = dir.rotated(Vector3.UP, randf_range(-spread, spread) * 0.35)
		on_spawn_projectile.call(origin, shot_dir, false, float(player_state["class"]["damage"]) * damage_scale, int(player_state["class"]["pierce"]), float(player_state["class"]["bullet_speed"]), float(player_state["class"]["bullet_scale"]))
	return true


func update_player_aura(delta: float, player_state: Dictionary, player_node: Node3D, enemies: Array, boss_ref: Dictionary, damage_scale: float, on_kill_enemy: Callable, on_spawn_hit_fx: Callable, boss_bar: ProgressBar, on_damage_number: Callable = Callable()) -> void:
	if int(player_state["aura_level"]) <= 0:
		return
	player_state["aura_timer"] += delta
	if player_state["aura_timer"] < 0.55:
		return
	player_state["aura_timer"] = 0.0
	var aura_radius := 2.8 + float(player_state["aura_level"]) * 0.65
	var aura_damage := 7.0 * float(player_state["aura_level"]) * damage_scale
	for enemy_index in range(enemies.size() - 1, -1, -1):
		var enemy: Dictionary = enemies[enemy_index]
		if enemy["node"].position.distance_to(player_node.position) <= aura_radius:
			enemy["hp"] -= aura_damage
			on_spawn_hit_fx.call(enemy["node"].position, Color("66fff4"))
			if on_damage_number.is_valid():
				on_damage_number.call(enemy["node"].position + Vector3(0, 1.0, 0), aura_damage, Color("66fff4"))
			if enemy["hp"] <= 0.0:
				on_kill_enemy.call(enemy_index)
			else:
				enemies[enemy_index] = enemy
	if boss_ref.size() > 0 and boss_ref["node"].position.distance_to(player_node.position) <= aura_radius + 1.0:
		boss_ref["hp"] -= aura_damage * 0.45
		boss_bar.value = boss_ref["hp"]
		if on_damage_number.is_valid():
			on_damage_number.call(boss_ref["node"].position + Vector3(0, 2.0, 0), aura_damage * 0.45, Color("66fff4"))


func handle_input(event: InputEvent, viewport_size: Vector2, state: Dictionary) -> void:
	if event is InputEventKey and event.physical_keycode == KEY_SHIFT:
		state["dash_pressed"] = event.pressed
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.position.x > viewport_size.x * 0.7 and touch.position.y > viewport_size.y * 0.65:
			state["dash_pressed"] = touch.pressed
			return
		state["touch_active"] = touch.pressed
		if touch.pressed:
			state["touch_origin"] = touch.position
			state["touch_position"] = touch.position
			state["joystick_base"] = touch.position
			state["joystick_knob"] = touch.position
			state["show_joystick"] = true
		else:
			state["input_move"] = Vector2.ZERO
			state["hide_joystick"] = true
	if event is InputEventScreenDrag and bool(state.get("touch_active", false)):
		var drag := event as InputEventScreenDrag
		state["touch_position"] = drag.position
		var origin: Vector2 = state["touch_origin"]
		var delta_vec: Vector2 = drag.position - origin
		var move: Vector2 = delta_vec.limit_length(72.0) / 72.0
		state["input_move"] = move
		state["joystick_base"] = origin
		state["joystick_knob"] = origin + move * 52.0
		state["show_joystick"] = true
