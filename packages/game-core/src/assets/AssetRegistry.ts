/**
 * Asset Registry - Single Source of Truth
 *
 * Provides unified asset references that work across platforms.
 * Assets are stored in packages/game-core/assets/ and referenced
 * via this registry.
 *
 * Platform-specific loaders (React Native, Web) implement the
 * actual loading mechanism.
 */

// ============================================================================
// TYPES
// ============================================================================

export type AudioCategory = 'ui' | 'sfx' | 'weapons' | 'jingles' | 'music' | 'ambient';
export type MaterialCategory = 'metal' | 'concrete' | 'ice' | 'tiles';
export type SkyboxPreset = 'night_clear' | 'night_clouds' | 'night_industrial' | 'environment_dark' | 'environment_blue';

export interface AssetPath {
  /** Relative path from game-core/assets/ */
  path: string;
  /** Asset category for organization */
  category: string;
  /** Optional fallback path */
  fallback?: string;
}

// ============================================================================
// AUDIO ASSETS
// ============================================================================

export const AudioAssets = {
  // UI Sounds (Kenney UI Audio)
  ui: {
    click: { path: 'audio/ui/click.ogg', category: 'ui' },
    click_alt: { path: 'audio/ui/click-alt.ogg', category: 'ui' },
    confirm: { path: 'audio/ui/confirm.ogg', category: 'ui' },
    cancel: { path: 'audio/ui/cancel.ogg', category: 'ui' },
    hover: { path: 'audio/ui/hover.ogg', category: 'ui' },
    hover_alt: { path: 'audio/ui/hover-alt.ogg', category: 'ui' },
    toggle: { path: 'audio/ui/toggle.ogg', category: 'ui' },
    select: { path: 'audio/ui/select.ogg', category: 'ui' },
  },

  // Weapon Sounds (Kenney Sci-Fi Audio)
  weapons: {
    laser_single: { path: 'audio/weapons/laser-single.ogg', category: 'weapons' },
    laser_rapid: { path: 'audio/weapons/laser-rapid.ogg', category: 'weapons' },
    laser_heavy: { path: 'audio/weapons/laser-heavy.ogg', category: 'weapons' },
    laser_spread: { path: 'audio/weapons/laser-spread.ogg', category: 'weapons' },
    zap: { path: 'audio/weapons/zap.ogg', category: 'weapons' },
    zap_alt: { path: 'audio/weapons/zap-alt.ogg', category: 'weapons' },
    laser_boss: { path: 'audio/weapons/laser-boss.ogg', category: 'weapons' },
    laser_retro: { path: 'audio/weapons/laser-retro.ogg', category: 'weapons' },
  },

  // SFX (Kenney Impact/Footstep Audio)
  sfx: {
    explosion_small: { path: 'audio/sfx/explosion-small.ogg', category: 'sfx' },
    explosion_medium: { path: 'audio/sfx/explosion-medium.ogg', category: 'sfx' },
    explosion_large: { path: 'audio/sfx/explosion-large.ogg', category: 'sfx' },
    footstep_snow_1: { path: 'audio/sfx/footstep-snow-1.ogg', category: 'sfx' },
    footstep_snow_2: { path: 'audio/sfx/footstep-snow-2.ogg', category: 'sfx' },
    footstep_snow_3: { path: 'audio/sfx/footstep-snow-3.ogg', category: 'sfx' },
    footstep_snow_4: { path: 'audio/sfx/footstep-snow-4.ogg', category: 'sfx' },
    impact_glass: { path: 'audio/sfx/impact-glass.ogg', category: 'sfx' },
    impact_metal: { path: 'audio/sfx/impact-metal.ogg', category: 'sfx' },
    powerup: { path: 'audio/sfx/powerup.ogg', category: 'sfx' },
    level_up: { path: 'audio/sfx/level-up.ogg', category: 'sfx' },
    damage: { path: 'audio/sfx/damage.ogg', category: 'sfx' },
  },

  // Jingles (Kenney Music Jingles Retro)
  jingles: {
    victory: { path: 'audio/jingles/victory.ogg', category: 'jingles' },
    defeat: { path: 'audio/jingles/defeat.ogg', category: 'jingles' },
    level_complete: { path: 'audio/jingles/level-complete.ogg', category: 'jingles' },
    boss_intro: { path: 'audio/jingles/boss-intro.ogg', category: 'jingles' },
    wave_complete: { path: 'audio/jingles/wave-complete.ogg', category: 'jingles' },
    achievement: { path: 'audio/jingles/achievement.ogg', category: 'jingles' },
    fanfare: { path: 'audio/jingles/fanfare.ogg', category: 'jingles' },
  },
} as const;

// ============================================================================
// MATERIAL ASSETS (PBR Textures)
// ============================================================================

export const MaterialAssets = {
  metal: {
    Metal001: {
      diffuse: { path: 'materials/Metal001/diffuse.jpg', category: 'metal' },
      normal: { path: 'materials/Metal001/normal.jpg', category: 'metal' },
      roughness: { path: 'materials/Metal001/roughness.jpg', category: 'metal' },
      metallic: { path: 'materials/Metal001/metallic.jpg', category: 'metal' },
    },
    Metal008: {
      diffuse: { path: 'materials/Metal008/diffuse.jpg', category: 'metal' },
      normal: { path: 'materials/Metal008/normal.jpg', category: 'metal' },
      roughness: { path: 'materials/Metal008/roughness.jpg', category: 'metal' },
      metallic: { path: 'materials/Metal008/metallic.jpg', category: 'metal' },
    },
    Metal015: {
      diffuse: { path: 'materials/Metal015/diffuse.jpg', category: 'metal' },
      normal: { path: 'materials/Metal015/normal.jpg', category: 'metal' },
      roughness: { path: 'materials/Metal015/roughness.jpg', category: 'metal' },
      metallic: { path: 'materials/Metal015/metallic.jpg', category: 'metal' },
    },
    Metal030: {
      diffuse: { path: 'materials/Metal030/diffuse.jpg', category: 'metal' },
      normal: { path: 'materials/Metal030/normal.jpg', category: 'metal' },
      roughness: { path: 'materials/Metal030/roughness.jpg', category: 'metal' },
      metallic: { path: 'materials/Metal030/metallic.jpg', category: 'metal' },
    },
  },
  concrete: {
    Concrete003: {
      diffuse: { path: 'materials/Concrete003/diffuse.jpg', category: 'concrete' },
      normal: { path: 'materials/Concrete003/normal.jpg', category: 'concrete' },
      roughness: { path: 'materials/Concrete003/roughness.jpg', category: 'concrete' },
      ao: { path: 'materials/Concrete003/ao.jpg', category: 'concrete' },
    },
    Concrete015: {
      diffuse: { path: 'materials/Concrete015/diffuse.jpg', category: 'concrete' },
      normal: { path: 'materials/Concrete015/normal.jpg', category: 'concrete' },
      roughness: { path: 'materials/Concrete015/roughness.jpg', category: 'concrete' },
    },
    Concrete025: {
      diffuse: { path: 'materials/Concrete025/diffuse.jpg', category: 'concrete' },
      normal: { path: 'materials/Concrete025/normal.jpg', category: 'concrete' },
      roughness: { path: 'materials/Concrete025/roughness.jpg', category: 'concrete' },
      ao: { path: 'materials/Concrete025/ao.jpg', category: 'concrete' },
    },
  },
} as const;

// ============================================================================
// SKYBOX ASSETS (HDRIs)
// ============================================================================

export const SkyboxAssets = {
  night_clear: {
    hdr: { path: 'skyboxes/EveningSkyHDRI001A_1K_HDR.exr', category: 'skybox' },
    tonemapped: { path: 'skyboxes/EveningSkyHDRI001A_1K_TONEMAPPED.jpg', category: 'skybox' },
  },
  night_clouds: {
    hdr: { path: 'skyboxes/EveningSkyHDRI005A_1K_HDR.exr', category: 'skybox' },
    tonemapped: { path: 'skyboxes/EveningSkyHDRI005A_1K_TONEMAPPED.jpg', category: 'skybox' },
  },
  night_industrial: {
    hdr: { path: 'skyboxes/EveningSkyHDRI010A_1K_HDR.exr', category: 'skybox' },
    tonemapped: { path: 'skyboxes/EveningSkyHDRI010A_1K_TONEMAPPED.jpg', category: 'skybox' },
  },
  environment_dark: {
    hdr: { path: 'skyboxes/EveningEnvironmentHDRI001_1K_HDR.exr', category: 'skybox' },
    tonemapped: { path: 'skyboxes/EveningEnvironmentHDRI001_1K_TONEMAPPED.jpg', category: 'skybox' },
  },
  environment_blue: {
    hdr: { path: 'skyboxes/EveningEnvironmentHDRI003_1K_HDR.exr', category: 'skybox' },
    tonemapped: { path: 'skyboxes/EveningEnvironmentHDRI003_1K_TONEMAPPED.jpg', category: 'skybox' },
  },
} as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type UISoundKey = keyof typeof AudioAssets.ui;
export type WeaponSoundKey = keyof typeof AudioAssets.weapons;
export type SFXSoundKey = keyof typeof AudioAssets.sfx;
export type JingleSoundKey = keyof typeof AudioAssets.jingles;
export type MetalMaterialKey = keyof typeof MaterialAssets.metal;
export type ConcreteMaterialKey = keyof typeof MaterialAssets.concrete;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the full asset path relative to game-core package root
 */
export function getAssetPath(assetPath: AssetPath): string {
  return `@protocol-silent-night/game-core/assets/${assetPath.path}`;
}

/**
 * Get all audio asset paths for a category
 */
export function getAudioCategory(category: keyof typeof AudioAssets): Record<string, AssetPath> {
  return AudioAssets[category];
}

/**
 * Get all material textures for a material
 */
export function getMaterialTextures(
  category: keyof typeof MaterialAssets,
  material: string
): Record<string, AssetPath> | undefined {
  const cat = MaterialAssets[category] as Record<string, Record<string, AssetPath>>;
  return cat[material];
}

/**
 * Get skybox textures (HDR or tonemapped)
 */
export function getSkyboxTextures(preset: SkyboxPreset): { hdr: AssetPath; tonemapped: AssetPath } {
  return SkyboxAssets[preset];
}
