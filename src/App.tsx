/**
 * Protocol: Silent Night
 * Main Application Component
 */

import { useGameStore } from '@/store/gameStore';
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

// Explicitly initialize store and expose to window for E2E tests
// This must be done here to ensure it's loaded synchronously with the app bundle
if (typeof window !== 'undefined') {
  (window as unknown as { useGameStore: unknown }).useGameStore = useGameStore;
  // Force initialization of the store
  useGameStore.getState();
}

export default function App() {
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
