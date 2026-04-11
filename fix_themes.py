with open('scripts/ui_screens.gd', 'r') as f:
    content = f.read()
if "const THEME" not in content:
    content = content.replace("extends RefCounted\n\n", "extends RefCounted\n\nconst THEME := preload(\"res://scripts/holidaypunk_theme.gd\")\n\n")
    with open('scripts/ui_screens.gd', 'w') as f:
        f.write(content)

with open('scripts/ui_overlays.gd', 'r') as f:
    content = f.read()
if "const THEME" not in content:
    content = content.replace("extends RefCounted\n\n", "extends RefCounted\n\nconst THEME := preload(\"res://scripts/holidaypunk_theme.gd\")\n\n")
    with open('scripts/ui_overlays.gd', 'w') as f:
        f.write(content)
