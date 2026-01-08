#!/bin/bash
# Script to update E2E test files with new patterns

# Update files to use test utilities
for file in e2e/component-snapshots.spec.ts e2e/full-gameplay.spec.ts e2e/ui-refinement.spec.ts; do
  if [ -f "$file" ]; then
    # Replace Santa button pattern with startGame utility
    sed -i -E 's/await page\.waitForTimeout\(3000\);(\s+)const santaButton = page\.getByRole\('"'"'button'"'"', \{ name: \/MECHA-SANTA\/ \}\);(\s+)await santaButton\.click\(\{ force: true, noWaitAfter: true \}\);(\s+)\/\/ Click "COMMENCE OPERATION"[^\n]*(\s+)\/\/ Wait for briefing[^\n]*(\s+)await page\.waitForTimeout\(5000\);(\s+)await page\.getByRole\('"'"'button'"'"', \{ name: \/COMMENCE OPERATION\/i \}\)\.waitFor\(\{ state: '"'"'visible'"'"', timeout: 10000 \}\);(\s+)await page\.getByRole\('"'"'button'"'"', \{ name: \/COMMENCE OPERATION\/i \}\)\.click\(\{ force: true, noWaitAfter: true \}\);/await waitForStablePage(page);\nawait startGame(page, '"'"'MECHA-SANTA'"'"');/g' "$file"

    echo "Updated $file"
  fi
done
