import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

/**
 * Santa's Workshop screen - meta-progression hub
 *
 * Phase 2 implementation for:
 * - Weapon unlocks (using Nice Points currency)
 * - Character skins
 * - Permanent upgrades
 *
 * Currently shows placeholder UI with Nice Points counter
 * DDL data exists in `packages/game-core/src/data/workshop.json`
 *
 * TODO: Implement workshop UI in Phase 2
 * TODO: Connect to meta-progression store
 */
export default function WorkshopScreen() {
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
        <Text style={styles.title}>SANTA'S WORKSHOP</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.nicePointsLabel}>NICE POINTS</Text>
        <Text style={styles.nicePointsValue}>0</Text>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Workshop UI coming in Phase 2
          </Text>
          <Text style={styles.placeholderSubtext}>
            Unlock weapons, skins, and permanent upgrades
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicePointsLabel: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 2,
  },
  nicePointsValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00ff66',
    marginBottom: 40,
  },
  placeholder: {
    backgroundColor: '#111122',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222233',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#444',
  },
});
