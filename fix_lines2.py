import re

with open('scripts/ui_screens.gd', 'r') as f:
    screens_content = f.read()

end_match = re.search(r'(static func build_end_screen\(root: Control, on_menu_return: Callable\) -> Dictionary:.*?)\n\n\nstatic func build_overlays_and_controls', screens_content, re.DOTALL)
overlays_match = re.search(r'(static func build_overlays_and_controls\(root: Control, on_dash_down: Callable, on_dash_up: Callable\) -> Dictionary:.*)', screens_content, re.DOTALL)

end_code = end_match.group(1)
overlays_code = overlays_match.group(1)

screens_content = screens_content.replace(end_code + '\n\n\n', '')
screens_content = screens_content.replace(overlays_code, '')

with open('scripts/ui_screens.gd', 'w') as f:
    f.write(screens_content)

new_file = "extends RefCounted\n\n" + end_code + "\n\n\n" + overlays_code
with open('scripts/ui_overlays.gd', 'w') as f:
    f.write(new_file)

with open('scripts/ui_builder.gd', 'r') as f:
    builder_content = f.read()

builder_content = builder_content.replace('UI_SCREENS.build_end_screen', 'UI_OVERLAYS.build_end_screen')
builder_content = builder_content.replace('UI_SCREENS.build_overlays_and_controls', 'UI_OVERLAYS.build_overlays_and_controls')
builder_content = builder_content.replace('const UI_SCREENS := preload("res://scripts/ui_screens.gd")', 'const UI_SCREENS := preload("res://scripts/ui_screens.gd")\nconst UI_OVERLAYS := preload("res://scripts/ui_overlays.gd")')

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(builder_content)
