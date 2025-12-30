/**
 * Custom hook for selecting from game store with shallow comparison
 * Reduces code duplication across components
 */

import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';

type GameStore = ReturnType<typeof useGameStore.getState>;

/**
 * Hook that selects specific fields from the game store with shallow comparison
 * @param selector - Function that extracts the desired fields from the store
 * @returns Selected fields from the store
 */
export function useGameStoreShallow<T>(selector: (state: GameStore) => T): T {
  return useGameStore(useShallow(selector));
}
