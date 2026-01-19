/**
 * Asset Bridge - React Native Implementation
 *
 * Maps asset registry paths to actual require() statements for Metro bundling.
 * This file uses static require() calls which Metro can analyze at build time.
 *
 * NOTE: This file must use static require() calls - dynamic requires won't work
 * with Metro's bundling system.
 */

// ============================================================================
// AUDIO ASSETS - Static requires for Metro
// ============================================================================

export const AudioSources = {
  // UI Sounds
  ui: {
    click: require('../../assets/audio/ui/click.ogg'),
    click_alt: require('../../assets/audio/ui/click-alt.ogg'),
    confirm: require('../../assets/audio/ui/confirm.ogg'),
    cancel: require('../../assets/audio/ui/cancel.ogg'),
    hover: require('../../assets/audio/ui/hover.ogg'),
    hover_alt: require('../../assets/audio/ui/hover-alt.ogg'),
    toggle: require('../../assets/audio/ui/toggle.ogg'),
    select: require('../../assets/audio/ui/select.ogg'),
  },

  // Weapon Sounds
  weapons: {
    laser_single: require('../../assets/audio/weapons/laser-single.ogg'),
    laser_rapid: require('../../assets/audio/weapons/laser-rapid.ogg'),
    laser_heavy: require('../../assets/audio/weapons/laser-heavy.ogg'),
    laser_spread: require('../../assets/audio/weapons/laser-spread.ogg'),
    zap: require('../../assets/audio/weapons/zap.ogg'),
    zap_alt: require('../../assets/audio/weapons/zap-alt.ogg'),
    laser_boss: require('../../assets/audio/weapons/laser-boss.ogg'),
    laser_retro: require('../../assets/audio/weapons/laser-retro.ogg'),
  },

  // SFX
  sfx: {
    explosion_small: require('../../assets/audio/sfx/explosion-small.ogg'),
    explosion_medium: require('../../assets/audio/sfx/explosion-medium.ogg'),
    explosion_large: require('../../assets/audio/sfx/explosion-large.ogg'),
    footstep_snow_1: require('../../assets/audio/sfx/footstep-snow-1.ogg'),
    footstep_snow_2: require('../../assets/audio/sfx/footstep-snow-2.ogg'),
    footstep_snow_3: require('../../assets/audio/sfx/footstep-snow-3.ogg'),
    footstep_snow_4: require('../../assets/audio/sfx/footstep-snow-4.ogg'),
    impact_glass: require('../../assets/audio/sfx/impact-glass.ogg'),
    impact_metal: require('../../assets/audio/sfx/impact-metal.ogg'),
    powerup: require('../../assets/audio/sfx/powerup.ogg'),
    level_up: require('../../assets/audio/sfx/level-up.ogg'),
    damage: require('../../assets/audio/sfx/damage.ogg'),
  },

  // Jingles
  jingles: {
    victory: require('../../assets/audio/jingles/victory.ogg'),
    defeat: require('../../assets/audio/jingles/defeat.ogg'),
    level_complete: require('../../assets/audio/jingles/level-complete.ogg'),
    boss_intro: require('../../assets/audio/jingles/boss-intro.ogg'),
    wave_complete: require('../../assets/audio/jingles/wave-complete.ogg'),
    achievement: require('../../assets/audio/jingles/achievement.ogg'),
    fanfare: require('../../assets/audio/jingles/fanfare.ogg'),
  },
} as const;

// ============================================================================
// MATERIAL TEXTURES - Static requires for Metro
// ============================================================================

export const MaterialSources = {
  metal: {
    Metal001: {
      diffuse: require('../../assets/materials/Metal001/diffuse.jpg'),
      normal: require('../../assets/materials/Metal001/normal.jpg'),
      roughness: require('../../assets/materials/Metal001/roughness.jpg'),
      metallic: require('../../assets/materials/Metal001/metallic.jpg'),
    },
    Metal008: {
      diffuse: require('../../assets/materials/Metal008/diffuse.jpg'),
      normal: require('../../assets/materials/Metal008/normal.jpg'),
      roughness: require('../../assets/materials/Metal008/roughness.jpg'),
      metallic: require('../../assets/materials/Metal008/metallic.jpg'),
    },
    Metal015: {
      diffuse: require('../../assets/materials/Metal015/diffuse.jpg'),
      normal: require('../../assets/materials/Metal015/normal.jpg'),
      roughness: require('../../assets/materials/Metal015/roughness.jpg'),
      metallic: require('../../assets/materials/Metal015/metallic.jpg'),
    },
    Metal030: {
      diffuse: require('../../assets/materials/Metal030/diffuse.jpg'),
      normal: require('../../assets/materials/Metal030/normal.jpg'),
      roughness: require('../../assets/materials/Metal030/roughness.jpg'),
      metallic: require('../../assets/materials/Metal030/metallic.jpg'),
    },
  },
  concrete: {
    Concrete003: {
      diffuse: require('../../assets/materials/Concrete003/diffuse.jpg'),
      normal: require('../../assets/materials/Concrete003/normal.jpg'),
      roughness: require('../../assets/materials/Concrete003/roughness.jpg'),
    },
    Concrete015: {
      diffuse: require('../../assets/materials/Concrete015/diffuse.jpg'),
      normal: require('../../assets/materials/Concrete015/normal.jpg'),
      roughness: require('../../assets/materials/Concrete015/roughness.jpg'),
    },
    Concrete025: {
      diffuse: require('../../assets/materials/Concrete025/diffuse.jpg'),
      normal: require('../../assets/materials/Concrete025/normal.jpg'),
      roughness: require('../../assets/materials/Concrete025/roughness.jpg'),
    },
  },
} as const;

// ============================================================================
// SKYBOX TEXTURES - Static requires for Metro
// ============================================================================

export const SkyboxSources = {
  night_clear: {
    hdr: require('../../assets/skyboxes/EveningSkyHDRI001A_1K_HDR.exr'),
    tonemapped: require('../../assets/skyboxes/EveningSkyHDRI001A_1K_TONEMAPPED.jpg'),
  },
  night_clouds: {
    hdr: require('../../assets/skyboxes/EveningSkyHDRI005A_1K_HDR.exr'),
    tonemapped: require('../../assets/skyboxes/EveningSkyHDRI005A_1K_TONEMAPPED.jpg'),
  },
  night_industrial: {
    hdr: require('../../assets/skyboxes/EveningSkyHDRI010A_1K_HDR.exr'),
    tonemapped: require('../../assets/skyboxes/EveningSkyHDRI010A_1K_TONEMAPPED.jpg'),
  },
  environment_dark: {
    hdr: require('../../assets/skyboxes/EveningEnvironmentHDRI001_1K_HDR.exr'),
    tonemapped: require('../../assets/skyboxes/EveningEnvironmentHDRI001_1K_TONEMAPPED.jpg'),
  },
  environment_blue: {
    hdr: require('../../assets/skyboxes/EveningEnvironmentHDRI003_1K_HDR.exr'),
    tonemapped: require('../../assets/skyboxes/EveningEnvironmentHDRI003_1K_TONEMAPPED.jpg'),
  },
} as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type AudioSource = number; // Metro returns a number for require()
export type UISoundKey = keyof typeof AudioSources.ui;
export type WeaponSoundKey = keyof typeof AudioSources.weapons;
export type SFXSoundKey = keyof typeof AudioSources.sfx;
export type JingleSoundKey = keyof typeof AudioSources.jingles;
