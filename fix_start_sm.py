with open('scripts/game_manager.gd', 'r') as f:
    content = f.read()

content = content.replace('\tvar start_sm: Node = main._save_manager()\n\tif start_sm != null:\n\t\tstart_sm.record_run_start()\n', '', 1)

with open('scripts/game_manager.gd', 'w') as f:
    f.write(content)
