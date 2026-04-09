extends SceneTree

## Batch validates all gear definition files.
## Run: godot --headless --path . -s res://scripts/gear_validator.gd
##
## Loads every JSON in declarations/gear/ and validates each entry
## against GearSystem.validate(). Reports errors and exits non-zero
## if any definition fails.

const GEAR_DIR := "res://declarations/gear/"


func _initialize() -> void:
	var total := 0
	var valid := 0
	var invalid := 0
	var errors: Array = []

	var dir := DirAccess.open(GEAR_DIR)
	if dir == null:
		print("No gear directory at %s — nothing to validate" % GEAR_DIR)
		quit(0)
		return

	dir.list_dir_begin()
	var file_name := dir.get_next()
	while file_name != "":
		if file_name.ends_with(".json"):
			var path := "%s%s" % [GEAR_DIR, file_name]
			var result := _validate_file(path)
			total += result["total"]
			valid += result["valid"]
			invalid += result["invalid"]
			errors.append_array(result["errors"])
		file_name = dir.get_next()

	print("Gear Validation: %d total, %d valid, %d invalid" % [total, valid, invalid])
	for err in errors:
		push_error(err)
	quit(1 if invalid > 0 else 0)


func _validate_file(path: String) -> Dictionary:
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {"total": 0, "valid": 0, "invalid": 1, "errors": ["Cannot open %s" % path]}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed == null:
		return {"total": 0, "valid": 0, "invalid": 1, "errors": ["Invalid JSON: %s" % path]}
	var total := 0
	var valid := 0
	var invalid := 0
	var errors: Array = []
	if parsed is Dictionary:
		for key in parsed.keys():
			total += 1
			var result := GearSystem.validate(parsed[key])
			if result["valid"]:
				valid += 1
			else:
				invalid += 1
				for err in result["errors"]:
					errors.append("%s [%s]: %s" % [path, key, err])
	elif parsed is Array:
		for item in parsed:
			total += 1
			var result := GearSystem.validate(item)
			if result["valid"]:
				valid += 1
			else:
				invalid += 1
				for err in result["errors"]:
					errors.append("%s [%s]: %s" % [path, item.get("id", "?"), err])
	return {"total": total, "valid": valid, "invalid": invalid, "errors": errors}
