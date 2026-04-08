extends RefCounted
class_name PresentFaceRenderer

## Generates procedural face textures for present characters.
## 5 expressions: determined, angry, cheerful, stoic, manic.

var _face_cache: Dictionary = {}


func face_material(expression: String) -> StandardMaterial3D:
	if _face_cache.has(expression):
		return _face_cache[expression]
	var tex := _generate_face_texture(expression)
	var mat := StandardMaterial3D.new()
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.albedo_texture = tex
	mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	mat.billboard_keep_scale = true
	_face_cache[expression] = mat
	return mat


func _generate_face_texture(expression: String) -> ImageTexture:
	var size := 48
	var image := Image.create(size, size, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	var white := Color.WHITE
	var pupil := Color("111111")
	var mouth := Color("222222")
	var highlight := Color("ffffffcc")
	match expression:
		"determined":
			_rect(image, 10, 12, 8, 8, white)
			_rect(image, 12, 14, 4, 4, pupil)
			_rect(image, 30, 12, 8, 8, white)
			_rect(image, 32, 14, 4, 4, pupil)
			_rect(image, 13, 13, 1, 1, highlight)
			_rect(image, 33, 13, 1, 1, highlight)
			_rect(image, 15, 30, 18, 3, mouth)
		"angry":
			_rect(image, 10, 14, 8, 6, white)
			_rect(image, 12, 15, 4, 4, pupil)
			_rect(image, 30, 14, 8, 6, white)
			_rect(image, 32, 15, 4, 4, pupil)
			_rect(image, 9, 12, 9, 2, pupil)
			_rect(image, 30, 12, 9, 2, pupil)
			_rect(image, 14, 30, 20, 3, mouth)
			_rect(image, 14, 29, 3, 2, mouth)
			_rect(image, 31, 29, 3, 2, mouth)
		"cheerful":
			_rect(image, 10, 11, 8, 9, white)
			_rect(image, 12, 13, 4, 5, pupil)
			_rect(image, 13, 12, 2, 1, highlight)
			_rect(image, 30, 11, 8, 9, white)
			_rect(image, 32, 13, 4, 5, pupil)
			_rect(image, 33, 12, 2, 1, highlight)
			_rect(image, 15, 30, 18, 2, mouth)
			_rect(image, 17, 32, 14, 2, mouth)
		"stoic":
			_rect(image, 11, 14, 6, 5, white)
			_rect(image, 13, 15, 3, 3, pupil)
			_rect(image, 31, 14, 6, 5, white)
			_rect(image, 33, 15, 3, 3, pupil)
			_rect(image, 17, 31, 14, 2, mouth)
		"manic":
			_rect(image, 9, 10, 10, 10, white)
			_rect(image, 12, 13, 5, 5, pupil)
			_rect(image, 13, 11, 2, 2, highlight)
			_rect(image, 29, 10, 10, 10, white)
			_rect(image, 32, 13, 5, 5, pupil)
			_rect(image, 33, 11, 2, 2, highlight)
			_rect(image, 13, 28, 22, 5, mouth)
			_rect(image, 15, 29, 18, 2, white)
		_:
			_rect(image, 11, 14, 6, 5, white)
			_rect(image, 13, 15, 3, 3, pupil)
			_rect(image, 31, 14, 6, 5, white)
			_rect(image, 33, 15, 3, 3, pupil)
			_rect(image, 17, 31, 14, 2, mouth)
	return ImageTexture.create_from_image(image)


func _rect(image: Image, x: int, y: int,
		w: int, h: int, color: Color) -> void:
	for py in range(h):
		for px in range(w):
			var ix := x + px
			var iy := y + py
			if ix >= 0 and ix < image.get_width() and iy >= 0 and iy < image.get_height():
				image.set_pixel(ix, iy, color)
