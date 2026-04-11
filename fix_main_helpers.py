with open('scripts/main_helpers.gd', 'r') as f:
    content = f.read()

new_on_class_pressed = """static func on_class_button_pressed(main: Node, button: Button) -> void:
\tmain.current_class_id = String(button.get_meta("class_id", ""))
\tvar ui: RefCounted = main.ui_mgr
\tif ui.select_button != null:
\t\tui.select_button.disabled = false
\t\t# Remove all existing pressed connections to avoid multiple calls
\t\tvar connections = ui.select_button.pressed.get_connections()
\t\tfor c in connections:
\t\t\tui.select_button.pressed.disconnect(c.callable)
\t\tui.select_button.pressed.connect(func() -> void: on_character_selected(main))
"""

new_on_character_selected = """static func on_character_selected(main: Node) -> void:
\tif main.ui_mgr.difficulty_panel != null:
\t\tmain.ui_mgr.start_screen.visible = false
\t\tmain.ui_mgr.difficulty_panel.visible = true
\telse:
\t\tvar sm: Node = main._save_manager()
\t\tif sm != null:
\t\t\tsm.set_preference("last_present", main.current_class_id)
\t\tmain.start_run(main.current_class_id)
"""

import re
content = re.sub(r'static func on_class_button_pressed\(main: Node, button: Button\) -> void:.*?(?=\n\nstatic func on_difficulty_selected)', new_on_class_pressed + "\n\n" + new_on_character_selected, content, flags=re.DOTALL)

with open('scripts/main_helpers.gd', 'w') as f:
    f.write(content)
