with open('scripts/ui_manager.gd', 'r') as f:
    content = f.read()

content = content.replace("func refresh_start_screen(save_manager: Node, on_class_pressed: Callable, present_defs: Dictionary = {}) -> void:\n\ttitle_screen.visible = true\n\tstart_screen.visible = false\n\tif difficulty_panel != null:\n\t\tdifficulty_panel.visible = false", "func refresh_start_screen(save_manager: Node, on_class_pressed: Callable, present_defs: Dictionary = {}) -> void:\n\ttitle_screen.visible = true\n\tstart_screen.visible = false\n\tif select_button != null:\n\t\tselect_button.disabled = true\n\tif difficulty_panel != null:\n\t\tdifficulty_panel.visible = false")

with open('scripts/ui_manager.gd', 'w') as f:
    f.write(content)
