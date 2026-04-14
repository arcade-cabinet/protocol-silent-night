extends GdUnitTestSuite

const PBR := preload("res://scripts/material_factory_pbr.gd")


func test_release_fallback_env_disables_external_pbr() -> void:
	OS.set_environment("PSN_FORCE_RELEASE_FALLBACK", "1")
	assert_bool(PBR.should_use_external_pbr()).is_false()
	OS.set_environment("PSN_FORCE_RELEASE_FALLBACK", "")
