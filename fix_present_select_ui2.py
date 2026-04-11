with open('scripts/present_select_ui.gd', 'r') as f:
    content = f.read()

new_setup = """\t\tvar accent_hex: String = def.get("bow_color", "#55f7ff")
\t\tTHEME.apply_to_button(button, Color(accent_hex))
\t\tbutton.set_meta("class_id", present_id)
\t\tvar captured_id: String = present_id
\t\tvar captured_def: Dictionary = def
\t\tvar captured_canvas: Control = radar_canvas
\t\tbutton.pressed.connect(
\t\t\tfunc() -> void:
\t\t\t\tif audio_mgr != null: audio_mgr.play_menu_click()
\t\t\t\tif captured_canvas != null: _update_preview(captured_id, captured_def, captured_canvas)
\t\t\t\tfor child in classes_box.get_children():
\t\t\t\t\tif child is Button:
\t\t\t\t\t\tchild.remove_theme_stylebox_override("normal")
\t\t\t\t\t\tTHEME.apply_to_button(child, Color(child.get_meta("accent_hex", "#55f7ff")))
\t\t\t\tbutton.add_theme_stylebox_override("normal", THEME.make_panel_style(Color(accent_hex), Color(0.1, 0.1, 0.1, 0.9)))
\t\t\t\ton_class_pressed.call(button)
\t\t)
\t\tbutton.set_meta("accent_hex", accent_hex)
\t\tif audio_mgr != null:
\t\t\tbutton.mouse_entered.connect(func() -> void: audio_mgr.play_menu_click())
\t\tif radar_canvas != null:
\t\t\tbutton.mouse_entered.connect(
\t\t\t\tfunc() -> void:
\t\t\t\t\t_update_preview(captured_id, captured_def, captured_canvas)
\t\t\t)
\t\tclasses_box.add_child(button)"""

import re
content = re.sub(r'\t\tvar accent_hex: String = def\.get\("bow_color", "#55f7ff"\).*?classes_box\.add_child\(button\)', new_setup, content, flags=re.DOTALL)

with open('scripts/present_select_ui.gd', 'w') as f:
    f.write(content)
