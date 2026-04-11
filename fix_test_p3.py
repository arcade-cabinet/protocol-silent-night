with open('test/unit/test_p3_polish.gd', 'r') as f:
    content = f.read()

content = content.replace('found = True', 'found = true')

with open('test/unit/test_p3_polish.gd', 'w') as f:
    f.write(content)
