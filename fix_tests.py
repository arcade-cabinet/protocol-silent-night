
import re

file_path = 'e2e/full-gameplay.spec.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Restore evaluate
content = content.replace(
    ".click()",
    ".evaluate(el => el.click())"
)

with open(file_path, 'w') as f:
    f.write(content)
