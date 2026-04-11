with open('scripts/enemy_director.gd', 'r') as f:
    content = f.read()

content = content.replace("const WORLD_BUILDER := preload(\"res://scripts/world_builder.gd\")", "const WORLD_BUILDER := preload(\"res://scripts/world_builder.gd\")\nconst PRESENT_FACTORY := preload(\"res://scripts/present_factory.gd\")\nvar present_factory: RefCounted = PRESENT_FACTORY.new()")

spawn_logic = """\tvar enemy_node := Node3D.new()
\tenemy_node.name = "Enemy_%s" % enemy_type
\tvar is_present := def.get("render_as", "") == "present"
\tvar visual_root: Node3D
\t
\tif is_present:
\t\tvisual_root = present_factory.build_present(def)
\t\tvisual_root.scale = Vector3.ONE * float(def.get("scale", 1.0)) * 1.5
\t\tenemy_node.add_child(visual_root)
\telse:
\t\tvar mesh_instance: MeshInstance3D = pixels.make_billboard_sprite(enemy_type, 2.0, Color(def["color"]))
\t\tmesh_instance.scale = Vector3.ONE * float(def.get("scale", 1.0))
\t\tvisual_root = mesh_instance
\t\tenemy_node.add_child(mesh_instance)
"""

import re
content = re.sub(r'\tvar enemy_node := Node3D\.new\(\)\n\tenemy_node\.name = "Enemy_%s" % enemy_type\n\tvar mesh_instance: MeshInstance3D = pixels\.make_billboard_sprite\(enemy_type, 2\.0, Color\(def\["color"\]\)\)\n\tenemy_node\.add_child\(mesh_instance\)', spawn_logic, content, flags=re.DOTALL)

shadow_logic = """\tvar shadow := MeshInstance3D.new()
\tshadow.mesh = _enemy_shadow_mesh
\tshadow.position = Vector3(0, 0.05 if is_present else -0.56, 0)
\tshadow.scale = Vector3.ONE * float(def.get("scale", 1.0))
\tshadow.material_override = materials.shadow_material()
\tenemy_node.add_child(shadow)"""

content = re.sub(r'\tvar shadow := MeshInstance3D\.new\(\)\n\tshadow\.mesh = _enemy_shadow_mesh\n\tshadow\.position = Vector3\(0, -0\.56, 0\)\n\tshadow\.material_override = materials\.shadow_material\(\)\n\tenemy_node\.add_child\(shadow\)', shadow_logic, content, flags=re.DOTALL)

with open('scripts/enemy_director.gd', 'w') as f:
    f.write(content)
