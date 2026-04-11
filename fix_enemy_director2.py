with open('scripts/enemy_director.gd', 'r') as f:
    content = f.read()

content = content.replace('\t\tvisual_root.scale = Vector3.ONE * float(def.get("scale", 1.0)) * 1.5\n', '')
content = content.replace('\t\tmesh_instance.scale = Vector3.ONE * float(def.get("scale", 1.0))\n', '')
content = content.replace('\tshadow.scale = Vector3.ONE * float(def.get("scale", 1.0))\n', '')

with open('scripts/enemy_director.gd', 'w') as f:
    f.write(content)
