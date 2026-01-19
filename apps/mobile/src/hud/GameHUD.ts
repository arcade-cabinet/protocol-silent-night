/**
 * GameHUD - BabylonJS GUI-based HUD system
 *
 * Replaces React Native overlay HUD with native BabylonJS GUI for:
 * - Better performance (no React reconciliation)
 * - No z-index conflicts with 3D scene
 * - Consistent touch event handling
 * - GPU-accelerated rendering
 */

import {
  AdvancedDynamicTexture,
  Rectangle,
  TextBlock,
  Image,
  Control,
  StackPanel,
  Grid,
} from '@babylonjs/gui';
import type { Scene } from '@babylonjs/core';
import { babylon as babylonColors, colors, typography, spacing, game } from '@protocol-silent-night/design-system';

export interface HUDState {
  hp: number;
  maxHp: number;
  score: number;
  kills: number;
  phase: 'PHASE_1' | 'PHASE_BOSS' | 'VICTORY' | 'GAME_OVER';
  waveNumber?: number;
  bossHp?: number;
  bossMaxHp?: number;
}

export interface GameHUDController {
  update: (state: HUDState) => void;
  showDamageFlash: () => void;
  showKillIndicator: (points: number) => void;
  showPhaseTransition: (phase: string) => void;
  dispose: () => void;
}

/**
 * Creates the BabylonJS GUI-based HUD
 */
export function createGameHUD(scene: Scene): GameHUDController {
  // Create fullscreen UI
  const ui = AdvancedDynamicTexture.CreateFullscreenUI('GameHUD', true, scene);

  // === Health Bar ===
  const healthContainer = new Rectangle('healthContainer');
  healthContainer.width = '220px';
  healthContainer.height = '30px';
  healthContainer.cornerRadius = 15;
  healthContainer.color = `#${babylonColors.primary}`;
  healthContainer.thickness = 2;
  healthContainer.background = `#${babylonColors.backgroundAlpha}`;
  healthContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  healthContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  healthContainer.left = spacing.md;
  healthContainer.top = spacing.md + 30; // Account for safe area
  ui.addControl(healthContainer);

  const healthFill = new Rectangle('healthFill');
  healthFill.width = '200px';
  healthFill.height = '20px';
  healthFill.cornerRadius = 10;
  healthFill.color = 'transparent';
  healthFill.background = `#${babylonColors.primary}`;
  healthFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  healthFill.left = '5px';
  healthContainer.addControl(healthFill);

  const healthText = new TextBlock('healthText');
  healthText.text = '100/100';
  healthText.color = `#${babylonColors.white}`;
  healthText.fontSize = typography.fontSize.sm;
  healthText.fontWeight = 'bold';
  healthContainer.addControl(healthText);

  // === Score Display ===
  const scoreContainer = new Rectangle('scoreContainer');
  scoreContainer.width = '150px';
  scoreContainer.height = '40px';
  scoreContainer.cornerRadius = 8;
  scoreContainer.color = `#${babylonColors.primary}`;
  scoreContainer.thickness = 1;
  scoreContainer.background = `#${babylonColors.backgroundAlpha}`;
  scoreContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  scoreContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  scoreContainer.left = -spacing.md;
  scoreContainer.top = spacing.md + 30;
  ui.addControl(scoreContainer);

  const scoreLabel = new TextBlock('scoreLabel');
  scoreLabel.text = 'SCORE';
  scoreLabel.color = `#${babylonColors.primary}`;
  scoreLabel.fontSize = typography.fontSize.xs;
  scoreLabel.fontWeight = 'bold';
  scoreLabel.top = -8;
  scoreContainer.addControl(scoreLabel);

  const scoreValue = new TextBlock('scoreValue');
  scoreValue.text = '0';
  scoreValue.color = `#${babylonColors.white}`;
  scoreValue.fontSize = typography.fontSize.lg;
  scoreValue.fontWeight = 'bold';
  scoreValue.top = 8;
  scoreContainer.addControl(scoreValue);

  // === Kill Counter ===
  const killsContainer = new Rectangle('killsContainer');
  killsContainer.width = '80px';
  killsContainer.height = '40px';
  killsContainer.cornerRadius = 8;
  killsContainer.color = `#${babylonColors.danger}`;
  killsContainer.thickness = 1;
  killsContainer.background = `#${babylonColors.backgroundAlpha}`;
  killsContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  killsContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  killsContainer.left = -spacing.md - 160;
  killsContainer.top = spacing.md + 30;
  ui.addControl(killsContainer);

  const killsLabel = new TextBlock('killsLabel');
  killsLabel.text = 'KILLS';
  killsLabel.color = `#${babylonColors.danger}`;
  killsLabel.fontSize = typography.fontSize.xs;
  killsLabel.fontWeight = 'bold';
  killsLabel.top = -8;
  killsContainer.addControl(killsLabel);

  const killsValue = new TextBlock('killsValue');
  killsValue.text = '0';
  killsValue.color = `#${babylonColors.white}`;
  killsValue.fontSize = typography.fontSize.lg;
  killsValue.fontWeight = 'bold';
  killsValue.top = 8;
  killsContainer.addControl(killsValue);

  // === Wave/Phase Indicator ===
  const phaseIndicator = new TextBlock('phaseIndicator');
  phaseIndicator.text = 'WAVE 1';
  phaseIndicator.color = `#${babylonColors.primary}`;
  phaseIndicator.fontSize = typography.fontSize.md;
  phaseIndicator.fontWeight = 'bold';
  phaseIndicator.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  phaseIndicator.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  phaseIndicator.top = spacing.md + 30;
  ui.addControl(phaseIndicator);

  // === Boss Health Bar (hidden by default) ===
  const bossContainer = new Rectangle('bossContainer');
  bossContainer.width = '400px';
  bossContainer.height = '30px';
  bossContainer.cornerRadius = 15;
  bossContainer.color = `#${babylonColors.danger}`;
  bossContainer.thickness = 2;
  bossContainer.background = `#${babylonColors.backgroundAlpha}`;
  bossContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  bossContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
  bossContainer.top = -spacing.lg - 80;
  bossContainer.isVisible = false;
  ui.addControl(bossContainer);

  const bossLabel = new TextBlock('bossLabel');
  bossLabel.text = '❄️ FROST BOSS';
  bossLabel.color = `#${babylonColors.danger}`;
  bossLabel.fontSize = typography.fontSize.sm;
  bossLabel.fontWeight = 'bold';
  bossLabel.top = -20;
  bossContainer.addControl(bossLabel);

  const bossFill = new Rectangle('bossFill');
  bossFill.width = '380px';
  bossFill.height = '20px';
  bossFill.cornerRadius = 10;
  bossFill.color = 'transparent';
  bossFill.background = `#${babylonColors.danger}`;
  bossFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
  bossFill.left = '5px';
  bossContainer.addControl(bossFill);

  // === Damage Flash Overlay ===
  const damageFlash = new Rectangle('damageFlash');
  damageFlash.width = '100%';
  damageFlash.height = '100%';
  damageFlash.background = `#${babylonColors.danger}`;
  damageFlash.alpha = 0;
  damageFlash.isPointerBlocker = false;
  ui.addControl(damageFlash);

  // === Kill Indicator (floating text) ===
  const killIndicator = new TextBlock('killIndicator');
  killIndicator.text = '+100';
  killIndicator.color = `#${babylonColors.primary}`;
  killIndicator.fontSize = typography.fontSize.xl;
  killIndicator.fontWeight = 'bold';
  killIndicator.alpha = 0;
  killIndicator.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  killIndicator.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  ui.addControl(killIndicator);

  // === Phase Transition Overlay ===
  const phaseOverlay = new Rectangle('phaseOverlay');
  phaseOverlay.width = '100%';
  phaseOverlay.height = '100%';
  phaseOverlay.background = `#${babylonColors.background}`;
  phaseOverlay.alpha = 0;
  phaseOverlay.isPointerBlocker = false;
  ui.addControl(phaseOverlay);

  const phaseText = new TextBlock('phaseText');
  phaseText.text = '';
  phaseText.color = `#${babylonColors.primary}`;
  phaseText.fontSize = typography.fontSize['3xl'];
  phaseText.fontWeight = 'bold';
  phaseText.alpha = 0;
  phaseText.outlineWidth = 2;
  phaseText.outlineColor = `#${babylonColors.background}`;
  phaseOverlay.addControl(phaseText);

  // Animation helpers
  let damageFlashTimeout: ReturnType<typeof setTimeout> | null = null;
  let killIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;
  let phaseTransitionTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    update(state: HUDState) {
      // Update health bar
      const healthPercent = Math.max(0, Math.min(1, state.hp / state.maxHp));
      healthFill.width = `${Math.round(healthPercent * 200)}px`;
      healthText.text = `${Math.round(state.hp)}/${state.maxHp}`;

      // Color health bar based on HP level
      if (healthPercent > 0.5) {
        healthFill.background = `#${babylonColors.primary}`;
      } else if (healthPercent > 0.25) {
        healthFill.background = `#${babylonColors.warning}`;
      } else {
        healthFill.background = `#${babylonColors.danger}`;
      }

      // Update score
      scoreValue.text = state.score.toLocaleString();

      // Update kills
      killsValue.text = state.kills.toString();

      // Update phase indicator
      if (state.phase === 'PHASE_1') {
        phaseIndicator.text = `WAVE ${state.waveNumber ?? 1}`;
        bossContainer.isVisible = false;
      } else if (state.phase === 'PHASE_BOSS') {
        phaseIndicator.text = 'BOSS FIGHT';
        bossContainer.isVisible = true;

        if (state.bossHp !== undefined && state.bossMaxHp !== undefined) {
          const bossPercent = Math.max(0, Math.min(1, state.bossHp / state.bossMaxHp));
          bossFill.width = `${Math.round(bossPercent * 380)}px`;
        }
      } else if (state.phase === 'VICTORY') {
        phaseIndicator.text = 'VICTORY!';
        bossContainer.isVisible = false;
      } else if (state.phase === 'GAME_OVER') {
        phaseIndicator.text = 'GAME OVER';
        bossContainer.isVisible = false;
      }
    },

    showDamageFlash() {
      if (damageFlashTimeout) {
        clearTimeout(damageFlashTimeout);
      }

      damageFlash.alpha = 0.3;
      damageFlashTimeout = setTimeout(() => {
        damageFlash.alpha = 0;
      }, 100);
    },

    showKillIndicator(points: number) {
      if (killIndicatorTimeout) {
        clearTimeout(killIndicatorTimeout);
      }

      killIndicator.text = `+${points}`;
      killIndicator.alpha = 1;
      killIndicator.top = 0;

      // Animate up and fade
      let elapsed = 0;
      const animate = () => {
        elapsed += 16;
        killIndicator.top = -elapsed * 0.5;
        killIndicator.alpha = Math.max(0, 1 - elapsed / 500);

        if (elapsed < 500) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    },

    showPhaseTransition(phase: string) {
      if (phaseTransitionTimeout) {
        clearTimeout(phaseTransitionTimeout);
      }

      phaseText.text = phase;
      phaseOverlay.alpha = 0.8;
      phaseText.alpha = 1;

      phaseTransitionTimeout = setTimeout(() => {
        phaseOverlay.alpha = 0;
        phaseText.alpha = 0;
      }, 2000);
    },

    dispose() {
      if (damageFlashTimeout) clearTimeout(damageFlashTimeout);
      if (killIndicatorTimeout) clearTimeout(killIndicatorTimeout);
      if (phaseTransitionTimeout) clearTimeout(phaseTransitionTimeout);
      ui.dispose();
    },
  };
}
