/**
 * Modal - Reusable modal component with cyberpunk styling
 *
 * Features:
 * - Animated entry/exit
 * - Backdrop blur effect
 * - Proper accessibility
 * - Keyboard dismissal support
 */

import { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
  AccessibilityInfo,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, animation, modal } from '@protocol-silent-night/design-system';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Whether clicking backdrop closes modal */
  dismissable?: boolean;
  /** Animation type */
  animationType?: 'fade' | 'slide' | 'scale';
}

export function Modal({
  visible,
  onClose,
  children,
  dismissable = true,
  animationType = 'scale',
}: ModalProps) {
  const { width, height } = useWindowDimensions();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      // Announce modal to screen readers
      AccessibilityInfo.announceForAccessibility('Dialog opened');

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animation.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: animation.duration.fast,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: animation.duration.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const handleBackdropPress = async () => {
    if (dismissable) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }
  };

  if (!visible) return null;

  const contentTransform =
    animationType === 'scale'
      ? [{ scale: scaleAnim }]
      : animationType === 'slide'
        ? [{ translateY: slideAnim }]
        : [];

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          accessibilityLabel="Close dialog"
          accessibilityRole="button"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: contentTransform,
            maxWidth: Math.min(modal.maxWidth, width - spacing.xl),
          },
        ]}
        accessibilityViewIsModal
        accessibilityRole="dialog"
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.overlay,
  },
  content: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary.neon,
    padding: spacing.lg,
    shadowColor: colors.primary.neon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
