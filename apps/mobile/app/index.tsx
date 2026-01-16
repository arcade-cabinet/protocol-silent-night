import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function MenuScreen() {
  const handleStartGame = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/character-select');
  };

  const handleWorkshop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/workshop');
  };

  return (
    <View style={styles.container}>
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
        >
          <Text style={styles.buttonText}>SANTA'S WORKSHOP</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by BabylonJS React Native</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  protocol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00ff66',
    letterSpacing: 4,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: '#00ff66',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    letterSpacing: 2,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  menuButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#00ff66',
    borderColor: '#00ff66',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#00ff66',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0a0a1a',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#444',
  },
});
