/**
 * Game-specific design tokens for Protocol: Silent Night
 */

/**
 * HUD element dimensions
 */
export const hud = {
  healthBar: {
    height: 20,
    width: 200,
    borderRadius: 10,
    margin: 16,
  },
  bossBar: {
    height: 30,
    width: 400,
    borderRadius: 15,
  },
  scoreDisplay: {
    width: 150,
    height: 40,
  },
  killCounter: {
    width: 80,
    height: 40,
  },
  safeAreaTop: 30, // Accounts for notch/status bar
} as const;

/**
 * Touch control dimensions
 */
export const controls = {
  joystick: {
    size: 150,
    knobSize: 60,
    deadZone: 0.1,
    maxDistance: 45,
  },
  button: {
    size: 80,
    borderRadius: 40,
  },
  // Safe areas for controls (from edges)
  padding: {
    bottom: 50,
    left: 50,
    right: 50,
  },
} as const;

/**
 * Modal/overlay dimensions
 */
export const modal = {
  maxWidth: 600,
  borderRadius: 16,
  padding: 24,
  backdropOpacity: 0.9,
} as const;

/**
 * Character selection card dimensions
 */
export const characterCard = {
  width: 200,
  height: 280,
  avatarSize: 80,
  gap: 20,
} as const;

/**
 * Mission briefing dimensions
 */
export const briefing = {
  maxWidth: 800,
  lineHeight: 1.6,
  typewriterSpeed: 30, // ms per character
} as const;

/**
 * Combined game tokens export
 */
export const game = {
  hud,
  controls,
  modal,
  characterCard,
  briefing,
} as const;
