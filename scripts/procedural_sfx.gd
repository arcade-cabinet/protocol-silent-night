extends RefCounted

const SAMPLE_RATE: int = 22050
const MAX_AMPLITUDE: int = 30000  # leave some headroom below int16 max (32767)


func make_tone(freq: float, duration: float, decay: float = 6.0) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * maxf(duration, 0.01)))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var envelope := exp(-t * decay)
		var wave := sin(t * freq * TAU)
		var sample := int(wave * envelope * float(MAX_AMPLITUDE))
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_sweep(start_freq: float, end_freq: float, duration: float, decay: float = 3.0) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * maxf(duration, 0.01)))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var phase := 0.0
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var progress := t / maxf(duration, 0.01)
		var freq: float = lerpf(start_freq, end_freq, progress)
		phase += (freq * TAU) / float(SAMPLE_RATE)
		var envelope := exp(-t * decay)
		var wave := sin(phase)
		var sample := int(wave * envelope * float(MAX_AMPLITUDE))
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_chord(freqs: Array, duration: float, decay: float = 2.5) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * maxf(duration, 0.01)))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var note_count: int = maxi(freqs.size(), 1)
	var per_note: float = 1.0 / float(note_count)
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var envelope := exp(-t * decay)
		var mixed := 0.0
		for f in freqs:
			mixed += sin(t * float(f) * TAU) * per_note
		var sample := int(mixed * envelope * float(MAX_AMPLITUDE))
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_noise_burst(duration: float, decay: float = 10.0) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * maxf(duration, 0.01)))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = 1225
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var envelope := exp(-t * decay)
		var wave := rng.randf_range(-1.0, 1.0)
		var sample := int(wave * envelope * float(MAX_AMPLITUDE))
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func _build_stream(data: PackedByteArray) -> AudioStreamWAV:
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SAMPLE_RATE
	stream.stereo = false
	stream.loop_mode = AudioStreamWAV.LOOP_DISABLED
	stream.data = data
	return stream


func _write_int16(data: PackedByteArray, offset: int, value: int) -> void:
	var clamped: int = clampi(value, -32767, 32767)
	if clamped < 0:
		clamped += 65536
	data[offset] = clamped & 0xff
	data[offset + 1] = (clamped >> 8) & 0xff
