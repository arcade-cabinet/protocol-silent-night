import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';

/**
 * Custom hook that wraps useGameStore with useShallow for optimized rendering.
 * This prevents unnecessary re-renders by performing shallow equality checks on selected state.
 *
 * @template T - The shape of the selected state object
 * @param selector - Function that selects and returns specific state properties
 * @returns The selected state with shallow comparison
 *
 * @example
 * ```tsx
 * const { playerHp, playerMaxHp } = useGameStoreShallow((state) => ({
 *   playerHp: state.playerHp,
 *   playerMaxHp: state.playerMaxHp,
 * }));
 * ```
 */
export function useGameStoreShallow<T>(
  selector: (state: ReturnType<typeof useGameStore.getState>) => T
): T {
  return useGameStore(useShallow(selector));
}
