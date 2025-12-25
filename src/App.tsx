/**
 * Protocol: Silent Night
 * Main Application Component
 */

import { GameScene } from '@/game';
import { 
  HUD, 
  StartScreen, 
  EndScreen, 
  InputControls, 
  BossHUD, 
  MessageOverlay,
  DamageFlash,
  KillStreak,
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

      {/* Screens */}
      <StartScreen />
      <EndScreen />
    </div>
  );
}
