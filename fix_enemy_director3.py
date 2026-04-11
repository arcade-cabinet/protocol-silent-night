with open('scripts/enemy_director.gd', 'r') as f:
    content = f.read()

content = content.replace('var is_present := def.get("render_as", "") == "present"', 'var is_present: bool = def.get("render_as", "") == "present"')

top_add = """const EnemyBehaviors := preload("res://scripts/enemy_behaviors.gd")
const PRESENT_FACTORY := preload("res://scripts/present_factory.gd")
var present_factory: RefCounted = PRESENT_FACTORY.new()"""

content = content.replace('const EnemyBehaviors := preload("res://scripts/enemy_behaviors.gd")', top_add)

with open('scripts/enemy_director.gd', 'w') as f:
    f.write(content)
