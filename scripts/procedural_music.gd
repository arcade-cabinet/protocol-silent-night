extends RefCounted
class_name ProceduralMusic

## Generates looping music tracks as AudioStreamWAV.
## Uses 16-bit PCM mono at 22050 Hz — same as procedural_sfx.

const SAMPLE_RATE := 22050
const PI2 := TAU


static func make_menu_loop() -> AudioStreamWAV:
	var dur := 8.0
	var samples := int(dur * SAMPLE_RATE)
	var data := PackedByteArray()
	data.resize(samples * 2)
	for i in range(samples):
		var t := float(i) / SAMPLE_RATE
		var bass := sin(PI2 * 55.0 * t) * 0.2 * (1.0 + 0.3 * sin(PI2 * 0.25 * t))
		var pad := sin(PI2 * 82.4 * t) * 0.08 + sin(PI2 * 110.0 * t) * 0.06
		var bell := 0.0
		var bell_phase := fmod(t, 2.0)
		if bell_phase < 0.6:
			var env := exp(-bell_phase * 5.0)
			bell = sin(PI2 * 880.0 * bell_phase) * env * 0.12
		var wind := (fmod(float(i) * 0.0001 + sin(t * 1.3) * 0.5, 1.0) - 0.5) * 0.04
		var sample := int(clampf((bass + pad + bell + wind) * 32767.0, -32767.0, 32767.0))
		data[i * 2] = sample & 0xFF
		data[i * 2 + 1] = (sample >> 8) & 0xFF
	return _make_stream(data, samples)


static func make_gameplay_loop() -> AudioStreamWAV:
	var dur := 6.0
	var samples := int(dur * SAMPLE_RATE)
	var data := PackedByteArray()
	data.resize(samples * 2)
	for i in range(samples):
		var t := float(i) / SAMPLE_RATE
		var kick_phase := fmod(t, 0.5)
		var kick := sin(PI2 * (120.0 - kick_phase * 180.0) * kick_phase) * exp(-kick_phase * 12.0) * 0.3
		var hat_phase := fmod(t + 0.25, 0.5)
		var hat := (fmod(float(i) * 0.013 + t, 1.0) - 0.5) * exp(-hat_phase * 20.0) * 0.15
		var bass := sin(PI2 * 73.4 * t) * 0.15 * (1.0 + 0.4 * sin(PI2 * 0.33 * t))
		var tension := sin(PI2 * 146.8 * t) * 0.06 + sin(PI2 * 220.0 * t) * 0.04
		var sample := int(clampf((kick + hat + bass + tension) * 32767.0, -32767.0, 32767.0))
		data[i * 2] = sample & 0xFF
		data[i * 2 + 1] = (sample >> 8) & 0xFF
	return _make_stream(data, samples)


static func make_boss_loop() -> AudioStreamWAV:
	var dur := 4.0
	var samples := int(dur * SAMPLE_RATE)
	var data := PackedByteArray()
	data.resize(samples * 2)
	for i in range(samples):
		var t := float(i) / SAMPLE_RATE
		var drone := sin(PI2 * 41.2 * t) * 0.25 + sin(PI2 * 61.7 * t) * 0.15
		var tritone := sin(PI2 * (82.4 + t * 30.0) * t) * 0.1 * sin(PI2 * 0.5 * t)
		var pulse := sin(PI2 * 2.0 * t) * 0.08
		var rumble := sin(PI2 * 27.5 * t + sin(PI2 * 3.0 * t) * 2.0) * 0.12
		var sample := int(clampf((drone + tritone + pulse + rumble) * 32767.0, -32767.0, 32767.0))
		data[i * 2] = sample & 0xFF
		data[i * 2 + 1] = (sample >> 8) & 0xFF
	return _make_stream(data, samples)


static func _make_stream(data: PackedByteArray, samples: int) -> AudioStreamWAV:
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SAMPLE_RATE
	stream.stereo = false
	stream.data = data
	stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
	stream.loop_begin = 0
	stream.loop_end = samples
	return stream
