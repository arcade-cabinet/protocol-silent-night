import re

with open('scripts/ui_builder.gd', 'r') as f:
    builder_content = f.read()

hud_match = re.search(r'(static func build_hud\(root: Control\) -> Dictionary:.*?)\n\n\nstatic func build_boss_panel', builder_content, re.DOTALL)
boss_match = re.search(r'(static func build_boss_panel\(root: Control\) -> Dictionary:.*?)\n\n\nstatic func build_level_screen', builder_content, re.DOTALL)

hud_code = hud_match.group(1)
boss_code = boss_match.group(1)

builder_content = builder_content.replace(hud_code, 'static func build_hud(root: Control) -> Dictionary:\n\treturn UI_SCREENS.build_hud(root)')
builder_content = builder_content.replace(boss_code, 'static func build_boss_panel(root: Control) -> Dictionary:\n\treturn UI_SCREENS.build_boss_panel(root)')

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(builder_content)

with open('scripts/ui_screens.gd', 'r') as f:
    screens_content = f.read()

screens_content = screens_content.replace('static func build_level_screen', hud_code + '\n\n\n' + boss_code + '\n\n\nstatic func build_level_screen')

with open('scripts/ui_screens.gd', 'w') as f:
    f.write(screens_content)
