import { useState, useEffect } from 'react';
import { AudioManager } from '../audio/AudioManager';
import styles from './AudioSettings.module.css';

export function AudioSettings() {
  const [settings, setSettings] = useState(AudioManager.getSettings());
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMusic = () => {
    AudioManager.toggleMusic();
    setSettings(AudioManager.getSettings());
  };

  const handleToggleSFX = () => {
    AudioManager.toggleSFX();
    setSettings(AudioManager.getSettings());
  };

  const handleMasterVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    AudioManager.setMasterVolume(Number.parseFloat(e.target.value));
    setSettings(AudioManager.getSettings());
  };

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    AudioManager.setMusicVolume(Number.parseFloat(e.target.value));
    setSettings(AudioManager.getSettings());
  };

  const handleSFXVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    AudioManager.setSFXVolume(Number.parseFloat(e.target.value));
    setSettings(AudioManager.getSettings());
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Audio Settings"
      >
        🎵
      </button>

      {isOpen && (
        <div className={styles.panel}>
          <h3 className={styles.title}>Audio Settings</h3>

          <div className={styles.setting}>
            <label htmlFor="music-toggle">
              <input
                id="music-toggle"
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={handleToggleMusic}
              />
              Music
            </label>
          </div>

          <div className={styles.setting}>
            <label htmlFor="sfx-toggle">
              <input
                id="sfx-toggle"
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={handleToggleSFX}
              />
              Sound Effects
            </label>
          </div>

          <div className={styles.setting}>
            <label htmlFor="master-volume">
              Master Volume: {Math.round(settings.masterVolume * 100)}%
            </label>
            <input
              id="master-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.masterVolume}
              onChange={handleMasterVolumeChange}
            />
          </div>

          <div className={styles.setting}>
            <label htmlFor="music-volume">
              Music Volume: {Math.round(settings.musicVolume * 100)}%
            </label>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.musicVolume}
              onChange={handleMusicVolumeChange}
              disabled={!settings.musicEnabled}
            />
          </div>

          <div className={styles.setting}>
            <label htmlFor="sfx-volume">
              SFX Volume: {Math.round(settings.sfxVolume * 100)}%
            </label>
            <input
              id="sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.sfxVolume}
              onChange={handleSFXVolumeChange}
              disabled={!settings.sfxEnabled}
            />
          </div>

          {settings.currentTrack && (
            <div className={styles.nowPlaying}>
              Now playing: {settings.currentTrack}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
