with open('scripts/player_controller.gd', 'r') as f:
    content = f.read()

content = content.replace('\t\t\ton_spawn_hit_fx.call(enemy["node"].global_position, Color.WHITE)\n\t\t\ton_spawn_damage_number.call(enemy["node"], aura_damage)', '\t\t\tif on_spawn_hit_fx.is_valid(): on_spawn_hit_fx.call(enemy["node"].global_position, Color.WHITE)\n\t\t\tif on_spawn_damage_number.is_valid(): on_spawn_damage_number.call(enemy["node"], aura_damage)')

content = content.replace('\t\t\ton_spawn_hit_fx.call(boss_ref["node"].global_position, Color.WHITE)\n\t\t\ton_spawn_damage_number.call(boss_ref["node"], aura_damage)', '\t\t\tif on_spawn_hit_fx.is_valid(): on_spawn_hit_fx.call(boss_ref["node"].global_position, Color.WHITE)\n\t\t\tif on_spawn_damage_number.is_valid(): on_spawn_damage_number.call(boss_ref["node"], aura_damage)')

content = content.replace('\t\t\tif boss_ref["hp"] <= 0:\n\t\t\t\ton_boss_killed.call()', '\t\t\tif boss_ref["hp"] <= 0 and on_boss_killed.is_valid():\n\t\t\t\ton_boss_killed.call()')

content = content.replace('\t\t\tif enemy["hp"] <= 0:\n\t\t\t\ton_kill_enemy.call(enemy_index)', '\t\t\tif enemy["hp"] <= 0 and on_kill_enemy.is_valid():\n\t\t\t\ton_kill_enemy.call(enemy_index)')

with open('scripts/player_controller.gd', 'w') as f:
    f.write(content)
