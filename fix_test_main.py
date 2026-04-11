with open('test/component/test_main_scene.gd', 'r') as f:
    content = f.read()

content = content.replace('assert_bool(main.start_screen.visible).is_true()', 'assert_bool(main.title_screen.visible).is_true()')

with open('test/component/test_main_scene.gd', 'w') as f:
    f.write(content)
