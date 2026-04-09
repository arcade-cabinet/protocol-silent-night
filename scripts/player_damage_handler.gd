extends RefCounted

## Handles player damage application, rewrap logic, and i-frames.
## Extracted from main.gd to reduce LOC footprint.

const REWRAP_IFRAMES: float = 1.2


static func damage_player(main: Node, amount: float) -> void:
	if bool(main.test_mode.get("invincible", false)) or main.dash_timer > 0.0:
		return
	if main.audio_mgr != null:
		main.audio_mgr.play_damage()
	main.player_state["hp"] = maxf(0.0, float(main.player_state["hp"]) - amount)
	main.shake_magnitude = 0.3
	if float(main.player_state["hp"]) <= 0.0:
		if not main.permadeath and main.rewraps > 0:
			main.rewraps -= 1
			main.player_state["hp"] = float(main.player_state["max_hp"]) * 0.5
			main.dash_timer = REWRAP_IFRAMES
			main.ui_mgr.show_message("REWRAPPED! (%d left)" % main.rewraps, 1.5, Color("ffd700"))
			main._update_ui()
		else:
			main.game_mgr.end_run(false)
	else:
		main._update_ui()
