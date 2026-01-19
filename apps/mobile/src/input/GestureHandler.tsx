/**
 * GestureHandler - Multi-touch gesture support for mobile
 *
 * Provides gesture detection for:
 * - Pinch-to-zoom (camera zoom)
 * - Tap-to-fire (weapon firing)
 * - Long press (alternative fire modes)
 *
 * Uses react-native-gesture-handler for optimal performance.
 */

import React, { useCallback, useRef } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

/**
 * Pinch gesture state
 */
export interface PinchState {
  /** Current scale factor */
  scale: number;
  /** Focal point X */
  focalX: number;
  /** Focal point Y */
  focalY: number;
}

/**
 * Tap gesture state
 */
export interface TapState {
  /** Tap X position */
  x: number;
  /** Tap Y position */
  y: number;
  /** Number of taps (for double-tap) */
  numberOfTaps: number;
}

/**
 * GestureHandler props
 */
export interface GestureHandlerProps {
  /** Called during pinch gesture with scale factor */
  onPinch?: (scale: number) => void;
  /** Called when pinch ends */
  onPinchEnd?: () => void;
  /** Called on single tap */
  onTap?: (x: number, y: number) => void;
  /** Called on double tap */
  onDoubleTap?: (x: number, y: number) => void;
  /** Called when long press starts */
  onLongPressStart?: (x: number, y: number) => void;
  /** Called when long press ends */
  onLongPressEnd?: () => void;
  /** Minimum scale for pinch (default: 0.5) */
  minScale?: number;
  /** Maximum scale for pinch (default: 2.0) */
  maxScale?: number;
  /** Long press minimum duration in ms (default: 300) */
  longPressDuration?: number;
  /** Children to wrap with gesture detection */
  children: React.ReactNode;
  /** Container style */
  style?: ViewStyle;
  /** Whether gestures are disabled */
  disabled?: boolean;
}

// Spring config for smooth animations
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

/**
 * GestureHandler component
 *
 * Wraps children with multi-touch gesture detection for mobile input.
 *
 * @example
 * ```tsx
 * <GestureHandler
 *   onPinch={(scale) => {
 *     // Adjust camera zoom
 *     camera.setZoom(baseZoom * scale);
 *   }}
 *   onTap={() => {
 *     // Fire weapon
 *     fireWeapon();
 *   }}
 *   onLongPressStart={() => {
 *     // Start continuous fire
 *     startFiring();
 *   }}
 *   onLongPressEnd={() => {
 *     // Stop continuous fire
 *     stopFiring();
 *   }}
 * >
 *   <GameView />
 * </GestureHandler>
 * ```
 */
export function GestureHandler({
  onPinch,
  onPinchEnd,
  onTap,
  onDoubleTap,
  onLongPressStart,
  onLongPressEnd,
  minScale = 0.5,
  maxScale = 2.0,
  longPressDuration = 300,
  children,
  style,
  disabled = false,
}: GestureHandlerProps): JSX.Element {
  // Track base scale for pinch
  const baseScale = useSharedValue(1);
  const currentScale = useSharedValue(1);

  // Track long press state
  const isLongPressing = useRef(false);

  /**
   * Handle pinch callback safely on JS thread
   */
  const handlePinch = useCallback(
    (scale: number) => {
      onPinch?.(scale);
    },
    [onPinch]
  );

  /**
   * Handle pinch end callback safely on JS thread
   */
  const handlePinchEnd = useCallback(() => {
    onPinchEnd?.();
  }, [onPinchEnd]);

  /**
   * Handle tap callback safely on JS thread
   */
  const handleTap = useCallback(
    (x: number, y: number) => {
      onTap?.(x, y);
    },
    [onTap]
  );

  /**
   * Handle double tap callback safely on JS thread
   */
  const handleDoubleTap = useCallback(
    (x: number, y: number) => {
      onDoubleTap?.(x, y);
    },
    [onDoubleTap]
  );

  /**
   * Handle long press start callback safely on JS thread
   */
  const handleLongPressStart = useCallback(
    (x: number, y: number) => {
      isLongPressing.current = true;
      onLongPressStart?.(x, y);
    },
    [onLongPressStart]
  );

  /**
   * Handle long press end callback safely on JS thread
   */
  const handleLongPressEnd = useCallback(() => {
    if (isLongPressing.current) {
      isLongPressing.current = false;
      onLongPressEnd?.();
    }
  }, [onLongPressEnd]);

  /**
   * Pinch gesture for camera zoom
   */
  const pinchGesture = Gesture.Pinch()
    .enabled(!disabled && !!onPinch)
    .onStart(() => {
      baseScale.value = currentScale.value;
    })
    .onUpdate((event) => {
      // Calculate new scale within bounds
      const newScale = Math.max(
        minScale,
        Math.min(maxScale, baseScale.value * event.scale)
      );
      currentScale.value = newScale;
      runOnJS(handlePinch)(newScale);
    })
    .onEnd(() => {
      runOnJS(handlePinchEnd)();
    });

  /**
   * Single tap gesture for firing
   */
  const tapGesture = Gesture.Tap()
    .enabled(!disabled && !!onTap)
    .maxDuration(250)
    .onEnd((event) => {
      runOnJS(handleTap)(event.x, event.y);
    });

  /**
   * Double tap gesture for special actions
   */
  const doubleTapGesture = Gesture.Tap()
    .enabled(!disabled && !!onDoubleTap)
    .numberOfTaps(2)
    .maxDuration(250)
    .onEnd((event) => {
      runOnJS(handleDoubleTap)(event.x, event.y);
    });

  /**
   * Long press gesture for continuous fire
   */
  const longPressGesture = Gesture.LongPress()
    .enabled(!disabled && !!onLongPressStart)
    .minDuration(longPressDuration)
    .onStart((event) => {
      runOnJS(handleLongPressStart)(event.x, event.y);
    })
    .onEnd(() => {
      runOnJS(handleLongPressEnd)();
    })
    .onFinalize(() => {
      runOnJS(handleLongPressEnd)();
    });

  /**
   * Compose all gestures
   * - Double tap has priority over single tap
   * - Long press is simultaneous with others
   * - Pinch is simultaneous with others
   */
  const composedGestures = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTapGesture, tapGesture),
    longPressGesture,
    pinchGesture
  );

  return (
    <GestureHandlerRootView style={[styles.container, style]}>
      <GestureDetector gesture={composedGestures}>
        {/* @ts-expect-error React 19 type compatibility with react-native-reanimated */}
        <Animated.View style={styles.content}>{children}</Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

/**
 * Hook for fire button functionality
 *
 * Provides continuous fire support with proper cleanup.
 *
 * @example
 * ```tsx
 * const { startFire, stopFire, isFiring } = useFireControl({
 *   onFire: () => {
 *     // Create projectile
 *     fireProjectile();
 *   },
 *   fireRate: 100, // 10 shots per second
 * });
 *
 * <GestureHandler
 *   onTap={startFire}
 *   onLongPressStart={startFire}
 *   onLongPressEnd={stopFire}
 * >
 *   ...
 * </GestureHandler>
 * ```
 */
export function useFireControl(options: {
  onFire: () => void;
  fireRate?: number;
  autoFire?: boolean;
}) {
  const { onFire, fireRate = 100, autoFire = true } = options;

  const isFiring = useRef(false);
  const fireInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFire = useCallback(() => {
    if (isFiring.current) return;
    isFiring.current = true;

    // Fire immediately
    onFire();

    // Start continuous fire if autoFire is enabled
    if (autoFire) {
      fireInterval.current = setInterval(() => {
        if (isFiring.current) {
          onFire();
        }
      }, fireRate);
    }
  }, [onFire, fireRate, autoFire]);

  const stopFire = useCallback(() => {
    isFiring.current = false;

    if (fireInterval.current) {
      clearInterval(fireInterval.current);
      fireInterval.current = null;
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopFire();
    };
  }, [stopFire]);

  return {
    startFire,
    stopFire,
    isFiring: () => isFiring.current,
  };
}

export default GestureHandler;
