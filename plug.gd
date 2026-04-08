@tool
extends "res://addons/gd-plug/plug.gd"


func _plugging() -> void:
	# Testing is the first dependency in the reboot. Pin gdUnit4 to a known
	# Godot 4.6-compatible tag and do not float it without an explicit validation pass.
	plug("MikeSchulze/gdUnit4", {
		"tag": "v6.1.2",
		"include": ["addons/gdUnit4/"]
	})

	# Holidaypunk needs procedural generation strong enough to create spaces and
	# motifs we cannot realistically source as off-the-shelf content. Pin Gaea to
	# an exact commit from the 4.6 line so upstream changes never move us
	# implicitly. If we need fixes, prefer contributing upstream and then choosing
	# to advance the pin deliberately.
	plug("BenjaTK/gaea-fork", {
		"commit": "4065f0fecf24c6b293d440bc6008d97139a0c5d8",
		"include": ["addons/gaea/"]
	})
