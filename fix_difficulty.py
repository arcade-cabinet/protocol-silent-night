with open('scripts/difficulty_select.gd', 'r') as f:
    content = f.read()

back_btn = """
\tvar back_btn := Button.new()
\tback_btn.text = "< BACK"
\tback_btn.custom_minimum_size = Vector2(160, 50)
\tback_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
\tback_btn.add_theme_font_size_override("font_size", 18)
\tTHEME.apply_to_button(back_btn, THEME.NEON_CYAN)
\tback_btn.pressed.connect(func() -> void:
\t\tpanel.visible = false
\t\tvar root_node = panel.get_parent()
\t\tfor child in root_node.get_children():
\t\t\tif child.name == "StartScreen":
\t\t\t\tchild.visible = true
\t)
\tvbox.add_child(back_btn)

\treturn {"panel": panel, "perma_check": perma_check}
"""

content = content.replace('\treturn {"panel": panel, "perma_check": perma_check}', back_btn)

with open('scripts/difficulty_select.gd', 'w') as f:
    f.write(content)
