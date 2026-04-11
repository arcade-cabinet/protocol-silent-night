with open('test/unit/test_player_controller.gd', 'r') as f:
    content = f.read()

new_state = """var cls := ClassResource.new()
\tcls.damage = 10.0
\tvar player_state: Dictionary = {"aura_level": 1, "aura_timer": 0.55, "class": cls}"""

content = content.replace('var player_state: Dictionary = {"aura_level": 1, "aura_timer": 0.55}', new_state)

with open('test/unit/test_player_controller.gd', 'w') as f:
    f.write(content)
