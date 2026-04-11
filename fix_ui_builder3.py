with open('scripts/ui_builder.gd', 'r') as f:
    content = f.read()

new_mid_row = """
\tvar mid_row := HBoxContainer.new()
\tmid_row.alignment = BoxContainer.ALIGNMENT_CENTER
\tmid_row.add_theme_constant_override("separation", 40)
\tstart_vbox.add_child(mid_row)

\tvar scroll_container := ScrollContainer.new()
\tscroll_container.custom_minimum_size = Vector2(800, 400) if DisplayServer.screen_get_size().x >= 800 else Vector2(300, 300)
\tmid_row.add_child(scroll_container)

\tvar classes_box := GridContainer.new()
\tclasses_box.name = "ClassCards"
\tvar screen_w := DisplayServer.screen_get_size().x
\tclasses_box.columns = 4 if screen_w >= 800 else 2
\tclasses_box.add_theme_constant_override("h_separation", 14)
\tclasses_box.add_theme_constant_override("v_separation", 14)
\tscroll_container.add_child(classes_box)

\tvar details_vbox := VBoxContainer.new()
\tdetails_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
\tdetails_vbox.add_theme_constant_override("separation", 20)
\tmid_row.add_child(details_vbox)

\tvar radar_canvas := RADAR_CHART.build(details_vbox, Vector2(240, 240))

\tvar select_btn := Button.new()
\tselect_btn.text = "SELECT"
\tselect_btn.name = "SelectButton"
\tselect_btn.custom_minimum_size = Vector2(240, 60)
\tselect_btn.add_theme_font_size_override("font_size", 24)
\tselect_btn.disabled = true
\tTHEME.apply_to_button(select_btn, THEME.NEON_CYAN)
\tdetails_vbox.add_child(select_btn)
"""

import re
content = re.sub(r'\tvar mid_row.*?radar_canvas := RADAR_CHART\.build\(mid_row, Vector2\(220, 220\)\)', new_mid_row, content, flags=re.DOTALL)

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(content)
