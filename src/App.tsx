/**
 * Protocol: Silent Night
 * Main Application Component
 */

import { GameScene } from '@/game';
import { useGameStore } from '@/store/gameStore';
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
  // Access store to ensure it's loaded before any E2E tests can access it
  // This ensures the store module executes and window.useGameStore is set
  useGameStore.getState();

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
      <LoadingScreen />
    </div>
  );
}
