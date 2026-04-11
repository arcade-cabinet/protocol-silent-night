import re

with open('scripts/ui_manager.gd', 'r') as f:
    content = f.read()

content = content.replace("var hud_root: Container", "var title_screen: PanelContainer\nvar hud_root: Container")

new_build_ui = """\tvar title := UI_BUILDER.build_title_screen(root, _on_play_pressed)
\ttitle_screen = title[\"screen\"]

\tvar start := UI_BUILDER.build_start_screen(root, _on_back_to_title_pressed)
\tstart_screen = start[\"screen\"]"""

content = content.replace("\tvar start := UI_BUILDER.build_start_screen(root)\n\tstart_screen = start[\"screen\"]", new_build_ui)

with open('scripts/ui_manager.gd', 'w') as f:
    f.write(content)
