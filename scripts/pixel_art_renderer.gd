extends RefCounted

const PIXEL_SCALE := 8
const PIXEL_PALETTE := {
	".": Color(0, 0, 0, 0),
	"W": Color("ffffff"),
	"k": Color("000000"),
	"R": Color("ff0044"),
	"G": Color("00ffcc"),
	"Y": Color("ffd700"),
	"B": Color("0044ff"),
	"O": Color("ff8800"),
	"D": Color("333333"),
	"P": Color("9900ff"),
	"N": Color("8B4513"),
	"E": Color("00cc44"),
	"C": Color("FFD700")
}
const PIXEL_ART := {
	"elf": """
....E....
...EEE...
..EEEEE..
..WkWWkW.
...WWWW..
...EEEE..
..EE..EE.
...DDDD..
...D..D..
""",
	"santa": """
....R....
...RRR...
..WWWWW..
..WkWWkW.
..WWWWW..
..RRRRR..
.RRkRkRR.
.RRRRRRR.
...DDD...
""",
	"bumble": """
..WWWWW..
.WWWWWWW.
.WkBkWWW.
.WWWWWWW.
WWWWWWWWW
WWWWWWWWW
.WWWWWWW.
..WW.WW..
""",
	"grunt": """
...kkk...
...kkk...
..WkWkW..
..WWOWW..
...WWW...
..WWWWW..
.WWRWRWW.
.WWWWWWW.
..WWWWW..
""",
	"rusher": """
N......N
N......N
NN....NN
.NNNNNN.
.NkNNkN.
..NNNN..
...RR...
..NNNN..
.NN..NN.
""",
	"tank": """
...NNN...
..NkNkN..
..NNNNN..
NNNNNNNNN
N.NNNNN.N
N.NNNNN.N
..N.N.N..
..N...N..
""",
	"boss": """
Y......Y
YY....YY
.RRYYRR.
RRkRRkRR
RRRRRRRR
.RYYYYR.
.RRRRRR.
..RRRR..
.DD..DD.
""",
	"xp": """
WWWWWWW
WRRWRRW
WWWWWWW
WRRWRRW
WWWWWWW
"""
}

var texture_cache: Dictionary = {}
var material_cache: Dictionary = {}


func pixel_texture(art_id: String) -> Texture2D:
	var key := "pixel:%s" % art_id
	if texture_cache.has(key):
		return texture_cache[key]
	if not PIXEL_ART.has(art_id):
		return null
	var rows: PackedStringArray = String(PIXEL_ART[art_id]).strip_edges().split("\n")
	var height := rows.size()
	var width := rows[0].length()
	var image := Image.create(width * PIXEL_SCALE, height * PIXEL_SCALE, false, Image.FORMAT_RGBA8)
	image.fill(Color(0, 0, 0, 0))
	for y in range(height):
		var row := rows[y]
		for x in range(width):
			var symbol := row.substr(x, 1)
			if not PIXEL_PALETTE.has(symbol):
				continue
			var color: Color = PIXEL_PALETTE[symbol]
			if color.a <= 0.0:
				continue
			for py in range(PIXEL_SCALE):
				for px in range(PIXEL_SCALE):
					image.set_pixel(x * PIXEL_SCALE + px, y * PIXEL_SCALE + py, color)
	var texture := ImageTexture.create_from_image(image)
	texture_cache[key] = texture
	return texture


func billboard_material(art_id: String, glow_color: Color = Color.WHITE) -> Material:
	var key := "billboard:%s:%s" % [art_id, glow_color.to_html()]
	if material_cache.has(key):
		return material_cache[key]
	var material := StandardMaterial3D.new()
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
	material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
	material.albedo_texture = pixel_texture(art_id)
	material.albedo_color = Color.WHITE
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.emission_enabled = true
	material.emission = glow_color
	material.emission_energy_multiplier = 0.25
	material_cache[key] = material
	return material


func make_billboard_sprite(art_id: String, base_height: float, glow_color: Color = Color.WHITE) -> MeshInstance3D:
	var texture := pixel_texture(art_id)
	var sprite := MeshInstance3D.new()
	var quad := QuadMesh.new()
	var aspect := float(texture.get_width()) / float(texture.get_height())
	quad.size = Vector2(base_height * aspect, base_height)
	sprite.mesh = quad
	sprite.position = Vector3(0, base_height * 0.5, 0)
	sprite.material_override = billboard_material(art_id, glow_color)
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	return sprite
