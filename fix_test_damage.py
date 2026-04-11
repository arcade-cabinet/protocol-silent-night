with open('test/unit/test_player_damage_handler.gd', 'r') as f:
    content = f.read()

content = content.replace('"class": {"contact_damage_reduction": 0.0}', '"class": ClassResource.new()')

with open('test/unit/test_player_damage_handler.gd', 'w') as f:
    f.write(content)
