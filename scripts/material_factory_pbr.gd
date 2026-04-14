extends RefCounted

## PBR and texture loading helpers extracted from material_factory.gd for LOC compliance.
## Static methods that operate on the factory's shared caches.

const MATERIAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/MATERIAL/1K-JPG"
const DECAL_ROOT := "/Volumes/home/assets/2DPhotorealistic/DECAL/1K-JPG"


static func pbr_material(material_name: String, tint: Color, material_cache: Dictionary, texture_cache: Dictionary) -> Material:
	if material_cache.has(material_name):
		return material_cache[material_name]
	var base_path := "%s/%s" % [MATERIAL_ROOT, material_name]
	var material := StandardMaterial3D.new()
	if should_use_external_pbr():
		material.albedo_texture = load_texture("%s/%s_1K-JPG_Color.jpg" % [base_path, material_name], texture_cache)
		material.normal_enabled = material.albedo_texture != null
		material.normal_texture = load_texture("%s/%s_1K-JPG_NormalGL.jpg" % [base_path, material_name], texture_cache)
		material.roughness_texture = load_texture("%s/%s_1K-JPG_Roughness.jpg" % [base_path, material_name], texture_cache)
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


static func decal_material(material_name: String, material_cache: Dictionary, texture_cache: Dictionary) -> Material:
	var key := "decal:%s" % material_name
	if material_cache.has(key):
		return material_cache[key]
	var material := StandardMaterial3D.new()
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
	if should_use_external_pbr():
		material.albedo_texture = load_texture("%s/%s/%s_1K-JPG_Color.jpg" % [DECAL_ROOT, material_name, material_name], texture_cache)
	material.albedo_color = Color(1, 1, 1, 0.82)
	material.roughness = 0.55
	material.emission_enabled = true
	material.emission = Color("ffd56d")
	material.emission_energy_multiplier = 0.3
	material_cache[key] = material
	return material


static func load_texture(path: String, texture_cache: Dictionary) -> Texture2D:
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


static func should_use_external_pbr() -> bool:
	if OS.has_feature("template"):
		return false
	if OS.get_environment("PSN_FORCE_RELEASE_FALLBACK") == "1":
		return false
	return DirAccess.dir_exists_absolute(MATERIAL_ROOT) and DirAccess.dir_exists_absolute(DECAL_ROOT)
