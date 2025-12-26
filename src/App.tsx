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
  LoadingScreen,
  MessageOverlay,
  MissionBriefing,
  StartScreen,
  WeaponShop,
} from '@/ui';

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Game Scene */}
      <GameScene />

      {/* UI Layer */}
      <HUD />
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
      <EndScreen />
      <LoadingScreen />
      <WeaponShop />
    </div>
  );
}
