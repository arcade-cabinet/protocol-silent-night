with open('scripts/ui_manager.gd', 'r') as f:
    content = f.read()

content = content.replace('var start_classes_box: Container', 'var start_classes_box: Container\nvar select_button: Button')

import re
content = re.sub(
    r'var start := UI_BUILDER\.build_start_screen\(root, _on_back_to_title_pressed\)\n\tstart_screen = start\["screen"\]\n\tstart_classes_box = start\["classes_box"\]\n\tradar_canvas = start\["radar_canvas"\]',
    r'var start := UI_BUILDER.build_start_screen(root, _on_back_to_title_pressed)\n\tstart_screen = start["screen"]\n\tstart_classes_box = start["classes_box"]\n\tradar_canvas = start["radar_canvas"]\n\tselect_button = start["select_btn"]',
    content)

with open('scripts/ui_manager.gd', 'w') as f:
    f.write(content)
