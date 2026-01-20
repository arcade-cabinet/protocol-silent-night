/**
 * Animation tokens for Protocol: Silent Night
 */

/**
 * Animation durations (in milliseconds)
 */
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

/**
 * Easing functions
 */
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  // Custom cubic beziers for game feel
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  snap: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

/**
 * Common animation presets
 */
export const presets = {
  fadeIn: {
    duration: duration.normal,
    easing: easing.easeOut,
  },
  fadeOut: {
    duration: duration.fast,
    easing: easing.easeIn,
  },
  slideIn: {
    duration: duration.normal,
    easing: easing.easeOut,
  },
  slideOut: {
    duration: duration.fast,
    easing: easing.easeIn,
  },
  modalEnter: {
    duration: duration.slow,
    easing: easing.bounce,
  },
  modalExit: {
    duration: duration.fast,
    easing: easing.easeIn,
  },
  buttonPress: {
    duration: duration.fast,
    easing: easing.easeOut,
  },
} as const;

/**
 * Combined animation export
 */
export const animation = {
  duration,
  easing,
  presets,
} as const;
