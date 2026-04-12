import re

with open('scripts/present_select_ui.gd', 'r') as f:
    content = f.read()

card_logic = """\t\tvar unlocked := is_present_unlocked(def, best_wave, save_manager)
\t\tvar label: String = "%s\\n\\n" % def.get("name", present_id)
\t\tif unlocked:
\t\t\tlabel += def.get("tagline", "")
\t\telse:
\t\t\tlabel += "[ LOCKED ]\\n%s" % unlock_label(def.get("unlock", ""))
\t\tbutton.text = label
\t\tbutton.custom_minimum_size = Vector2(240, 320)
\t\tbutton.clip_text = true
\t\tbutton.add_theme_font_size_override("font_size", 14)
\t\tvar accent_hex: String = def.get("bow_color", "#55f7ff") if unlocked else "#404040"
\t\tTHEME.apply_to_button(button, Color(accent_hex))
\t\tbutton.set_meta("class_id", present_id)
\t\tbutton.set_meta("unlocked", unlocked)"""

# Find the start of the button creation logic inside the loop
start_index = content.find('\t\tvar unlocked := is_present_unlocked(def, best_wave, save_manager)')
end_index = content.find('\t\tvar captured_id: String = present_id')

content = content[:start_index] + card_logic + '\n' + content[end_index:]

# Also fix the fallback selection to grab_focus on the first UNLOCKED item if there's no last_id
fallback_logic = """\t# Pre-select the last-used present so gamepad/keyboard nav starts there.
\tvar last_id: String = ""
\tif save_manager != null:
\t\tlast_id = String(save_manager.get_preference("last_present", ""))
\t
\tvar selected_node = null
\tif not last_id.is_empty():
\t\tfor child in classes_box.get_children():
\t\t\tif child is Button and String(child.get_meta("class_id", "")) == last_id and child.get_meta("unlocked", false):
\t\t\t\tselected_node = child
\t\t\t\tbreak
\tif selected_node == null:
\t\tfor child in classes_box.get_children():
\t\t\tif child is Button and child.get_meta("unlocked", false):
\t\t\t\tselected_node = child
\t\t\t\tbreak
\t
\tif selected_node != null:
\t\tselected_node.grab_focus()
\t\tif radar_canvas != null:
\t\t\tvar sid: String = selected_node.get_meta("class_id", "")
\t\t\t_update_preview(sid, present_defs.get(sid, {}), radar_canvas)"""

content = re.sub(r'\t# Pre-select the last-used present.*?break', fallback_logic, content, flags=re.DOTALL)

with open('scripts/present_select_ui.gd', 'w') as f:
    f.write(content)
