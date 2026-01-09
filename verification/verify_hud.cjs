const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for loading screen to disappear
    await page.waitForSelector('text=INITIALIZING SYSTEMS', { state: 'detached', timeout: 45000 });

    // Wait for the character selection screen
    await page.waitForSelector('text=Protocol: SILENT NIGHT', { state: 'visible', timeout: 30000 });

    // Select Santa (Tank Class)
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible' });
    await santaButton.click();

    // Wait for Mission Briefing
    await page.waitForSelector('text=MISSION BRIEFING', { state: 'visible', timeout: 15000 });

    // Click Commence Operation
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible' });
    // Small delay for typing animation to finish or at least button to be interactive
    await page.waitForTimeout(2000);
    await commenceButton.click();

    // Wait for HUD to appear
    await page.waitForSelector('text=OPERATOR STATUS', { state: 'visible', timeout: 30000 });

    // Take a screenshot of the initial gameplay state
    // We want to verify the HUD shows "HP: 300 / 300"
    await page.screenshot({ path: 'verification/gameplay_hud.png', fullPage: true });

    console.log('Screenshot taken: verification/gameplay_hud.png');

  } catch (error) {
    console.error('Error during verification:', error);
    await page.screenshot({ path: 'verification/error_state.png' });
  } finally {
    await browser.close();
  }
})();
