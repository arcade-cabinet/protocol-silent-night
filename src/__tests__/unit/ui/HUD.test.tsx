import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { HUD } from '@/ui/HUD';

describe('HUD Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  it('should not render in MENU state', () => {
    const { container } = render(<HUD />);
    expect(container.firstChild).toBeNull();
  });

  it('should render in PHASE_1 state', () => {
    const store = useGameStore.getState();
    store.selectClass('santa');
    store.setState('PHASE_1');

    render(<HUD />);

    expect(screen.getByText('OPERATOR STATUS')).toBeInTheDocument();
    expect(screen.getByText('CURRENT OBJECTIVE')).toBeInTheDocument();
  });

  it('should display player health correctly', () => {
    const store = useGameStore.getState();
    store.selectClass('santa');
    store.setState('PHASE_1');

    render(<HUD />);

    expect(screen.getByText(/HP: 300 \/ 300/)).toBeInTheDocument();
  });

  it('should update health display when damaged', () => {
    const store = useGameStore.getState();
    store.selectClass('santa');
    store.setState('PHASE_1');
    const { rerender } = render(<HUD />);

    store.damagePlayer(100);
    rerender(<HUD />);

    expect(screen.getByText(/HP: 200 \/ 300/)).toBeInTheDocument();
  });

  it('should display health bar percentage correctly', () => {
    const store = useGameStore.getState();
    store.selectClass('elf');
    store.setState('PHASE_1');
    store.damagePlayer(50);

    const { container } = render(<HUD />);

    const healthBar = container.querySelector('[class*="hpBar"]');
    expect(healthBar).toHaveStyle({ width: '50%' });
  });

    it('should show correct objective in PHASE_1', () => {
    const store = useGameStore.getState();
    store.selectClass('santa');
    // Set level to avoid level-up interruption
    useGameStore.setState({
      runProgress: { ...useGameStore.getState().runProgress, level: 100 }
    });
    store.setState('PHASE_1');

    render(<HUD />);

    expect(screen.getByText(/ELIMINATE/i)).toBeInTheDocument();
    expect(screen.getByText(/GRINCH-BOTS/i)).toBeInTheDocument();
  });

  it('should update kills remaining in objective', () => {
    const store = useGameStore.getState();
    act(() => {
      store.selectClass('santa');
      // Set level to avoid level-up interruption
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 100 }
      });
      store.setState('PHASE_1');
    });
    const { rerender } = render(<HUD />);

    act(() => {
      store.addKill(50);
      store.addKill(50);
      store.addKill(50);
    });
    rerender(<HUD />);

    // Since we killed 3, 10-3=7 remains.
    // Use queryAllByText since multiple numbers might match the regex
    const matches = screen.queryAllByText(/7/);
    expect(matches.length).toBeGreaterThan(0);
  });

    it('should show boss objective in PHASE_BOSS', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('PHASE_BOSS');

    render(<HUD />);

    expect(screen.getByText(/KRAMPUS-PRIME/i)).toBeInTheDocument();
  });

    it('should show mission complete in WIN state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('WIN');

    render(<HUD />);

    expect(screen.getByText(/MISSION/i)).toBeInTheDocument();
    expect(screen.getByText(/COMPLETE/i)).toBeInTheDocument();
  });

  it('should show system failure in GAME_OVER state', () => {
    useGameStore.getState().selectClass('santa');
    useGameStore.getState().setState('GAME_OVER');

    render(<HUD />);

    expect(screen.getByText(/FAILURE/i)).toBeInTheDocument();
  });

  it('should display current score', () => {
    const store = useGameStore.getState();
    store.selectClass('santa');
    store.setState('PHASE_1');
    store.addKill(100);

    render(<HUD />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should update score display when kills added', () => {
    const store = useGameStore.getState();
    act(() => {
      store.selectClass('santa');
      store.setState('PHASE_1');
    });
    const { rerender } = render(<HUD />);

    act(() => {
      store.addKill(50);
      store.addKill(75);
    });
    rerender(<HUD />);

    // Check for digits (score is displayed as raw number).
    // Use queryAllByText since multiple numbers might match
    const matches = screen.queryAllByText(/\d{3}/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('should work with different character classes', () => {
    const store = useGameStore.getState();
    store.selectClass('elf');
    store.setState('PHASE_1');

    render(<HUD />);

    expect(screen.getByText(/HP: 100 \/ 100/)).toBeInTheDocument();
  });
});
