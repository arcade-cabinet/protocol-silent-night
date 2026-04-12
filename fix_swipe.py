import re

with open('scripts/ui_builder.gd', 'r') as f:
    content = f.read()

# Change GridContainer to HBoxContainer
content = content.replace(
    'var classes_box := GridContainer.new()\n\tclasses_box.name = "ClassCards"\n\tclasses_box.columns = 2 if is_mobile else 4\n\n\tclasses_box.add_theme_constant_override("h_separation", 14)\n\tclasses_box.add_theme_constant_override("v_separation", 14)',
    'var classes_box := HBoxContainer.new()\n\tclasses_box.name = "ClassCards"\n\tclasses_box.add_theme_constant_override("separation", 20)'
)

# Ensure horizontal scrolling is prioritized
content = content.replace(
    '\tmid_row.add_child(scroll_container)',
    '\tscroll_container.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO\n\tscroll_container.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED\n\tmid_row.add_child(scroll_container)'
)

# If is_mobile, we want the scroll container to be wide enough to swipe horizontally
content = content.replace(
    'scroll_container.custom_minimum_size = Vector2(320, 260) if is_mobile else Vector2(800, 400)',
    'scroll_container.custom_minimum_size = Vector2(root.get_viewport_rect().size.x * 0.9, 260) if is_mobile else Vector2(800, 400)'
)

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(content)
