import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component for React Native
 *
 * Catches JavaScript errors in child component tree and displays
 * fallback UI instead of crashing the entire app.
 *
 * Features:
 * - Displays user-friendly error message
 * - Shows error details in development
 * - Provides "Return to Menu" action
 * - Logs errors for debugging
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error tracking service (Sentry, etc.)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    router.replace('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>⚠️ SYSTEM ERROR</Text>
            <Text style={styles.message}>
              PROTOCOL: SILENT NIGHT has encountered an unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackTrace}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <Pressable style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>RETURN TO MENU</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    backgroundColor: '#111122',
    padding: 30,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff3333',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff3333',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 4,
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#0a0a1a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff3333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#ff9999',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  stackTrace: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00ff66',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a1a',
    letterSpacing: 2,
  },
});
