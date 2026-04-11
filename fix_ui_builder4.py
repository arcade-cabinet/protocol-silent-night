with open('scripts/ui_builder.gd', 'r') as f:
    content = f.read()

content = content.replace('return {"screen": start_screen, "classes_box": classes_box, "radar_canvas": radar_canvas}', 'return {"screen": start_screen, "classes_box": classes_box, "radar_canvas": radar_canvas, "select_btn": select_btn}')

with open('scripts/ui_builder.gd', 'w') as f:
    f.write(content)
