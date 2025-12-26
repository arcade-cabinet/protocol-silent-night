import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioSettings } from '../../../ui/AudioSettings';
import { AudioManager } from '../../../audio/AudioManager';

// Mock AudioManager
vi.mock('../../../audio/AudioManager', () => ({
  AudioManager: {
    getSettings: vi.fn(() => ({
      masterVolume: 0.5,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      musicEnabled: true,
      sfxEnabled: true,
      currentTrack: null,
    })),
    setMasterVolume: vi.fn(),
    setMusicVolume: vi.fn(),
    setSFXVolume: vi.fn(),
    toggleMusic: vi.fn(),
    toggleSFX: vi.fn(),
  },
}));

describe('AudioSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render audio settings toggle button', () => {
    render(<AudioSettings />);
    
    const toggleButton = screen.getByLabelText('Audio Settings');
    expect(toggleButton).toBeInTheDocument();
  });

  it('should open audio settings panel when toggle button is clicked', async () => {
    render(<AudioSettings />);
    
    const toggleButton = screen.getByLabelText('Audio Settings');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Audio Settings')).toBeInTheDocument();
    });
  });

  it('should display volume sliders when panel is open', async () => {
    render(<AudioSettings />);
    
    const toggleButton = screen.getByLabelText('Audio Settings');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
    });
  });

  it('should update master volume when slider changes', async () => {
    render(<AudioSettings />);
    
    fireEvent.click(screen.getByLabelText('Audio Settings'));
    
    await waitFor(() => {
      const masterSlider = screen.getByLabelText(/Master Volume/i);
      fireEvent.change(masterSlider, { target: { value: '0.6' } });
    });
    
    expect(AudioManager.setMasterVolume).toHaveBeenCalledWith(0.6);
  });

  it('should toggle music enabled state', async () => {
    render(<AudioSettings />);
    
    fireEvent.click(screen.getByLabelText('Audio Settings'));
    
    await waitFor(() => {
      const musicCheckbox = screen.getByRole('checkbox', { name: /Music/i });
      fireEvent.click(musicCheckbox);
    });
    
    expect(AudioManager.toggleMusic).toHaveBeenCalled();
  });

  it('should toggle SFX enabled state', async () => {
    render(<AudioSettings />);
    
    fireEvent.click(screen.getByLabelText('Audio Settings'));
    
    await waitFor(() => {
      const sfxCheckbox = screen.getByRole('checkbox', { name: /Sound Effects/i });
      fireEvent.click(sfxCheckbox);
    });
    
    expect(AudioManager.toggleSFX).toHaveBeenCalled();
  });

  it('should display volume percentages', async () => {
    render(<AudioSettings />);
    
    fireEvent.click(screen.getByLabelText('Audio Settings'));
    
    await waitFor(() => {
      expect(screen.getByText(/50%/)).toBeInTheDocument();
      expect(screen.getByText(/70%/)).toBeInTheDocument();
      expect(screen.getByText(/80%/)).toBeInTheDocument();
    });
  });

  it('should close panel when toggle button is clicked again', async () => {
    render(<AudioSettings />);
    
    const toggleButton = screen.getByLabelText('Audio Settings');
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Audio Settings')).toBeInTheDocument();
    });
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Audio Settings')).not.toBeInTheDocument();
    });
  });

  it('should display current track when available', async () => {
    (AudioManager.getSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      masterVolume: 0.5,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      musicEnabled: true,
      sfxEnabled: true,
      currentTrack: 'combat',
    });
    
    render(<AudioSettings />);
    
    fireEvent.click(screen.getByLabelText('Audio Settings'));
    
    await waitFor(() => {
      expect(screen.getByText(/Now playing: combat/i)).toBeInTheDocument();
    });
  });
});
