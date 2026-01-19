/**
 * Input System - Protocol: Silent Night
 *
 * Mobile touch input system for game controls.
 *
 * @example
 * ```typescript
 * import {
 *   VirtualJoystick,
 *   GestureHandler,
 *   createInputManager,
 *   useFireControl,
 * } from '@/src/input';
 *
 * // Create input manager
 * const inputManager = createInputManager({ deadzone: 0.15 });
 *
 * // In component
 * function GameControls() {
 *   const fireControl = useFireControl({
 *     onFire: () => weapon.fire(),
 *     fireRate: 100,
 *   });
 *
 *   return (
 *     <GestureHandler
 *       onPinch={(scale) => camera.setZoom(scale)}
 *       onTap={fireControl.startFire}
 *       onLongPressStart={fireControl.startFire}
 *       onLongPressEnd={fireControl.stopFire}
 *     >
 *       <VirtualJoystick
 *         onMove={(x, y) => inputManager.setMovement(x, y)}
 *         onRelease={() => inputManager.clearMovement()}
 *       />
 *     </GestureHandler>
 *   );
 * }
 * ```
 */

// Virtual Joystick
export {
  VirtualJoystick,
  type JoystickState,
  type VirtualJoystickProps,
} from './VirtualJoystick';

// Gesture Handler
export {
  GestureHandler,
  useFireControl,
  type PinchState,
  type TapState,
  type GestureHandlerProps,
} from './GestureHandler';

// Input Manager
export {
  createInputManager,
  getGlobalInputManager,
  resetGlobalInputManager,
  type InputState,
  type MovementInput,
  type FireInput,
  type CameraInput,
  type InputManagerController,
  type InputManagerOptions,
} from './InputManager';
