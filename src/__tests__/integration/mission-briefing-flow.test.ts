/**
 * Integration test: Mission Briefing Flow
 * Tests the flow from character selection to mission briefing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('Mission Briefing Flow', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it.each(['santa', 'elf', 'bumble'] as const)(
    'should transition from MENU to BRIEFING when selecting %s',
    (character) => {
      const store = useGameStore.getState();

      // Initially in MENU state
      expect(store.state).toBe('MENU');

      // Select character
      store.selectClass(character);

      // Should now be in BRIEFING state
      expect(useGameStore.getState().state).toBe('BRIEFING');
    }
  );

  it('should set player class data when transitioning to BRIEFING', () => {
    const store = useGameStore.getState();

    store.selectClass('elf');

    const state = useGameStore.getState();
    expect(state.playerClass).toBeDefined();
    expect(state.playerClass?.type).toBe('elf');
    expect(state.playerClass?.name).toBe('CYBER-ELF');
    expect(state.state).toBe('BRIEFING');
  });

  it('should have mission briefing data available', () => {
    const store = useGameStore.getState();

    store.selectClass('santa');

    const { missionBriefing } = useGameStore.getState();
    expect(missionBriefing).toBeDefined();
    expect(missionBriefing.title).toBe('SILENT NIGHT');
    expect(missionBriefing.objective).toBeDefined();
    expect(missionBriefing.intel).toBeInstanceOf(Array);
    expect(missionBriefing.intel.length).toBeGreaterThan(0);
  });

  it('should allow transitioning from BRIEFING to PHASE_1', () => {
    const store = useGameStore.getState();

    // Select character
    store.selectClass('bumble');
    expect(useGameStore.getState().state).toBe('BRIEFING');

    // Start game from briefing
    store.setState('PHASE_1');
    expect(useGameStore.getState().state).toBe('PHASE_1');
  });
});
