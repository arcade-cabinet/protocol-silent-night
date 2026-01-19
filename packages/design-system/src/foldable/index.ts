/**
 * Foldable device support utilities for Protocol: Silent Night
 *
 * Handles:
 * - Fold state detection
 * - Hinge area avoidance
 * - Layout adaptation for folded/unfolded states
 * - Smooth transitions between states
 */

import { deviceProfiles, isUnfoldedFoldable } from '../tokens/breakpoints';

/**
 * Foldable device state
 */
export interface FoldableState {
  /** Whether the device is a foldable */
  isFoldable: boolean;
  /** Whether the device is currently unfolded */
  isUnfolded: boolean;
  /** Current screen dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Hinge area to avoid (null if not applicable) */
  hingeArea: {
    start: number;
    width: number;
    orientation: 'vertical' | 'horizontal';
  } | null;
  /** Aspect ratio of current state */
  aspectRatio: number;
}

/**
 * Layout mode for foldable devices
 */
export type FoldableLayoutMode =
  | 'single' // Single screen (folded or non-foldable)
  | 'split' // Split across fold (dual-pane)
  | 'span'; // Spanning entire unfolded display

/**
 * Detect foldable state from screen dimensions
 */
export function detectFoldableState(width: number, height: number): FoldableState {
  const isUnfolded = isUnfoldedFoldable(width, height);
  const aspectRatio = Math.min(width, height) / Math.max(width, height);

  // Check if dimensions match known foldable profiles
  let hingeArea: FoldableState['hingeArea'] = null;
  let isFoldable = false;

  // Check OnePlus Open unfolded dimensions
  const onePlus = deviceProfiles.oneplusOpen;
  if (
    (width >= onePlus.unfolded.width - 100 && width <= onePlus.unfolded.width + 100) ||
    (height >= onePlus.unfolded.width - 100 && height <= onePlus.unfolded.width + 100)
  ) {
    isFoldable = true;
    if (isUnfolded) {
      hingeArea = {
        start: onePlus.hingeArea.start,
        width: onePlus.hingeArea.width,
        orientation: width > height ? 'vertical' : 'horizontal',
      };
    }
  }

  // Check Galaxy Fold 5 unfolded dimensions
  const galaxyFold = deviceProfiles.galaxyFold5;
  if (
    (width >= galaxyFold.unfolded.width - 100 && width <= galaxyFold.unfolded.width + 100) ||
    (height >= galaxyFold.unfolded.width - 100 && height <= galaxyFold.unfolded.width + 100)
  ) {
    isFoldable = true;
    if (isUnfolded) {
      hingeArea = {
        start: galaxyFold.hingeArea.start,
        width: galaxyFold.hingeArea.width,
        orientation: width > height ? 'vertical' : 'horizontal',
      };
    }
  }

  return {
    isFoldable,
    isUnfolded,
    dimensions: { width, height },
    hingeArea,
    aspectRatio,
  };
}

/**
 * Get recommended layout mode for current foldable state
 */
export function getLayoutMode(state: FoldableState): FoldableLayoutMode {
  if (!state.isFoldable || !state.isUnfolded) {
    return 'single';
  }

  // For games, we typically want to span the entire display
  // Split mode would be used for apps with distinct panes
  return 'span';
}

/**
 * Calculate safe area that avoids the hinge
 */
export function getSafeArea(
  state: FoldableState,
  mode: FoldableLayoutMode
): { left: number; right: number; top: number; bottom: number } {
  const baseArea = { left: 0, right: 0, top: 0, bottom: 0 };

  if (!state.hingeArea || mode === 'span') {
    return baseArea;
  }

  if (mode === 'split') {
    // In split mode, add padding around the hinge
    if (state.hingeArea.orientation === 'vertical') {
      return {
        ...baseArea,
        right: state.dimensions.width - state.hingeArea.start,
        // Leave space for the other pane
      };
    } else {
      return {
        ...baseArea,
        bottom: state.dimensions.height - state.hingeArea.start,
      };
    }
  }

  return baseArea;
}

/**
 * Get content insets for UI elements to avoid the hinge
 */
export function getHingeAvoidanceInsets(state: FoldableState): {
  horizontal: number;
  vertical: number;
} {
  if (!state.hingeArea || state.hingeArea.width === 0) {
    return { horizontal: 0, vertical: 0 };
  }

  // Add padding around hinge area
  const padding = state.hingeArea.width + 24; // Extra padding for visual comfort

  if (state.hingeArea.orientation === 'vertical') {
    return { horizontal: padding, vertical: 0 };
  } else {
    return { horizontal: 0, vertical: padding };
  }
}

/**
 * Calculate optimal HUD positioning for foldable state
 */
export function getHUDPositioning(state: FoldableState): {
  healthBar: { x: number; y: number };
  score: { x: number; y: number };
  controls: { x: number; y: number };
} {
  const margin = 16;
  const safeTop = 30;

  if (state.isUnfolded && state.hingeArea) {
    // Position HUD elements to avoid hinge
    const hingeCenter = state.hingeArea.start + state.hingeArea.width / 2;

    if (state.hingeArea.orientation === 'vertical') {
      // Hinge is vertical (landscape unfolded)
      // Put health on left pane, score on right pane
      return {
        healthBar: { x: margin, y: safeTop + margin },
        score: { x: state.dimensions.width - margin - 150, y: safeTop + margin },
        controls: { x: margin, y: state.dimensions.height - margin - 150 },
      };
    }
  }

  // Default positioning
  return {
    healthBar: { x: margin, y: safeTop + margin },
    score: { x: state.dimensions.width - margin - 150, y: safeTop + margin },
    controls: { x: margin, y: state.dimensions.height - margin - 150 },
  };
}

/**
 * React Native hook-compatible fold state change callback type
 */
export type FoldStateChangeCallback = (state: FoldableState) => void;
