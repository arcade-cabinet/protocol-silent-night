extends GdUnitTestSuite

const FRAME_BUDGET := preload("res://scripts/frame_budget_monitor.gd")


func test_summary_reports_average_and_worst_frame() -> void:
	var budget: RefCounted = FRAME_BUDGET.new()
	budget.sample(1.0 / 60.0)
	budget.sample(1.0 / 30.0)
	var summary: Dictionary = budget.summary()
	assert_bool(summary["has_data"]).is_true()
	assert_float(float(summary["fps"])).is_less(60.0)
	assert_float(float(summary["worst_ms"])).is_greater_equal(33.0)
	assert_str(String(summary["rating"])).is_equal("critical")


func test_reset_clears_previous_session_data() -> void:
	var budget: RefCounted = FRAME_BUDGET.new()
	budget.sample(1.0 / 20.0)
	assert_bool(budget.summary()["has_data"]).is_true()
	budget.reset()
	var summary: Dictionary = budget.summary()
	assert_bool(summary["has_data"]).is_false()
	assert_float(float(summary["lifetime_seconds"])).is_equal(0.0)
