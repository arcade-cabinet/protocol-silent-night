extends GdUnitTestSuite

const PROCEDURAL_SFX := preload("res://scripts/procedural_sfx.gd")
const SAMPLE_RATE: int = 22050

var _sfx: RefCounted


func before_test() -> void:
	_sfx = PROCEDURAL_SFX.new()


func test_make_tone_returns_audio_stream_wav() -> void:
	var stream: AudioStreamWAV = _sfx.make_tone(440.0, 0.1, 6.0)
	assert_object(stream).is_not_null()
	assert_int(stream.format).is_equal(AudioStreamWAV.FORMAT_16_BITS)
	assert_int(stream.mix_rate).is_equal(SAMPLE_RATE)
	assert_bool(stream.stereo).is_false()
	var expected_bytes := int(round(float(SAMPLE_RATE) * 0.1)) * 2
	assert_int(stream.data.size()).is_equal(expected_bytes)


func test_make_tone_contains_non_zero_samples() -> void:
	var stream: AudioStreamWAV = _sfx.make_tone(440.0, 0.1, 6.0)
	var total_abs := 0
	var data: PackedByteArray = stream.data
	for i in range(0, data.size(), 2):
		var lo: int = data[i]
		var hi: int = data[i + 1]
		var value: int = lo | (hi << 8)
		if value >= 32768:
			value -= 65536
		total_abs += absi(value)
	assert_int(total_abs).is_greater(0)


func test_make_sweep_has_expected_duration() -> void:
	var duration := 0.25
	var stream: AudioStreamWAV = _sfx.make_sweep(880.0, 220.0, duration, 3.0)
	assert_object(stream).is_not_null()
	var expected_samples := int(round(float(SAMPLE_RATE) * duration))
	assert_int(stream.data.size()).is_equal(expected_samples * 2)


func test_make_chord_does_not_clip() -> void:
	var stream: AudioStreamWAV = _sfx.make_chord([261.63, 329.63, 392.00], 0.5, 2.5)
	assert_object(stream).is_not_null()
	var max_abs := 0
	var data: PackedByteArray = stream.data
	for i in range(0, data.size(), 2):
		var lo: int = data[i]
		var hi: int = data[i + 1]
		var value: int = lo | (hi << 8)
		if value >= 32768:
			value -= 65536
		var abs_value: int = absi(value)
		if abs_value > max_abs:
			max_abs = abs_value
	assert_int(max_abs).is_less_equal(32767)
	assert_int(max_abs).is_greater(0)


func test_make_noise_burst_returns_stream() -> void:
	var stream: AudioStreamWAV = _sfx.make_noise_burst(0.1, 10.0)
	assert_object(stream).is_not_null()
	var expected_bytes := int(round(float(SAMPLE_RATE) * 0.1)) * 2
	assert_int(stream.data.size()).is_equal(expected_bytes)
