
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
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
  const triggerRef = createRef<HTMLButtonElement>();

  beforeEach(() => {
    onCloseMock.mockClear();
    // Reset store state
    useGameStore.setState({
      metaProgress: {
        nicePoints: 1000,
        totalPointsEarned: 1000,
        runsCompleted: 0,
        bossesDefeated: 0,
        unlockedWeapons: [],
        unlockedSkins: [],
        permanentUpgrades: {},
        highScore: 0,
        totalKills: 0,
        totalDeaths: 0,
      },
    });
  });

  it('should render with accessibility roles', () => {
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    // Check for dialog role
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'workshop-title');

    // Check for tablist
    const tablist = screen.getByLabelText('Workshop Categories');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('role', 'tablist');

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
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

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
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    const weaponsTab = screen.getByRole('tab', { name: 'Weapons' });
    const panel = screen.getByRole('tabpanel');

    expect(weaponsTab).toHaveAttribute('aria-controls', 'panel-weapons');
    expect(panel).toHaveAttribute('id', 'panel-weapons');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-weapons');
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    const closeButton = screen.getByRole('button', { name: 'Close Workshop' });
    await user.click(closeButton);

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should navigate tabs with arrow keys', async () => {
    const user = userEvent.setup();
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    const weaponsTab = screen.getByRole('tab', { name: 'Weapons' });
    const skinsTab = screen.getByRole('tab', { name: 'Skins' });
    const upgradesTab = screen.getByRole('tab', { name: 'Upgrades' });

    // Focus the first tab
    weaponsTab.focus();
    expect(weaponsTab).toHaveFocus();

    // Navigate right
    await user.keyboard('{arrowright}');
    expect(skinsTab).toHaveFocus();
    expect(skinsTab).toHaveAttribute('aria-selected', 'true');

    // Navigate right again
    await user.keyboard('{arrowright}');
    expect(upgradesTab).toHaveFocus();
    expect(upgradesTab).toHaveAttribute('aria-selected', 'true');

    // Navigate left
    await user.keyboard('{arrowleft}');
    expect(skinsTab).toHaveFocus();
    expect(skinsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('should trap focus within the modal', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />,
    );

    const closeButton = screen.getByRole('button', { name: 'Close Workshop' });
    const weaponsTab = screen.getByRole('tab', { name: 'Weapons' });
    const upgradesTab = screen.getByRole('tab', { name: 'Upgrades' });

    // Focus should be on the close button initially
    expect(closeButton).toHaveFocus();

    // Tab to the next element (weapons tab)
    await user.tab();
    expect(weaponsTab).toHaveFocus();

    // Switch to upgrades tab to make last button visible
    await user.click(upgradesTab);

    // Find the last focusable element using the same logic as the component
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const lastPurchaseButton = focusableElements[focusableElements.length - 1];
    expect(lastPurchaseButton).toHaveAccessibleName(/Upgrade/); // Verify it's an upgrade button
    lastPurchaseButton.focus();
    expect(lastPurchaseButton).toHaveFocus();

    // Tab again, should wrap to the first element (close button)
    await user.tab();
    expect(closeButton).toHaveFocus();

    // Shift+Tab from first element should wrap to the last
    await user.tab({ shift: true });
    expect(lastPurchaseButton).toHaveFocus();
  });

  it('should call onClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    await user.keyboard('{escape}');
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('should have descriptive aria-labels for purchase buttons', () => {
    render(<SantasWorkshop show={true} onClose={onCloseMock} triggerRef={triggerRef} />);

    // The accessible name is the aria-label, so we query by that.
    const unlockButton = screen.getByRole('button', {
      name: 'Unlock Snowball Launcher for 500 Nice Points',
    });
    expect(unlockButton).toBeInTheDocument();
  });
});
