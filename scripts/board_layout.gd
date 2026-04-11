extends Resource
class_name BoardLayout

@export var drifts: Array[Dictionary] = []
@export var ridges: Array[Dictionary] = []
@export var obstacles: Array[Dictionary] = []
@export var landmarks: Array[Dictionary] = []


static func from_dict(data: Dictionary) -> BoardLayout:
	var res := BoardLayout.new()
	res.drifts.assign(data.get("drifts", []))
	res.ridges.assign(data.get("ridges", []))
	res.obstacles.assign(data.get("obstacles", []))
	res.landmarks.assign(data.get("landmarks", []))
	return res
