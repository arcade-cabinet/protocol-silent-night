with open('scripts/main.gd', 'r') as f:
    content = f.read()

content = content.replace("var start_screen: PanelContainer:\n\tget: return ui_mgr.start_screen", "var title_screen: PanelContainer:\n\tget: return ui_mgr.title_screen\nvar start_screen: PanelContainer:\n\tget: return ui_mgr.start_screen")

with open('scripts/main.gd', 'w') as f:
    f.write(content)
