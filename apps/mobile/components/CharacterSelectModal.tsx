/**
 * CharacterSelectModal - Modal-based character selection
 *
 * Displays all available operators with stats in a horizontal scroll.
 * No page navigation - opens as overlay on main menu.
 */

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Modal } from './Modal';
import { PLAYER_CLASSES, MAX_STAT_VALUES } from '@protocol-silent-night/game-core';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  characterCard,
} from '@protocol-silent-night/design-system';

const classes = Object.values(PLAYER_CLASSES);

interface CharacterSelectModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (classType: string) => void;
}

export function CharacterSelectModal({
  visible,
  onClose,
  onSelect,
}: CharacterSelectModalProps) {
  const handleSelectClass = async (classType: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSelect(classType);
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose} dismissable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.title}>SELECT OPERATOR</Text>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.classesContainer}
          showsHorizontalScrollIndicator={false}
        >
          {classes.map((playerClass) => (
            <Pressable
              key={playerClass.type}
              style={({ pressed }) => [
                styles.classCard,
                pressed && styles.cardPressed,
              ]}
              onPress={() => handleSelectClass(playerClass.type)}
              accessibilityLabel={`Select ${playerClass.name}, ${playerClass.role}`}
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.classAvatar,
                  { backgroundColor: playerClass.color },
                ]}
              />
              <Text style={styles.className}>{playerClass.name}</Text>
              <Text style={styles.classRole}>{playerClass.role}</Text>

              <View style={styles.statsContainer}>
                <StatBar
                  label="HP"
                  value={playerClass.hp}
                  max={MAX_STAT_VALUES.HP}
                />
                <StatBar
                  label="SPD"
                  value={playerClass.speed}
                  max={MAX_STAT_VALUES.SPEED}
                />
                <StatBar
                  label="DMG"
                  value={playerClass.damage}
                  max={MAX_STAT_VALUES.DAMAGE}
                />
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.hint}>
          Tap an operator to begin mission
        </Text>
      </View>
    </Modal>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
}

function StatBar({ label, value, max }: StatBarProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBar}>
        <View
          style={[
            styles.statFill,
            { width: `${(value / max) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 300,
    maxWidth: 700,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.text.muted,
    fontSize: typography.fontSize.lg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
    marginRight: 32, // Balance the close button
  },
  classesContainer: {
    paddingVertical: spacing.sm,
    gap: characterCard.gap,
  },
  classCard: {
    width: characterCard.width,
    backgroundColor: colors.background.dark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  cardPressed: {
    borderColor: colors.primary.neon,
    transform: [{ scale: 1.02 }],
  },
  classAvatar: {
    width: characterCard.avatarSize,
    height: characterCard.avatarSize,
    borderRadius: characterCard.avatarSize / 2,
    marginBottom: spacing.md,
  },
  className: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  classRole: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.normal,
  },
  statsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statLabel: {
    width: 30,
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    fontWeight: typography.fontWeight.semibold,
  },
  statBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border.default,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    backgroundColor: colors.primary.neon,
    borderRadius: borderRadius.sm,
  },
  hint: {
    marginTop: spacing.lg,
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
});
