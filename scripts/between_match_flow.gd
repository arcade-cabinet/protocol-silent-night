extends RefCounted

## State machine for the between-match screen sequence:
## RESULTS → SCROLLS → MARKET → back to menu.
## Test mode can skip the entire flow via test_mode["skip_between_match"].

const SCREENS := preload("res://scripts/between_match_screens.gd")
const MARKET := preload("res://scripts/market_screen.gd")
const GEAR_SYSTEM := preload("res://scripts/gear_system.gd")
const COAL_EFFECTS := preload("res://scripts/coal_effects.gd")
const FLAIR_CATALOG := preload("res://scripts/flair_catalog.gd")

# Default reward if declarations/config/config.json is missing the key.
# Live value is read from main.config["nice_scroll_cookies"] at run time.
const DEFAULT_NICE_SCROLL_COOKIES := 15

enum Stage { NONE, RESULTS, SCROLLS, MARKET, DONE }

var main: Node
var current_stage: int = Stage.NONE
var results_state: Dictionary = {}
var scroll_state: Dictionary = {}
var market_state: Dictionary = {}
var market_items: Array = []
var market_rng := RandomNumberGenerator.new()
var scroll_rng := RandomNumberGenerator.new()
var archetypes: Dictionary = {}


func _init(main_node: Node) -> void:
	main = main_node
	_load_archetypes()
	market_rng.seed = int(Time.get_ticks_usec())
	scroll_rng.seed = int(Time.get_ticks_usec()) ^ 0x5C2011


func _load_archetypes() -> void:
	var file := FileAccess.open("res://declarations/gear/archetypes.json", FileAccess.READ)
	if file == null:
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		archetypes = parsed


func build_screens(root: Control) -> void:
	results_state = SCREENS.build_results_screen(root, _on_results_continue)
	scroll_state = SCREENS.build_scroll_screen(root, _on_scroll_continue)
	market_state = MARKET.build_market_screen(root, _on_buy, _on_reroll, _on_market_continue)


func start_flow() -> void:
	if bool(main.test_mode.get("skip_between_match", false)):
		current_stage = Stage.DONE
		return
	current_stage = Stage.RESULTS
	SCREENS.update_results(results_state, {
		"level": main.current_wave_index + 1,
		"kills": main.progression.kills,
		"cookies": main.run_cookies,
		"scrolls": main.run_scrolls.size(),
	})
	results_state["panel"].visible = true


func _on_results_continue() -> void:
	results_state["panel"].visible = false
	current_stage = Stage.SCROLLS
	scroll_state["panel"].visible = true


func _on_scroll_continue() -> void:
	open_scrolls()
	scroll_state["panel"].visible = false
	_enter_market()


func open_scrolls() -> Dictionary:
	var coal_added: Array = []
	var cookies_added: int = 0
	var nice_value: int = _nice_scroll_cookies()
	for scroll in main.run_scrolls:
		var stype: String = String(scroll.get("scroll_type", "nice")) if scroll is Dictionary else "nice"
		if stype == "naughty":
			var effect_id: String = COAL_EFFECTS.roll_effect(scroll_rng)
			main.coal_queue.append(effect_id)
			coal_added.append(effect_id)
		else:
			cookies_added += nice_value
	main.run_scrolls.clear()
	var sm: Node = main._save_manager()
	if sm != null:
		sm.set_coal(main.coal_queue)
		if cookies_added > 0:
			sm.add_cookies(cookies_added)
	return {"coal_added": coal_added, "cookies_added": cookies_added}


func _enter_market() -> void:
	current_stage = Stage.MARKET
	var sm: Node = main._save_manager()
	var unlocked_flair: Array = FLAIR_CATALOG.get_unlocked(sm)
	market_items = MARKET.generate_items(market_rng, archetypes, unlocked_flair,
		main.current_wave_index + 1, main.difficulty_tier)
	var cookies: int = sm.get_cookies() if sm != null else 0
	MARKET.refresh_market(market_state, market_items, cookies)
	market_state["panel"].visible = true


func _on_reroll() -> void:
	var sm: Node = main._save_manager()
	if sm != null and sm.spend_cookies(10):
		_enter_market()


func _on_buy(index: int) -> void:
	if index < 0 or index >= market_items.size():
		return
	var item: Dictionary = market_items[index]
	var cost: int = 15 * int(item.get("rarity", 1)) * int(item.get("rarity", 1))
	var sm: Node = main._save_manager()
	if sm == null or not sm.spend_cookies(cost):
		return
	var inv: Array = sm.state.get("gear_inventory", [])
	inv.append(item)
	sm.state["gear_inventory"] = inv
	if main.gear_sys != null:
		main.gear_sys.equip(item)
		sm.set_equipped_gear(main.gear_sys.equipped)
	else:
		sm.save_state()
	market_items.remove_at(index)
	MARKET.refresh_market(market_state, market_items, sm.get_cookies())


func _on_market_continue() -> void:
	market_state["panel"].visible = false
	current_stage = Stage.DONE
	main.game_mgr.return_to_menu()


func _nice_scroll_cookies() -> int:
	var cfg: Variant = main.get("config") if main != null else null
	if cfg is Dictionary:
		return int(cfg.get("nice_scroll_cookies", DEFAULT_NICE_SCROLL_COOKIES))
	return DEFAULT_NICE_SCROLL_COOKIES
