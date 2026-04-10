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

uniform vec4 base_color : source_color = vec4(0.66, 0.76, 0.85, 1.0);
uniform vec4 grid_color : source_color = vec4(0.18, 0.28, 0.39, 1.0);
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
	vec3 color = base_color.rgb;
	color -= grid_color.rgb * (gx + gz) * grid_strength;
	// Radial zone tinting: snow (inner) → ice (mid) → asphalt (outer perimeter)
	float r = length(world_pos.xz) / arena_radius;
	float ice_t = smoothstep(0.32, 0.60, r);
	float asphalt_t = smoothstep(0.68, 0.88, r);
	color = mix(color, vec3(0.68, 0.90, 0.98), ice_t * 0.22);
	color = mix(color, vec3(0.16, 0.22, 0.28), asphalt_t * 0.38);
	float edge_x = smoothstep(half_w - 1.5, half_w, abs(world_pos.x));
	float edge_z = smoothstep(half_h - 1.5, half_h, abs(world_pos.z));
	float edge = max(edge_x, edge_z);
	color = mix(color, vec3(0.18, 0.28, 0.4), edge * 0.55);
	ALBEDO = color;
	ROUGHNESS = mix(0.88, mix(0.18, 0.72, asphalt_t), ice_t * 0.6);
	SPECULAR = mix(0.12, 0.45, ice_t * (1.0 - asphalt_t));
	EMISSION = color * 0.05;
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
	vec3 color = mix(vec3(0.18, 0.25, 0.34), vec3(0.07, 0.11, 0.18), inner);
	color += vec3(0.05, 0.08, 0.12) * gx;
	color += vec3(0.05, 0.08, 0.12) * gz;
	ALBEDO = color;
	ROUGHNESS = 0.94;
	SPECULAR = 0.05;
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
