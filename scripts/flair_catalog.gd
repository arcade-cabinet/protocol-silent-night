extends RefCounted

## Catalog of flair pieces with achievement-driven unlock criteria.
## Behavior-only: content lives in declarations/gear/flair_catalog.json
## and is loaded on first access. Each entry maps a flair type (must match
## GearSystem.VALID_FLAIR_TYPES) to an achievement key + threshold and the
## parameters the visual layer interprets when rendering the piece.

const CATALOG_PATH := "res://declarations/gear/flair_catalog.json"

static var _pieces_cache: Array = []
static var _cache_loaded: bool = false


static func _load_pieces() -> Array:
	if _cache_loaded:
		return _pieces_cache
	_cache_loaded = true
	var file := FileAccess.open(CATALOG_PATH, FileAccess.READ)
	if file == null:
		return _pieces_cache
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary and parsed.get("pieces") is Array:
		_pieces_cache = parsed["pieces"]
	return _pieces_cache


static func all_pieces() -> Array:
	return _load_pieces()


static func get_unlocked(save_manager: Node) -> Array:
	var pieces: Array = _load_pieces()
	if save_manager == null:
		return _baseline_pool()
	var unlocked: Array = []
	for piece in pieces:
		var key: String = String(piece.get("achievement", ""))
		var threshold: int = int(piece.get("threshold", 0))
		var current: int = save_manager.get_achievement(key) if save_manager.has_method("get_achievement") else 0
		if current >= threshold:
			unlocked.append({"type": piece["type"]}.merged(piece.get("params", {})))
	return unlocked


static func _baseline_pool() -> Array:
	var baseline: Array = []
	for piece in _load_pieces():
		if int(piece.get("threshold", 0)) == 0:
			baseline.append({"type": piece["type"]}.merged(piece.get("params", {})))
	return baseline
