extends Node3D
## Rotates parent node 45 degrees per second on the Y axis.
## Attach as a child to any Node3D to spin it continuously.

func _process(delta: float) -> void:
	rotation.y += deg_to_rad(45.0) * delta
