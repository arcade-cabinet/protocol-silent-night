extends RefCounted

const MATERIAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/MATERIAL/1K-JPG"
const DECAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/DECAL/1K-JPG"

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
	float radial = length(world_pos.xz);
	if (radial > arena_radius) {
		discard;
	}
	float gx = smoothstep(0.95, 1.0, fract((world_pos.x + arena_radius) * grid_scale));
	float gz = smoothstep(0.95, 1.0, fract((world_pos.z + arena_radius) * grid_scale));
	vec3 color = base_color.rgb;
	color -= grid_color.rgb * (gx + gz) * grid_strength;
	float edge = smoothstep(arena_radius - 1.8, arena_radius, radial);
	color = mix(color, vec3(0.25, 0.37, 0.49), edge * 0.45);
	ALBEDO = color;
	ROUGHNESS = 0.88;
	SPECULAR = 0.12;
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
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.08
	mat.roughness = 0.42
	return mat


func emissive_material(color: Color, energy: float = 1.4, roughness: float = 0.22) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = color
	mat.metallic = 0.05
	mat.roughness = roughness
	mat.emission_enabled = true
	mat.emission = color
	mat.emission_energy_multiplier = energy
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
	var key := "decal:%s" % material_name
	if material_cache.has(key):
		return material_cache[key]
	var material := StandardMaterial3D.new()
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	material.albedo_texture = load_texture("%s/%s/%s_1K-JPG_Color.jpg" % [DECAL_ROOT, material_name, material_name])
	material.albedo_color = Color(1, 1, 1, 0.82)
	material.roughness = 0.55
	material.emission_enabled = true
	material.emission = Color("ffd56d")
	material.emission_energy_multiplier = 0.3
	material_cache[key] = material
	return material


func pbr_material(material_name: String, tint: Color) -> Material:
	if material_cache.has(material_name):
		return material_cache[material_name]
	var base_path := "%s/%s" % [MATERIAL_ROOT, material_name]
	var material := StandardMaterial3D.new()
	material.albedo_texture = load_texture("%s/%s_1K-JPG_Color.jpg" % [base_path, material_name])
	material.normal_enabled = true
	material.normal_texture = load_texture("%s/%s_1K-JPG_NormalGL.jpg" % [base_path, material_name])
	material.roughness_texture = load_texture("%s/%s_1K-JPG_Roughness.jpg" % [base_path, material_name])
	material.albedo_color = tint
	material.uv1_scale = Vector3(1.18, 1.18, 1.0)
	material.metallic = 0.04
	if material_name.begins_with("Ice"):
		material.roughness = 0.08
		material.emission_enabled = true
		material.emission = Color("b9efff")
		material.emission_energy_multiplier = 0.22
	elif material_name.begins_with("Snow"):
		material.roughness = 0.92
	else:
		material.roughness = 0.48
	material_cache[material_name] = material
	return material


func load_texture(path: String) -> Texture2D:
	if texture_cache.has(path):
		return texture_cache[path]
	if not FileAccess.file_exists(path):
		return null
	var image := Image.load_from_file(path)
	if image == null or image.is_empty():
		return null
	var texture := ImageTexture.create_from_image(image)
	texture_cache[path] = texture
	return texture
