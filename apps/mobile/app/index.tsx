/**
 * Main Menu Screen - Game entry point with modal-based flow
 *
 * Flow:
 * 1. Main menu displays
 * 2. "START MISSION" → Character select modal
 * 3. Character selected → Mission briefing (full screen)
 * 4. Briefing complete → Request full screen → Game starts
 *
 * No page navigation - everything happens through overlays
 */

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { CharacterSelectModal } from '../components/CharacterSelectModal';
import { MissionBriefing } from '../components/MissionBriefing';
import { GameScene } from '../components/GameScene';
import { colors, typography, spacing, borderRadius } from '@protocol-silent-night/design-system';

type GamePhase = 'menu' | 'character-select' | 'briefing' | 'playing';

export default function MenuScreen() {
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  /**
   * Open character selection modal
   */
  const handleStartGame = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('character-select');
  }, []);

  /**
   * Handle character selection
   */
  const handleSelectCharacter = useCallback(async (classType: string) => {
    setSelectedClass(classType);
    setPhase('briefing');
  }, []);

  /**
   * Close character selection modal
   */
  const handleCloseCharacterSelect = useCallback(() => {
    setPhase('menu');
  }, []);

  /**
   * Mission briefing complete - start game
   */
  const handleBriefingComplete = useCallback(async () => {
    // Lock to landscape for gameplay
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    setPhase('playing');
  }, []);

  /**
   * Skip mission briefing
   */
  const handleSkipBriefing = useCallback(async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
    setPhase('playing');
  }, []);

  /**
   * Game over - return to menu
   */
  const handleGameOver = useCallback(async () => {
    await ScreenOrientation.unlockAsync();
    setSelectedClass(null);
    setPhase('menu');
  }, []);

  /**
   * Victory - return to menu
   */
  const handleWin = useCallback(async () => {
    await ScreenOrientation.unlockAsync();
    setSelectedClass(null);
    setPhase('menu');
  }, []);

  /**
   * Navigate to workshop (placeholder)
   */
  const handleWorkshop = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement workshop modal
  }, []);

  /**
   * Open settings (placeholder)
   */
  const handleSettings = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement settings modal
  }, []);

  // Game is playing - render full screen game
  if (phase === 'playing' && selectedClass) {
    return (
      <View style={styles.gameContainer}>
        <StatusBar hidden />
        <GameScene
          classType={selectedClass as 'santa' | 'elf' | 'bumble'}
          onGameOver={handleGameOver}
          onWin={handleWin}
        />
      </View>
    );
  }

  // Mission briefing - full screen overlay
  if (phase === 'briefing' && selectedClass) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <MissionBriefing
          classType={selectedClass}
          onComplete={handleBriefingComplete}
          onSkip={handleSkipBriefing}
        />
      </View>
    );
  }

  // Main menu with optional character select modal
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.titleContainer}>
        <Text style={styles.protocol}>PROTOCOL:</Text>
        <Text style={styles.title}>SILENT NIGHT</Text>
        <Text style={styles.subtitle}>v1.0 - Mobile Native Edition</Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleStartGame}
          accessibilityLabel="Start Mission"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>START MISSION</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleWorkshop}
          accessibilityLabel="Santa's Workshop"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            SANTA'S WORKSHOP
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            styles.tertiaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSettings}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, styles.tertiaryButtonText]}>
            SETTINGS
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by BabylonJS React Native</Text>
      </View>

      {/* Character Select Modal */}
      <CharacterSelectModal
        visible={phase === 'character-select'}
        onClose={handleCloseCharacterSelect}
        onSelect={handleSelectCharacter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: colors.background.darker,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  protocol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.neon,
    letterSpacing: typography.letterSpacing.wide,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.black,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.normal,
    textShadowColor: colors.primary.neon,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
    letterSpacing: typography.letterSpacing.normal,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  menuButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: colors.primary.neon,
    borderColor: colors.primary.neon,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: colors.primary.neon,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderColor: colors.border.default,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.dark,
    letterSpacing: typography.letterSpacing.normal,
  },
  secondaryButtonText: {
    color: colors.primary.neon,
  },
  tertiaryButtonText: {
    color: colors.text.muted,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
});
