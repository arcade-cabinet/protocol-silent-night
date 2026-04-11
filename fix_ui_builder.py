with open('scripts/ui_builder.gd', 'r') as f:
    content = f.read()

title_screen = """static func build_title_screen(root: Control, on_play: Callable) -> Dictionary:
\tvar screen := PanelContainer.new()
\tscreen.name = "TitleScreen"
\tscreen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
\tscreen.add_theme_stylebox_override("panel", THEME.make_panel_style(THEME.NEON_CYAN, Color(0.02, 0.04, 0.06, 0.94)))
\troot.add_child(screen)

\tvar margin := MarginContainer.new()
\tmargin.add_theme_constant_override("margin_left", 60)
\tmargin.add_theme_constant_override("margin_top", 100)
\tmargin.add_theme_constant_override("margin_right", 60)
\tmargin.add_theme_constant_override("margin_bottom", 100)
\tscreen.add_child(margin)

\tvar vbox := VBoxContainer.new()
\tvbox.alignment = BoxContainer.ALIGNMENT_CENTER
\tvbox.add_theme_constant_override("separation", 32)
\tmargin.add_child(vbox)

\tvar title := Label.new()
\ttitle.text = "PROTOCOL: SILENT NIGHT"
\ttitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
\ttitle.add_theme_font_size_override("font_size", 64)
\ttitle.add_theme_color_override("font_color", THEME.NEON_WHITE)
\ttitle.add_theme_color_override("font_outline_color", THEME.NEON_CYAN)
\ttitle.add_theme_constant_override("outline_size", 8)
\tvbox.add_child(title)

\tvar subtitle := Label.new()
\tsubtitle.text = "// ENDLESS VIGIL //"
\tsubtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
\tsubtitle.add_theme_font_size_override("font_size", 24)
\tsubtitle.add_theme_color_override("font_color", THEME.NEON_GOLD)
\tvbox.add_child(subtitle)

\tvar play_btn := Button.new()
\tplay_btn.text = "PLAY"
\tplay_btn.custom_minimum_size = Vector2(240, 80)
\tplay_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
\tplay_btn.add_theme_font_size_override("font_size", 28)
\tTHEME.apply_to_button(play_btn, THEME.NEON_CYAN)
\tplay_btn.pressed.connect(on_play)
\tvbox.add_child(play_btn)

\treturn {"screen": screen}


static func build_start_screen(root: Control, on_back: Callable) -> Dictionary:
"""

content = content.replace("static func build_start_screen(root: Control) -> Dictionary:\n", title_screen)

# Let's add the back button to start_screen
back_btn = """
\tvar back_btn := Button.new()
\tback_btn.text = "< BACK"
\tback_btn.custom_minimum_size = Vector2(160, 50)
\tback_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
\tback_btn.add_theme_font_size_override("font_size", 18)
\tTHEME.apply_to_button(back_btn, THEME.NEON_CYAN)
\tback_btn.pressed.connect(on_back)
\tstart_vbox.add_child(back_btn)

\treturn {"screen": start_screen, "classes_box": classes_box, "radar_canvas": radar_canvas}"""

import re
content = re.sub(r'\treturn \{"screen": start_screen, "classes_box": classes_box, "radar_canvas": radar_canvas\}', back_btn, content)

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(content)
