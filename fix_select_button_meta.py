with open('scripts/main_helpers.gd', 'r') as f:
    content = f.read()

content = content.replace('\tmain.current_class_id = String(button.get_meta("class_id", ""))\n\tvar ui: RefCounted = main.ui_mgr\n\tif ui.select_button != null:\n\t\tui.select_button.disabled = false', '\tmain.current_class_id = String(button.get_meta("class_id", ""))\n\tvar is_unlocked: bool = button.get_meta("unlocked", false)\n\tvar ui: RefCounted = main.ui_mgr\n\tif ui.select_button != null:\n\t\tui.select_button.disabled = not is_unlocked\n\t\tui.select_button.text = "SELECT" if is_unlocked else "LOCKED"')

with open('scripts/main_helpers.gd', 'w') as f:
    f.write(content)
