import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import { StartScreen } from '@/ui/StartScreen';

// Mock SantasWorkshop to avoid complex dependency issues in unit test
vi.mock('@/ui', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    SantasWorkshop: () => <div data-testid="santas-workshop" />,
    WorkshopButton: ({ onOpen }: any) => <button onClick={onOpen}>🎄 SANTA'S WORKSHOP</button>,
  };
});

describe('StartScreen Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    localStorage.clear();
  });

  it('should render in MENU state', () => {
    render(<StartScreen />);

    expect(screen.getByText('Protocol:')).toBeInTheDocument();
    expect(screen.getByText('Silent Night')).toBeInTheDocument();
  });

  it('should not render when not in MENU state', () => {
    useGameStore.getState().selectClass('santa');

    const { container } = render(<StartScreen />);

    expect(container.firstChild).toBeNull();
  });

  it('should display all three character classes', () => {
    render(<StartScreen />);

    expect(screen.getByText('MECHA-SANTA')).toBeInTheDocument();
    expect(screen.getByText('CYBER-ELF')).toBeInTheDocument();
    expect(screen.getByText('THE BUMBLE')).toBeInTheDocument();
  });

  it('should display character roles', () => {
    render(<StartScreen />);

    expect(screen.getByText('Heavy Siege / Tank')).toBeInTheDocument();
    expect(screen.getByText('Recon / Scout')).toBeInTheDocument();
    expect(screen.getByText('Crowd Control / Bruiser')).toBeInTheDocument();
  });

  it('should display Santa stats correctly', () => {
    render(<StartScreen />);

    const santaCard = screen.getByRole('button', { name: /MECHA-SANTA/ });
    expect(santaCard).toHaveTextContent('300');
    expect(santaCard).toHaveTextContent('9');
    expect(santaCard).toHaveTextContent('COAL CANNON');
  });

  it('should display Elf stats correctly', () => {
    render(<StartScreen />);

    const elfCard = screen.getByRole('button', { name: /CYBER-ELF/ });
    expect(elfCard).toHaveTextContent('100');
    expect(elfCard).toHaveTextContent('18');
    expect(elfCard).toHaveTextContent('PLASMA SMG');
  });

  it('should display Bumble stats correctly', () => {
    render(<StartScreen />);

    const bumbleCard = screen.getByRole('button', { name: /BUMBLE/ });
    expect(bumbleCard).toHaveTextContent('200');
    expect(bumbleCard).toHaveTextContent('12');
    expect(bumbleCard).toHaveTextContent('STAR THROWER');
  });

  it('should display control instructions', () => {
    render(<StartScreen />);

    expect(screen.getByText(/WASD or Arrow Keys/)).toBeInTheDocument();
    expect(screen.getByText(/SPACE or Click to fire/)).toBeInTheDocument();
  });

  it('should select Santa when button clicked', async () => {
    const user = userEvent.setup();
    render(<StartScreen />);

    const santaButton = screen.getByRole('button', { name: /MECHA-SANTA/ });
    await user.click(santaButton);

    const state = useGameStore.getState();
    expect(state.playerClass?.type).toBe('santa');
    expect(state.state).toBe('BRIEFING');
  });

  it('should select Elf when button clicked', async () => {
    const user = userEvent.setup();
    render(<StartScreen />);

    const elfButton = screen.getByRole('button', { name: /CYBER-ELF/ });
    await user.click(elfButton);

    const state = useGameStore.getState();
    expect(state.playerClass?.type).toBe('elf');
    expect(state.state).toBe('BRIEFING');
  });

  it('should select Bumble when button clicked', async () => {
    const user = userEvent.setup();
    render(<StartScreen />);

    const bumbleButton = screen.getByRole('button', { name: /BUMBLE/ });
    await user.click(bumbleButton);

    const state = useGameStore.getState();
    expect(state.playerClass?.type).toBe('bumble');
    expect(state.state).toBe('BRIEFING');
  });

  it('should not display high score when zero', () => {
    render(<StartScreen />);

    expect(screen.queryByText(/HIGH SCORE/)).not.toBeInTheDocument();
  });

  it('should display high score when present', () => {
    useGameStore.setState({ highScore: 5000 });

    render(<StartScreen />);

    expect(screen.getByText(/5000/)).toBeInTheDocument();
  });

  it('should display version number', () => {
    render(<StartScreen />);

    expect(screen.getByText(/Operator Edition v3.0/)).toBeInTheDocument();
  });

  it('should have clickable character cards', () => {
    render(<StartScreen />);

    const buttons = screen.getAllByRole('button');
    // 3 character cards + 1 workshop button
    expect(buttons).toHaveLength(4);

    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });
});
