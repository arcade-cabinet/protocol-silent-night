extends Node

## Per-frame ticker for flair types that need _process access:
## wobble_animation, color_shift, trailing_sparks. Each registered
## entry stores a target mesh + animation params and is advanced
## every frame. Entries whose targets have been freed are pruned.

const SPARK_LIFE := 0.45

var _entries: Array = []
var _spark_rng := RandomNumberGenerator.new()
var reduced_motion: bool = false


func _ready() -> void:
	_spark_rng.seed = int(Time.get_ticks_usec())


func configure(reduced: bool) -> void:
	reduced_motion = reduced


func register(target: Node3D, anim_type: String, params: Dictionary) -> void:
	if target == null:
		return
	_entries.append({
		"target": target,
		"type": anim_type,
		"params": params,
		"time": 0.0,
		"base_position": target.position,
		"spark_accumulator": 0.0,
	})


func clear() -> void:
	_entries.clear()


func _process(delta: float) -> void:
	if reduced_motion:
		return
	for i in range(_entries.size() - 1, -1, -1):
		var entry: Dictionary = _entries[i]
		var target_raw: Variant = entry.get("target")
		if target_raw == null or not is_instance_valid(target_raw):
			_entries.remove_at(i)
			continue
		entry["time"] = float(entry["time"]) + delta
		match String(entry["type"]):
			"wobble_animation": _tick_wobble(entry)
			"color_shift": _tick_color_shift(entry)
			"trailing_sparks": _tick_trailing_sparks(entry, delta)


func _tick_wobble(entry: Dictionary) -> void:
	var target := entry["target"] as Node3D
	if target == null:
		return
	var params: Dictionary = entry["params"]
	var amplitude: float = float(params.get("amplitude", 0.05))
	var rate: float = float(params.get("rate", 3.0))
	var base_pos: Vector3 = entry["base_position"]
	target.position.y = base_pos.y + sin(float(entry["time"]) * rate) * amplitude


func _tick_color_shift(entry: Dictionary) -> void:
	var mesh_inst := entry["target"] as MeshInstance3D
	if mesh_inst == null:
		return
	var std := mesh_inst.material_override as StandardMaterial3D
	if std == null:
		return
	var params: Dictionary = entry["params"]
	var hue_speed: float = float(params.get("hue_speed", 0.3))
	var saturation: float = float(params.get("saturation", 0.8))
	var t: float = fmod(float(entry["time"]) * hue_speed, 1.0)
	var shifted := Color.from_hsv(t, saturation, 1.0)
	std.albedo_color = shifted
	std.emission = shifted


func _tick_trailing_sparks(entry: Dictionary, delta: float) -> void:
	var target := entry["target"] as Node3D
	if target == null:
		return
	entry["spark_accumulator"] = float(entry["spark_accumulator"]) + delta
	if float(entry["spark_accumulator"]) < 0.15:
		return
	entry["spark_accumulator"] = 0.0
	var params: Dictionary = entry["params"]
	var count: int = int(params.get("count", 1))
	var color := Color(String(params.get("color", "#ff8822")))
	var parent: Node = target.get_parent()
	if parent == null:
		return
	for i in range(count):
		var spark := MeshInstance3D.new()
		var sphere := SphereMesh.new()
		sphere.radius = 0.05
		sphere.height = 0.1
		spark.mesh = sphere
		spark.position = target.position + Vector3(
			_spark_rng.randf_range(-0.2, 0.2), 0.3, _spark_rng.randf_range(-0.2, 0.2))
		var mat := StandardMaterial3D.new()
		mat.albedo_color = color
		mat.emission_enabled = true
		mat.emission = color
		mat.emission_energy_multiplier = 2.0
		spark.material_override = mat
		parent.add_child(spark)
		_fade_out(spark, SPARK_LIFE)


func _fade_out(node: Node3D, duration: float) -> void:
	var tween := node.create_tween()
	tween.tween_property(node, "scale", Vector3.ZERO, duration)
	tween.tween_callback(node.queue_free)
