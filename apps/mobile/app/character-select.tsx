import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PLAYER_CLASSES, MAX_STAT_VALUES } from '@protocol-silent-night/game-core';

const classes = Object.values(PLAYER_CLASSES);

/**
 * Character selection screen - "Operator" selection
 *
 * Displays all available player classes from game-core DDL:
 * - Santa (Tank/Support)
 * - Elf (Speedster)
 * - Bumble (Brawler)
 *
 * Shows stats (HP, SPD, DMG) with visual stat bars
 * Uses horizontal scroll for class cards
 */
export default function CharacterSelectScreen() {
  /**
   * Handles class selection and navigation to game screen
   * @param classType - Selected character class identifier
   *
   * Provides heavy haptic feedback to confirm important choice
   */
  const handleSelectClass = async (classType: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/game',
      params: { classType },
    });
  };

  /**
   * Handles back navigation to main menu
   * Provides light haptic feedback for non-destructive action
   */
  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< BACK'}</Text>
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
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>HP</Text>
                <View style={styles.statBar}>
                  <View
                    style={[
                      styles.statFill,
                      { width: `${(playerClass.hp / MAX_STAT_VALUES.HP) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>SPD</Text>
                <View style={styles.statBar}>
                  <View
                    style={[
                      styles.statFill,
                      { width: `${(playerClass.speed / MAX_STAT_VALUES.SPEED) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>DMG</Text>
                <View style={styles.statBar}>
                  <View
                    style={[
                      styles.statFill,
                      { width: `${(playerClass.damage / MAX_STAT_VALUES.DAMAGE) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#00ff66',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    marginRight: 40,
  },
  classesContainer: {
    paddingVertical: 20,
    gap: 20,
    alignItems: 'center',
  },
  classCard: {
    width: 200,
    backgroundColor: '#111122',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#222233',
  },
  cardPressed: {
    borderColor: '#00ff66',
    transform: [{ scale: 1.02 }],
  },
  classAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  classRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    letterSpacing: 2,
  },
  statsContainer: {
    width: '100%',
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    width: 30,
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  statBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#222233',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    backgroundColor: '#00ff66',
    borderRadius: 3,
  },
});
