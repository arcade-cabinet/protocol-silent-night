
import re

file_path = 'e2e/full-gameplay.spec.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Replace COMMENCE OPERATION evaluate with wait + evaluate
content = content.replace(
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).evaluate(el => el.click());",
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).waitFor({ state: 'visible', timeout: 30000 });\n    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).evaluate(el => el.click());"
)

with open(file_path, 'w') as f:
    f.write(content)
