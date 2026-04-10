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


func make_noise_burst(duration: float, decay: float = 10.0, cutoff: float = 1.0) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * maxf(duration, 0.01)))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = 1225
	var prev := 0.0
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var envelope := exp(-t * decay)
		var wave := rng.randf_range(-1.0, 1.0)
		var safe_cutoff: float = clampf(cutoff, 0.0, 1.0)
		if safe_cutoff < 1.0:
			prev = prev * (1.0 - safe_cutoff) + wave * safe_cutoff
			wave = prev
		var sample := int(wave * envelope * float(MAX_AMPLITUDE))
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_whip(duration: float = 0.25) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * duration))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var phase := 0.0
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var progress := t / duration
		var freq: float = 180.0 + pow(progress, 1.6) * 2400.0
		phase += (freq * TAU) / float(SAMPLE_RATE)
		var envelope: float = (1.0 - progress) * sin(progress * PI)
		var sample := int(sin(phase) * envelope * float(MAX_AMPLITUDE) * 0.85)
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_bubble(duration: float = 0.5) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * duration))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var lfo := sin(t * 11.0 * TAU) * 0.3 + 1.0
		var saw_a := fmod(t * 140.0 * lfo, 1.0) * 2.0 - 1.0
		var saw_b := fmod(t * 152.0 * lfo, 1.0) * 2.0 - 1.0
		var envelope := exp(-t * 3.0)
		var mixed := (saw_a + saw_b) * 0.5
		var sample := int(mixed * envelope * float(MAX_AMPLITUDE) * 0.6)
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_crackle(duration: float = 0.45) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * duration))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var rng := RandomNumberGenerator.new()
	rng.seed = 9911
	var prev := 0.0
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var spike: float = 1.0 if rng.randf() < 0.12 else 0.0
		var raw := rng.randf_range(-1.0, 1.0) * spike
		prev = prev * 0.55 + raw * 0.45
		var envelope := exp(-t * 2.5)
		var sample := int(prev * envelope * float(MAX_AMPLITUDE) * 1.4)
		_write_int16(data, i * 2, sample)
	return _build_stream(data)


func make_chime_arp(freqs: Array = [523.25, 659.25, 783.99, 1046.50], duration: float = 0.55) -> AudioStreamWAV:
	var sample_count: int = int(round(float(SAMPLE_RATE) * duration))
	var data := PackedByteArray()
	data.resize(sample_count * 2)
	var step: float = duration / float(maxi(freqs.size(), 1))
	for i in range(sample_count):
		var t := float(i) / float(SAMPLE_RATE)
		var note_idx: int = clampi(int(t / step), 0, freqs.size() - 1)
		var note_t: float = t - note_idx * step
		var freq: float = float(freqs[note_idx])
		var envelope := exp(-note_t * 4.0)
		var wave := sin(note_t * freq * TAU) + sin(note_t * freq * 2.0 * TAU) * 0.3
		var sample := int(wave * envelope * float(MAX_AMPLITUDE) * 0.5)
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
