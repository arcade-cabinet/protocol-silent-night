
import re

file_path = 'e2e/full-gameplay.spec.ts'

with open(file_path, 'r') as f:
    content = f.read()

# Revert to evaluate for MECHA-SANTA
content = content.replace(
    "await page.getByRole('button', { name: /MECHA-SANTA/ }).click({ force: true, noWaitAfter: true });",
    "await page.getByRole('button', { name: /MECHA-SANTA/ }).evaluate(el => el.click());"
)

# Revert to evaluate for CYBER-ELF
content = content.replace(
    "await page.getByRole('button', { name: /CYBER-ELF/ }).click({ force: true, noWaitAfter: true });",
    "await page.getByRole('button', { name: /CYBER-ELF/ }).evaluate(el => el.click());"
)

# Revert to evaluate for BUMBLE
content = content.replace(
    "await page.getByRole('button', { name: /BUMBLE/ }).click({ force: true, noWaitAfter: true });",
    "await page.getByRole('button', { name: /BUMBLE/ }).evaluate(el => el.click());"
)

# Keep COMMENCE OPERATION with click({force: true}) but ensure we wait for it first?
# Or use evaluate there too?
# Previous error with evaluate on COMMENCE OPERATION was "Timeout waiting for button".
# But now I added wait for visible.
# So I can use evaluate there too.

content = content.replace(
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ force: true, noWaitAfter: true });",
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).evaluate(el => el.click());"
)
content = content.replace(
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ force: true });",
    "await page.getByRole('button', { name: /COMMENCE OPERATION/i }).evaluate(el => el.click());"
)

with open(file_path, 'w') as f:
    f.write(content)
