/**
 * InputManager - Unified input state management for mobile
 *
 * Aggregates input from multiple sources:
 * - Virtual joystick (movement)
 * - Gesture handler (firing, zoom)
 * - Device sensors (future: tilt controls)
 *
 * Provides a single interface for game systems to query input state.
 */

/**
 * Movement input state
 */
export interface MovementInput {
  /** Horizontal axis (-1 to 1, negative = left) */
  x: number;
  /** Vertical axis (-1 to 1, negative = up) */
  y: number;
  /** Magnitude of movement (0 to 1) */
  magnitude: number;
  /** Movement angle in radians */
  angle: number;
}

/**
 * Fire input state
 */
export interface FireInput {
  /** Whether fire button is pressed */
  isFiring: boolean;
  /** Position of fire target (for aim) */
  targetX: number;
  targetY: number;
}

/**
 * Camera input state
 */
export interface CameraInput {
  /** Zoom scale multiplier (1 = default) */
  zoomScale: number;
  /** Whether user is currently zooming */
  isZooming: boolean;
}

/**
 * Complete input state
 */
export interface InputState {
  /** Movement input from joystick */
  movement: MovementInput;
  /** Fire input from tap/hold gestures */
  fire: FireInput;
  /** Camera input from pinch gesture */
  camera: CameraInput;
  /** Whether joystick is currently active */
  joystickActive: boolean;
  /** Timestamp of last input update */
  lastUpdate: number;
}

/**
 * Input manager controller interface
 */
export interface InputManagerController {
  /** Get current input state */
  getState: () => InputState;
  /** Set movement values from joystick */
  setMovement: (x: number, y: number) => void;
  /** Clear movement (joystick released) */
  clearMovement: () => void;
  /** Set firing state */
  setFiring: (firing: boolean, targetX?: number, targetY?: number) => void;
  /** Set camera zoom scale */
  setZoom: (scale: number, isZooming?: boolean) => void;
  /** Reset all input to defaults */
  reset: () => void;
  /** Subscribe to input changes */
  subscribe: (callback: (state: InputState) => void) => () => void;
  /** Clean up resources */
  dispose: () => void;
}

/**
 * Input manager options
 */
export interface InputManagerOptions {
  /** Movement deadzone (0-1, default: 0.1) */
  deadzone?: number;
  /** Default zoom scale (default: 1) */
  defaultZoom?: number;
  /** Minimum zoom scale (default: 0.5) */
  minZoom?: number;
  /** Maximum zoom scale (default: 2.0) */
  maxZoom?: number;
}

// Default options
const DEFAULT_OPTIONS: Required<InputManagerOptions> = {
  deadzone: 0.1,
  defaultZoom: 1,
  minZoom: 0.5,
  maxZoom: 2.0,
};

/**
 * Create default input state
 */
function createDefaultState(defaultZoom: number): InputState {
  return {
    movement: {
      x: 0,
      y: 0,
      magnitude: 0,
      angle: 0,
    },
    fire: {
      isFiring: false,
      targetX: 0,
      targetY: 0,
    },
    camera: {
      zoomScale: defaultZoom,
      isZooming: false,
    },
    joystickActive: false,
    lastUpdate: Date.now(),
  };
}

/**
 * Apply deadzone to movement input
 */
function applyDeadzone(
  x: number,
  y: number,
  deadzone: number
): { x: number; y: number; magnitude: number } {
  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude < deadzone) {
    return { x: 0, y: 0, magnitude: 0 };
  }

  // Remap values to account for deadzone
  const remappedMagnitude = (magnitude - deadzone) / (1 - deadzone);
  const angle = Math.atan2(y, x);

  return {
    x: Math.cos(angle) * remappedMagnitude,
    y: Math.sin(angle) * remappedMagnitude,
    magnitude: remappedMagnitude,
  };
}

/**
 * Creates a unified input manager for the game
 *
 * @param options - Configuration options
 * @returns Input manager controller
 *
 * @example
 * ```typescript
 * const inputManager = createInputManager({ deadzone: 0.15 });
 *
 * // In joystick component
 * <VirtualJoystick
 *   onMove={(x, y) => inputManager.setMovement(x, y)}
 *   onRelease={() => inputManager.clearMovement()}
 * />
 *
 * // In gesture handler
 * <GestureHandler
 *   onTap={() => inputManager.setFiring(true)}
 *   onLongPressEnd={() => inputManager.setFiring(false)}
 *   onPinch={(scale) => inputManager.setZoom(scale, true)}
 *   onPinchEnd={() => inputManager.setZoom(inputManager.getState().camera.zoomScale, false)}
 * />
 *
 * // In game loop
 * const { movement, fire } = inputManager.getState();
 * player.velocity.x = movement.x * playerSpeed;
 * player.velocity.y = movement.y * playerSpeed;
 * if (fire.isFiring) fireWeapon();
 * ```
 */
export function createInputManager(
  options: InputManagerOptions = {}
): InputManagerController {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Current state
  let state = createDefaultState(config.defaultZoom);

  // Subscribers for state changes
  const subscribers = new Set<(state: InputState) => void>();

  /**
   * Notify all subscribers of state change
   */
  function notifySubscribers(): void {
    state.lastUpdate = Date.now();
    subscribers.forEach((callback) => {
      callback(state);
    });
  }

  /**
   * Get current input state (returns copy to prevent mutation)
   */
  function getState(): InputState {
    return { ...state };
  }

  /**
   * Set movement from joystick
   */
  function setMovement(x: number, y: number): void {
    const processed = applyDeadzone(x, y, config.deadzone);

    state.movement = {
      ...processed,
      angle: Math.atan2(processed.y, processed.x),
    };
    state.joystickActive = processed.magnitude > 0;

    notifySubscribers();
  }

  /**
   * Clear movement (joystick released)
   */
  function clearMovement(): void {
    state.movement = {
      x: 0,
      y: 0,
      magnitude: 0,
      angle: 0,
    };
    state.joystickActive = false;

    notifySubscribers();
  }

  /**
   * Set firing state
   */
  function setFiring(
    firing: boolean,
    targetX: number = 0,
    targetY: number = 0
  ): void {
    state.fire = {
      isFiring: firing,
      targetX,
      targetY,
    };

    notifySubscribers();
  }

  /**
   * Set camera zoom scale
   */
  function setZoom(scale: number, isZooming: boolean = false): void {
    // Clamp zoom to configured bounds
    const clampedScale = Math.max(
      config.minZoom,
      Math.min(config.maxZoom, scale)
    );

    state.camera = {
      zoomScale: clampedScale,
      isZooming,
    };

    notifySubscribers();
  }

  /**
   * Reset all input to defaults
   */
  function reset(): void {
    state = createDefaultState(config.defaultZoom);
    notifySubscribers();
  }

  /**
   * Subscribe to input changes
   * Returns unsubscribe function
   */
  function subscribe(callback: (state: InputState) => void): () => void {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }

  /**
   * Clean up resources
   */
  function dispose(): void {
    subscribers.clear();
    reset();
  }

  return {
    getState,
    setMovement,
    clearMovement,
    setFiring,
    setZoom,
    reset,
    subscribe,
    dispose,
  };
}

/**
 * Singleton input manager instance for global access
 *
 * Use this when you need a shared input manager across components.
 * For isolated testing, create separate instances with createInputManager().
 */
let globalInputManager: InputManagerController | null = null;

/**
 * Get the global input manager instance
 *
 * Creates a new instance if one doesn't exist.
 */
export function getGlobalInputManager(
  options?: InputManagerOptions
): InputManagerController {
  if (!globalInputManager) {
    globalInputManager = createInputManager(options);
  }
  return globalInputManager;
}

/**
 * Reset the global input manager
 *
 * Useful for testing or game restart.
 */
export function resetGlobalInputManager(): void {
  if (globalInputManager) {
    globalInputManager.dispose();
    globalInputManager = null;
  }
}
