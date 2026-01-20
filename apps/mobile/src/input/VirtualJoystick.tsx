/**
 * VirtualJoystick - Touch-based movement control for mobile
 *
 * Provides an on-screen joystick for player movement.
 * Positioned on the left side of the screen.
 *
 * Features:
 * - Visual joystick indicator
 * - Normalized output (-1 to 1)
 * - Deadzone support
 * - Smooth visual feedback
 */

import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

/**
 * Joystick state interface
 */
export interface JoystickState {
  /** Horizontal axis value (-1 to 1) */
  x: number;
  /** Vertical axis value (-1 to 1) */
  y: number;
  /** Whether joystick is currently being touched */
  active: boolean;
}

/**
 * VirtualJoystick props
 */
export interface VirtualJoystickProps {
  /** Called when joystick position changes */
  onMove: (x: number, y: number) => void;
  /** Called when joystick is released */
  onRelease: () => void;
  /** Joystick size in pixels (default: 120) */
  size?: number;
  /** Deadzone radius as percentage (0-1, default: 0.1) */
  deadzone?: number;
  /** Base color (default: rgba(255,255,255,0.2)) */
  baseColor?: string;
  /** Stick color (default: rgba(0,255,102,0.8)) */
  stickColor?: string;
  /** Whether joystick is disabled */
  disabled?: boolean;
}

// Animation spring config
const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

/**
 * VirtualJoystick component
 *
 * @example
 * ```tsx
 * <VirtualJoystick
 *   onMove={(x, y) => {
 *     // x: -1 (left) to 1 (right)
 *     // y: -1 (up) to 1 (down)
 *     movePlayer(x, y);
 *   }}
 *   onRelease={() => {
 *     stopPlayer();
 *   }}
 * />
 * ```
 */
export function VirtualJoystick({
  onMove,
  onRelease,
  size = 120,
  deadzone = 0.1,
  baseColor = 'rgba(255, 255, 255, 0.2)',
  stickColor = 'rgba(0, 255, 102, 0.8)',
  disabled = false,
}: VirtualJoystickProps): React.ReactNode {
  const [isActive, setIsActive] = useState(false);

  // Animated values for stick position
  const stickX = useSharedValue(0);
  const stickY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Reference values
  const baseRef = useRef<View>(null);
  const baseLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Calculate joystick dimensions
  const stickSize = size * 0.4;
  const maxDistance = (size - stickSize) / 2;

  /**
   * Handle layout change to get base position
   */
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    baseLayout.current = { x, y, width, height };
  }, []);

  /**
   * Calculate normalized joystick values
   */
  const calculateValues = useCallback(
    (touchX: number, touchY: number) => {
      const centerX = baseLayout.current.width / 2;
      const centerY = baseLayout.current.height / 2;

      // Calculate offset from center
      let deltaX = touchX - centerX;
      let deltaY = touchY - centerY;

      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Clamp to max distance
      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * maxDistance;
        deltaY = Math.sin(angle) * maxDistance;
      }

      // Update stick visual position
      stickX.value = deltaX;
      stickY.value = deltaY;

      // Calculate normalized values (-1 to 1)
      let normalizedX = deltaX / maxDistance;
      let normalizedY = deltaY / maxDistance;

      // Apply deadzone
      const normalizedDistance = Math.sqrt(
        normalizedX * normalizedX + normalizedY * normalizedY
      );

      if (normalizedDistance < deadzone) {
        normalizedX = 0;
        normalizedY = 0;
      } else {
        // Remap values to account for deadzone
        const remappedDistance =
          (normalizedDistance - deadzone) / (1 - deadzone);
        const angle = Math.atan2(normalizedY, normalizedX);
        normalizedX = Math.cos(angle) * remappedDistance;
        normalizedY = Math.sin(angle) * remappedDistance;
      }

      return { x: normalizedX, y: normalizedY };
    },
    [maxDistance, deadzone, stickX, stickY]
  );

  /**
   * PanResponder for touch handling
   */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: (event) => {
        setIsActive(true);
        scale.value = withSpring(1.1, SPRING_CONFIG);

        // Use nativeEvent for view-relative coordinates on initial touch
        const { locationX, locationY } = event.nativeEvent;
        const { x, y } = calculateValues(locationX, locationY);
        onMove(x, y);
      },

      onPanResponderMove: (event) => {
        // Use nativeEvent for view-relative coordinates
        const { locationX, locationY } = event.nativeEvent;
        const { x, y } = calculateValues(locationX, locationY);
        onMove(x, y);
      },

      onPanResponderRelease: () => {
        setIsActive(false);

        // Reset stick position with animation
        stickX.value = withSpring(0, SPRING_CONFIG);
        stickY.value = withSpring(0, SPRING_CONFIG);
        scale.value = withSpring(1, SPRING_CONFIG);

        onRelease();
      },

      onPanResponderTerminate: () => {
        setIsActive(false);

        // Reset stick position with animation
        stickX.value = withSpring(0, SPRING_CONFIG);
        stickY.value = withSpring(0, SPRING_CONFIG);
        scale.value = withSpring(1, SPRING_CONFIG);

        onRelease();
      },
    })
  ).current;

  /**
   * Animated style for stick position
   */
  const stickAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: stickX.value },
      { translateY: stickY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View
      ref={baseRef}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity: disabled ? 0.3 : 1,
        },
      ]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      {/* Base circle */}
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: baseColor,
            borderColor: isActive ? stickColor : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />

      {/* Stick */}
      <Animated.View
        style={[
          styles.stick,
          {
            width: stickSize,
            height: stickSize,
            borderRadius: stickSize / 2,
            backgroundColor: stickColor,
          },
          stickAnimatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  base: {
    position: 'absolute',
    borderWidth: 2,
  },
  stick: {
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
});

export default VirtualJoystick;
