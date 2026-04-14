extends RefCounted

const _PBR := preload("res://scripts/material_factory_pbr.gd")

var material_cache: Dictionary = {}
var texture_cache: Dictionary = {}


func arena_surface_material(arena_radius: float) -> Material:
	var key := "arena_surface:%s" % String.num(arena_radius, 2)
	if material_cache.has(key):
		return material_cache[key]
	var shader := Shader.new()
	shader.code = """
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_opaque;

uniform vec4 snow_color : source_color = vec4(0.58, 0.66, 0.78, 1.0);
uniform vec4 drift_shadow : source_color = vec4(0.16, 0.21, 0.3, 1.0);
uniform float arena_radius = 18.0;
uniform float grid_scale = 0.5;
uniform float grid_strength = 0.22;

varying vec3 world_pos;

void vertex() {
	world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	float half_w = arena_radius * 1.6;
	float half_h = arena_radius;
	float gx = smoothstep(0.95, 1.0, fract((world_pos.x + half_w) * grid_scale));
	float gz = smoothstep(0.95, 1.0, fract((world_pos.z + half_h) * grid_scale));
	vec3 color = snow_color.rgb;
	color -= drift_shadow.rgb * (gx + gz) * grid_strength;
	float r = length(world_pos.xz) / arena_radius;
	float ice_t = smoothstep(0.36, 0.74, r);
	float board_edge = smoothstep(0.7, 0.98, max(abs(world_pos.x) / half_w, abs(world_pos.z) / half_h));
	vec2 gust_uv = vec2(world_pos.x * 0.11 + world_pos.z * 0.04, world_pos.z * 0.09 - world_pos.x * 0.03);
	float gust_a = smoothstep(0.58, 0.94, 0.5 + 0.5 * sin(gust_uv.x * 8.0 + sin(gust_uv.y * 3.0)));
	float gust_b = smoothstep(0.62, 0.96, 0.5 + 0.5 * sin((world_pos.x - world_pos.z) * 0.42 + 1.6));
	float gust_mix = max(gust_a * 0.7, gust_b * 0.45) * (1.0 - ice_t * 0.35);
	float scar_a = smoothstep(0.54, 0.96, 0.5 + 0.5 * sin(world_pos.x * 0.24 + world_pos.z * 0.18 + sin(world_pos.z * 0.08) * 2.8));
	float scar_b = smoothstep(0.58, 0.96, 0.5 + 0.5 * sin((world_pos.x - world_pos.z) * 0.34 + 0.8));
	float drift_lane = max(scar_a * 0.8, scar_b * 0.55);
	float ribbon_x = smoothstep(half_w - 2.4, half_w - 0.5, abs(world_pos.x));
	float ribbon_z = smoothstep(half_h - 2.0, half_h - 0.4, abs(world_pos.z));
	float ribbon = max(ribbon_x, ribbon_z);
	vec3 holly_red = vec3(0.74, 0.12, 0.18);
	vec3 tinsel_green = vec3(0.14, 0.42, 0.22);
	vec3 ornament_gold = vec3(0.8, 0.62, 0.18);
	vec3 midnight_plum = vec3(0.13, 0.09, 0.15);
	float stripe_mix = step(0.0, sin((world_pos.x + world_pos.z) * 0.22));
	vec3 stripe_color = mix(holly_red, tinsel_green, stripe_mix);
	float soot_t = smoothstep(0.18, 0.78, abs(sin((world_pos.x + world_pos.z) * 0.18)));
	float warning_mix = step(0.0, sin(world_pos.x * 0.38 + world_pos.z * 0.22));
	vec3 warning_color = mix(holly_red, ornament_gold, warning_mix);
	color = mix(color, drift_shadow.rgb * 0.96, soot_t * 0.12 + drift_lane * 0.16);
	color = mix(color, midnight_plum, board_edge * 0.18);
	color = mix(color, vec3(0.84, 0.9, 0.96), ice_t * 0.12);
	color = mix(color, vec3(0.92, 0.96, 1.0), gust_mix * 0.18);
	color = mix(color, stripe_color, ribbon * 0.3);
	color = mix(color, warning_color, board_edge * 0.2);
	color += ornament_gold * (0.03 + ribbon * 0.09 + board_edge * 0.06) * (1.0 - ice_t * 0.35);
	ALBEDO = color;
	ROUGHNESS = mix(0.96, 0.32, ice_t) - gust_mix * 0.08 + board_edge * 0.04;
	SPECULAR = mix(0.08, 0.34, ice_t + gust_mix * 0.18);
	EMISSION = color * (0.03 + ribbon * 0.06 + gust_mix * 0.04 + board_edge * 0.05);
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("arena_radius", arena_radius)
	material_cache[key] = material
	return material


func outer_field_material(arena_radius: float) -> Material:
	var key := "outer_field:%s" % String.num(arena_radius, 2)
	if material_cache.has(key):
		return material_cache[key]
	var shader := Shader.new()
	shader.code = """
shader_type spatial;
render_mode blend_mix, cull_disabled, depth_draw_opaque;

uniform float arena_radius = 18.0;
varying vec3 world_pos;

void vertex() {
	world_pos = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
	float radial = length(world_pos.xz);
	float inner = smoothstep(arena_radius + 1.0, arena_radius + 6.0, radial);
	float gx = smoothstep(0.95, 1.0, fract((world_pos.x + arena_radius) * 0.28));
	float gz = smoothstep(0.95, 1.0, fract((world_pos.z + arena_radius) * 0.28));
	float lane = smoothstep(0.66, 0.94, 0.5 + 0.5 * sin((world_pos.x - world_pos.z) * 0.24 + radial * 0.05));
	float scab = smoothstep(0.42, 0.92, abs(sin((world_pos.x + world_pos.z) * 0.1)) * abs(cos((world_pos.x - world_pos.z) * 0.07)));
	vec3 color = mix(vec3(0.32, 0.2, 0.24), vec3(0.08, 0.1, 0.14), inner);
	color -= vec3(0.08, 0.1, 0.14) * (gx + gz) * 0.18;
	float glow = smoothstep(arena_radius + 1.5, arena_radius + 3.5, radial);
	color = mix(color, vec3(0.45, 0.16, 0.18), glow * 0.14);
	color = mix(color, vec3(0.15, 0.33, 0.2), lane * 0.12 * (1.0 - inner * 0.4));
	color = mix(color, vec3(0.06, 0.08, 0.1), scab * 0.14);
	ALBEDO = color;
	ROUGHNESS = 0.9;
	SPECULAR = 0.06;
	EMISSION = color * (glow * 0.04 + lane * 0.02);
}
"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("arena_radius", arena_radius)
	material_cache[key] = material
	return material


func flat_material(color: Color) -> StandardMaterial3D:
	var key := "flat:%s" % color.to_html(false)
	if material_cache.has(key):
		return material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.08
	mat.roughness = 0.42
	material_cache[key] = mat
	return mat


func emissive_material(color: Color, energy: float = 1.4, roughness: float = 0.22) -> StandardMaterial3D:
	var key := "emissive:%s_%.2f_%.2f" % [color.to_html(false), energy, roughness]
	if material_cache.has(key):
		return material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.05
	mat.roughness = roughness
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
	material_cache[key] = mat
	return mat


func shadow_material() -> Material:
	var key := "shadow_disc"
	if material_cache.has(key):
		return material_cache[key]
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_color = Color(0, 0, 0, 0.38)
	material_cache[key] = mat
	return mat


func material_for_zone(zone: String) -> Material:
	var tint := Color("e3edf6")
	var mat_name := "Snow001"
	match zone:
		"ice":
			tint = Color("b8ddff")
			mat_name = "Ice001"
		"asphalt":
			tint = Color("405266")
			mat_name = "Asphalt001"
	var mat: StandardMaterial3D = pbr_material(mat_name, tint) as StandardMaterial3D
	if mat != null and mat.albedo_texture == null:
		return flat_material(tint)
	return mat


func decal_material(material_name: String) -> Material:
	return _PBR.decal_material(material_name, material_cache, texture_cache)


func pbr_material(material_name: String, tint: Color) -> Material:
	return _PBR.pbr_material(material_name, tint, material_cache, texture_cache)


func load_texture(path: String) -> Texture2D:
	return _PBR.load_texture(path, texture_cache)
