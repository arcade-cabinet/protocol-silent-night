with open('scripts/present_select_ui.gd', 'r') as f:
    content = f.read()

new_pressed = """\t\tbutton.pressed.connect(
\t\t\tfunc() -> void:
\t\t\t\tif audio_mgr != null: audio_mgr.play_menu_click()
\t\t\t\t_update_preview(captured_id, captured_def, captured_canvas)
\t\t\t\tfor child in classes_box.get_children():
\t\t\t\t\tif child is Button:
\t\t\t\t\t\tchild.remove_theme_stylebox_override("normal")
\t\t\t\tbutton.add_theme_stylebox_override("normal", THEME.make_panel_style(Color(accent_hex), Color(0.1, 0.1, 0.1, 0.9)))
\t\t\t\ton_class_pressed.call(button)
\t\t)
"""

import re
content = re.sub(r'\t\tbutton.pressed.connect\(\n\t\t\tfunc\(\) -> void:\n\t\t\t\tif audio_mgr != null: audio_mgr.play_menu_click\(\)\n\t\t\t\ton_class_pressed.call\(button\)\n\t\t\)', new_pressed, content)

with open('scripts/present_select_ui.gd', 'w') as f:
    f.write(content)
