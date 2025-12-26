import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '@/audio/AudioManager';
import { useGameStore } from '@/store/gameStore';
import { MissionBriefing } from '@/ui/MissionBriefing';

// Mock AudioManager
vi.mock('@/audio/AudioManager', () => ({
  AudioManager: {
    playSFX: vi.fn(),
    playMusic: vi.fn(),
  },
}));

describe('MissionBriefing Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should not render when not in BRIEFING state', () => {
    const { container } = render(<MissionBriefing />);
    expect(container.firstChild).toBeNull();
  });

  it('should render when in BRIEFING state', () => {
    act(() => {
      useGameStore.getState().selectClass('santa');
    });

    render(<MissionBriefing />);

    expect(screen.getByText('MISSION BRIEFING')).toBeInTheDocument();
  });

  it('should display briefing lines over time', () => {
    vi.useFakeTimers();

    act(() => {
      useGameStore.getState().selectClass('santa');
    });

    render(<MissionBriefing />);

    // First line should be visible
    expect(screen.getByText('OPERATION:')).toBeInTheDocument();
    expect(screen.getByText('SILENT NIGHT')).toBeInTheDocument();

    // Advance timers to reveal more lines
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText('OPERATOR:')).toBeInTheDocument();
    expect(screen.getByText('MECHA-SANTA')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should show start button after all lines revealed', () => {
    vi.useFakeTimers();

    act(() => {
      useGameStore.getState().selectClass('santa');
    });

    render(<MissionBriefing />);

    // Advance timers line by line
    for (let i = 0; i < 7; i++) {
      act(() => {
        vi.advanceTimersByTime(600);
      });
    }

    // Advance for the button delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByText('COMMENCE OPERATION')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('should transition to PHASE_1 when button clicked', () => {
    vi.useFakeTimers();

    act(() => {
      useGameStore.getState().selectClass('santa');
    });

    render(<MissionBriefing />);

    // Advance timers line by line
    for (let i = 0; i < 7; i++) {
      act(() => {
        vi.advanceTimersByTime(600);
      });
    }

    // Advance for the button delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const startButton = screen.getByText('COMMENCE OPERATION');

    act(() => {
      startButton.click();
    });

    expect(useGameStore.getState().state).toBe('PHASE_1');
    expect(AudioManager.playMusic).toHaveBeenCalledWith('combat');

    vi.useRealTimers();
  });
});
