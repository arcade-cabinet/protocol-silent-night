/**
 * MissionBriefing - Full-screen mission intro with typewriter effect
 *
 * Displays mission briefing before gameplay starts:
 * - Typewriter text animation
 * - Character portrait
 * - Mission objectives
 * - Skip/continue functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  briefing,
} from '@protocol-silent-night/design-system';
import { PLAYER_CLASSES } from '@protocol-silent-night/game-core';

interface MissionBriefingProps {
  classType: string;
  onComplete: () => void;
  onSkip: () => void;
}

const MISSION_TEXT = `INCOMING TRANSMISSION...

NORTH POLE COMMAND
PRIORITY: ALPHA

OPERATIVE, the situation is critical. A rogue AI has seized control of the Holiday Defense Grid. Automated defenses are now targeting civilians. We need you to infiltrate the compromised sector and neutralize the threat.

MISSION OBJECTIVES:
• Eliminate hostile automatons
• Survive wave assaults
• Destroy the Core Processor

Your weaponry has been calibrated for maximum efficiency. Trust your training. The fate of the holidays depends on you.

COMMAND OUT.`;

export function MissionBriefing({
  classType,
  onComplete,
  onSkip,
}: MissionBriefingProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const playerClass = PLAYER_CLASSES[classType as keyof typeof PLAYER_CLASSES];

  // Typewriter effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < MISSION_TEXT.length) {
        setDisplayedText(MISSION_TEXT.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, briefing.typewriterSpeed);

    return () => clearInterval(interval);
  }, []);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSkip = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isComplete) {
      onComplete();
    } else {
      setDisplayedText(MISSION_TEXT);
      setIsComplete(true);
    }
  }, [isComplete, onComplete]);

  const handleContinue = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  }, [onComplete]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.operatorInfo}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: playerClass?.color ?? colors.primary.neon },
            ]}
          />
          <View>
            <Text style={styles.operatorName}>
              {playerClass?.name ?? 'UNKNOWN'}
            </Text>
            <Text style={styles.operatorRole}>
              {playerClass?.role ?? 'OPERATIVE'}
            </Text>
          </View>
        </View>
        <Pressable onPress={onSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      <View style={styles.terminal}>
        <View style={styles.terminalHeader}>
          <View style={[styles.dot, styles.dotRed]} />
          <View style={[styles.dot, styles.dotYellow]} />
          <View style={[styles.dot, styles.dotGreen]} />
          <Text style={styles.terminalTitle}>SECURE_CHANNEL_v2.1</Text>
        </View>
        <View style={styles.terminalContent}>
          <Text style={styles.missionText}>
            {displayedText}
            {!isComplete && <Text style={styles.cursor}>▌</Text>}
          </Text>
        </View>
      </View>

      {isComplete && (
        <Animated.View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>BEGIN MISSION</Text>
          </Pressable>
        </Animated.View>
      )}

      {!isComplete && (
        <Pressable style={styles.tapToSkip} onPress={handleSkip}>
          <Text style={styles.tapToSkipText}>TAP TO SKIP</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.darker,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary.neon,
  },
  operatorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  operatorRole: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    letterSpacing: typography.letterSpacing.wide,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    fontWeight: typography.fontWeight.semibold,
  },
  terminal: {
    flex: 1,
    backgroundColor: colors.background.dark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.neonDim,
    overflow: 'hidden',
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotRed: {
    backgroundColor: '#ff5f56',
  },
  dotYellow: {
    backgroundColor: '#ffbd2e',
  },
  dotGreen: {
    backgroundColor: '#27c93f',
  },
  terminalTitle: {
    marginLeft: spacing.md,
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    fontFamily: typography.fontFamily.mono,
  },
  terminalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  missionText: {
    fontSize: typography.fontSize.md,
    color: colors.primary.neon,
    fontFamily: typography.fontFamily.mono,
    lineHeight: typography.fontSize.md * briefing.lineHeight,
  },
  cursor: {
    color: colors.primary.neon,
  },
  footer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: colors.primary.neon,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.lg,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  continueText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.dark,
    letterSpacing: typography.letterSpacing.wide,
  },
  tapToSkip: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapToSkipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
});
