
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SantasWorkshop } from '@/ui/SantasWorkshop';
import { useGameStore } from '@/store/gameStore';

// Mock AudioManager to avoid playing sounds during tests
vi.mock('@/audio/AudioManager', () => ({
  AudioManager: {
    playSFX: vi.fn(),
  },
}));

describe('SantasWorkshop Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    // Reset store state
    useGameStore.setState({
      metaProgress: {
        nicePoints: 1000,
        unlockedWeapons: [],
        unlockedSkins: [],
        permanentUpgrades: {},
        totalPointsEarned: 1000,
        runsCompleted: 0,
        bossesDefeated: 0,
        highScore: 0,
        totalKills: 0,
        totalDeaths: 0,
      },
    });
  });

  it('should render with accessibility roles', () => {
    render(<SantasWorkshop show={true} onClose={onCloseMock} />);

    // Check for tablist
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    // Check for tabs
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    // Check for correct accessible names
    expect(screen.getByRole('tab', { name: 'Weapons' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Skins' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Upgrades' })).toBeInTheDocument();

    // Check for close button label
    expect(screen.getByRole('button', { name: 'Close Workshop' })).toBeInTheDocument();
  });

  it('should indicate active tab with aria-selected', async () => {
    const user = userEvent.setup();
    render(<SantasWorkshop show={true} onClose={onCloseMock} />);

    const weaponsTab = screen.getByRole('tab', { name: 'Weapons' });
    const skinsTab = screen.getByRole('tab', { name: 'Skins' });

    // Initially Weapons is selected
    expect(weaponsTab).toHaveAttribute('aria-selected', 'true');
    expect(skinsTab).toHaveAttribute('aria-selected', 'false');

    // Click Skins
    await user.click(skinsTab);

    // Now Skins is selected
    expect(weaponsTab).toHaveAttribute('aria-selected', 'false');
    expect(skinsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should link tabs to panels', () => {
    render(<SantasWorkshop show={true} onClose={onCloseMock} />);

    const weaponsTab = screen.getByRole('tab', { name: 'Weapons' });
    const panel = screen.getByRole('tabpanel');

    expect(weaponsTab).toHaveAttribute('aria-controls', 'panel-weapons');
    expect(panel).toHaveAttribute('id', 'panel-weapons');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-weapons');
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SantasWorkshop show={true} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button', { name: 'Close Workshop' });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
