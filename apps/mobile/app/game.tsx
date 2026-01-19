import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GameScene } from '../components/GameScene';
import { useGameStore, PLAYER_CLASSES } from '@protocol-silent-night/game-core';
import type { PlayerClassType } from '@protocol-silent-night/game-core';

/**
 * Game screen component - main gameplay view
 *
 * Handles:
 * - BabylonJS game scene rendering
 * - HUD display (HP, score, kills)
 * - Loading overlay
 * - Pause menu
 *
 * @param classType - Selected character class from navigation params
 *
 * Reads from Zustand game store for:
 * - Player HP and max HP
 * - Current score
 * - Kill count
 */
export default function GameScreen() {
  const { classType } = useLocalSearchParams<{ classType: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Get game state from store
  const { player, stats, initializePlayer, resetGame } = useGameStore();

  // Initialize player when component mounts
  useEffect(() => {
    // Guard against invalid classType - default to 'santa' if not valid
    const validClassType = (classType as PlayerClassType) || 'santa';
    const selectedClass = PLAYER_CLASSES[validClassType];

    if (selectedClass) {
      initializePlayer(validClassType, selectedClass.hp);
    } else {
      // Fallback to santa if somehow invalid
      const fallbackClass = PLAYER_CLASSES['santa'];
      initializePlayer('santa', fallbackClass.hp);
    }

    // Reset game when component unmounts
    return () => {
      resetGame();
    };
  }, [classType, initializePlayer, resetGame]);

  /**
   * Handles BabylonJS scene ready event
   * Hides loading overlay and triggers success haptic feedback
   */
  const handleReady = () => {
    setIsLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  /**
   * Toggles pause state and shows/hides pause menu
   * Provides light haptic feedback on toggle
   */
  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  /**
   * Exits game and returns to main menu
   * Provides heavy haptic feedback to confirm destructive exit action
   */
  const handleExit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Game Scene */}
      <GameScene
        classType={(classType as 'santa' | 'elf' | 'bumble') ?? 'santa'}
        onReady={handleReady}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.overlay}>
          <Text style={styles.loadingText}>DEPLOYING {classType?.toUpperCase()}...</Text>
          <View style={styles.loadingBar}>
            <View style={styles.loadingFill} />
          </View>
        </View>
      )}

      {/* HUD */}
      {!isLoading && (
        <View style={styles.hud}>
          <View style={styles.hudTop}>
            <View style={styles.healthContainer}>
              <Text style={styles.healthLabel}>HP</Text>
              <View style={styles.healthBar}>
                <View
                  style={[
                    styles.healthFill,
                    {
                      width: `${Math.min(100, Math.max(0, (player.hp / player.maxHp) * 100))}%`,
                    },
                  ]}
                />
              </View>
            </View>
            <Pressable style={styles.pauseButton} onPress={handlePause}>
              <Text style={styles.pauseText}>||</Text>
            </Pressable>
          </View>

          <View style={styles.hudBottom}>
            <Text style={styles.scoreText}>SCORE: {stats.score}</Text>
            <Text style={styles.killsText}>KILLS: {stats.kills}/10</Text>
          </View>
        </View>
      )}

      {/* Pause Menu */}
      {isPaused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseMenu}>
            <Text style={styles.pauseTitle}>MISSION PAUSED</Text>
            <Pressable
              style={[styles.menuButton, styles.resumeButton]}
              onPress={handlePause}
            >
              <Text style={styles.buttonText}>RESUME</Text>
            </Pressable>
            <Pressable
              style={[styles.menuButton, styles.exitButton]}
              onPress={handleExit}
            >
              <Text style={[styles.buttonText, styles.exitText]}>ABORT MISSION</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#00ff66',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 20,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#222',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#00ff66',
  },
  hud: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
    padding: 20,
  },
  hudTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  healthLabel: {
    color: '#00ff66',
    fontSize: 14,
    fontWeight: '700',
  },
  healthBar: {
    width: 150,
    height: 12,
    backgroundColor: '#222',
    borderRadius: 6,
    overflow: 'hidden',
  },
  healthFill: {
    height: '100%',
    backgroundColor: '#00ff66',
  },
  pauseButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  hudBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  killsText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseMenu: {
    backgroundColor: '#111122',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff66',
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 30,
    letterSpacing: 4,
  },
  menuButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  resumeButton: {
    backgroundColor: '#00ff66',
  },
  exitButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff3333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a1a',
    letterSpacing: 2,
  },
  exitText: {
    color: '#ff3333',
  },
});
