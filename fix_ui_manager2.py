with open('scripts/ui_manager.gd', 'r') as f:
    content = f.read()

funcs = """
func _on_play_pressed() -> void:
\ttitle_screen.visible = false
\tstart_screen.visible = true

func _on_back_to_title_pressed() -> void:
\tstart_screen.visible = false
\ttitle_screen.visible = true

func refresh_start_screen(save_manager: Node, on_class_pressed: Callable, present_defs: Dictionary = {}) -> void:
\ttitle_screen.visible = true
\tstart_screen.visible = false
\tif difficulty_panel != null:
\t\tdifficulty_panel.visible = false
\tfor child in start_classes_box.get_children():
\t\tchild.queue_free()
\tif not present_defs.is_empty():
\t\t_build_present_buttons(present_defs, save_manager, on_class_pressed)
"""

import re
content = re.sub(r'func refresh_start_screen.*?_build_present_buttons\(present_defs, save_manager, on_class_pressed\)', funcs, content, flags=re.DOTALL)

with open('scripts/ui_manager.gd', 'w') as f:
    f.write(content)
