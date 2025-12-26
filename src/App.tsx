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
