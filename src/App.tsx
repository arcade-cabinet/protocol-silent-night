/**
 * Protocol: Silent Night
 * Main Application Component
 */

import { GameScene } from '@/game';
import {
  BossHUD,
  BossVignette,
  DamageFlash,
  EndScreen,
  HUD,
  InputControls,
  KillStreak,
  LevelUpScreen,
  LoadingScreen,
  MessageOverlay,
  MissionBriefing,
  StartScreen,
  WeaponHUD,
} from '@/ui';

export default function App() {
  // In test environments, use a shorter loading duration to avoid blocking E2E tests
  // This prevents timing issues where LoadingScreen blocks button clicks during CI runs
  // Check for E2E test marker or explicitly disable loading screen via env var
  const isE2ETesting = import.meta.env.VITE_E2E_TESTING === 'true' ||
                       (typeof window !== 'undefined' && (window as any).__E2E_TESTING__);
  const loadingDuration = isE2ETesting ? 200 : 500;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Game Scene */}
      <GameScene />

      {/* UI Layer */}
      <HUD />
      <WeaponHUD />
      <BossHUD />
      <MessageOverlay />
      <InputControls />

      {/* Effects */}
      <DamageFlash />
      <KillStreak />
      <BossVignette />

      {/* Screens */}
      <StartScreen />
      <MissionBriefing />
      <LevelUpScreen />
      <EndScreen />
      <LoadingScreen minDuration={loadingDuration} />
    </div>
  );
}
