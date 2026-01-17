import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

/**
 * Root layout component
 *
 * Wraps the entire app with:
 * - ErrorBoundary for crash protection
 * - StatusBar configuration
 * - Stack navigator
 */
export default function RootLayout() {
  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar style="light" hidden />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#0a0a1a' },
          }}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
});
