import re

with open('scripts/ui_manager.gd', 'r') as f:
    content = f.read()

hud_func = re.search(r'(func update_hud.*?)\n\n\nfunc refresh_coal_sidebar', content, re.DOTALL).group(1)

content = content.replace(hud_func, 'func update_hud(player_state: Dictionary, xp_needed: int, xp: int, level: int, kills: int, cookies: int = 0, coal_queue: Array = []) -> void:\n\tUI_WIDGETS.update_hud(self, player_state, xp_needed, xp, level, kills, cookies, coal_queue)')

with open('scripts/ui_manager.gd', 'w') as f:
    f.write(content)

with open('scripts/ui_widgets.gd', 'r') as f:
    widgets_content = f.read()

new_hud_func = hud_func.replace('func update_hud(player_state', 'static func update_hud(ui: RefCounted, player_state').replace('if hp_bar', 'if ui.hp_bar').replace('hp_bar.', 'ui.hp_bar.').replace('if hp_label', 'if ui.hp_label').replace('hp_label.', 'ui.hp_label.').replace('if xp_bar', 'if ui.xp_bar').replace('xp_bar.', 'ui.xp_bar.').replace('if level_label', 'if ui.level_label').replace('level_label.', 'ui.level_label.').replace('if kills_label', 'if ui.kills_label').replace('kills_label.', 'ui.kills_label.').replace('if cookie_label', 'if ui.cookie_label').replace('cookie_label.', 'ui.cookie_label.').replace('refresh_coal_sidebar', 'ui.refresh_coal_sidebar')

widgets_content += '\n\n' + new_hud_func

with open('scripts/ui_widgets.gd', 'w') as f:
    f.write(widgets_content)
