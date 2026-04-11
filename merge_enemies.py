import json

with open('declarations/enemies/enemies.json', 'r') as f:
    enemies = json.load(f)

with open('legacy_presents.json', 'r') as f:
    presents = json.load(f)

for key in ['elf', 'santa', 'bumble']:
    # Keep the enemy-specific stats, but merge in the visual properties from the present factory
    enemy_def = enemies[key]
    present_def = presents[key]
    
    # Overwrite visual properties
    for k, v in present_def.items():
        if k not in ['id', 'unlock', 'max_hp', 'speed', 'name', 'tagline']: # keep enemy names/stats
            enemy_def[k] = v
            
    # Set a flag to tell the enemy director to render this via the present factory
    enemy_def['render_as'] = 'present'

with open('declarations/enemies/enemies.json', 'w') as f:
    json.dump(enemies, f, indent=2)

