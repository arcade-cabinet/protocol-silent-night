/**
 * PBR Texture Loader
 *
 * Loads PBR texture sets from AmbientCG format.
 * Supports: Color, Normal, Roughness, Metalness, Displacement, AO
 */

import {
  type Scene,
  Texture,
  PBRMaterial,
  type Color3,
} from '@babylonjs/core';

// ============================================================================
// TYPES
// ============================================================================

export interface PBRTextureSet {
  color?: Texture;
  normal?: Texture;
  roughness?: Texture;
  metalness?: Texture;
  displacement?: Texture;
  ao?: Texture;
}

export interface PBRMaterialOptions {
  name: string;
  baseColor?: Color3;
  roughnessValue?: number;
  metallicValue?: number;
  useDisplacement?: boolean;
  tiling?: { u: number; v: number };
}

// Texture categories available
export type TextureCategory = 'terrain' | 'metal' | 'ice' | 'tiles' | 'decals';

// Available textures per category
const TEXTURE_CATALOG: Record<TextureCategory, string[]> = {
  terrain: ['Concrete017', 'Ground003'],
  metal: ['Metal007', 'Metal012', 'Metal026', 'Plastic006'],
  ice: ['Ice001', 'Ice002'],
  tiles: ['Tiles021', 'Tiles030'],
  decals: ['RoadLines001', 'ManholeCover003'],
};

// ============================================================================
// LOADER
// ============================================================================

/**
 * Load a PBR texture set from the assets directory
 */
export function loadPBRTextureSet(
  scene: Scene,
  category: TextureCategory,
  textureName: string
): PBRTextureSet {
  const basePath = `../../assets/textures/${category}/${textureName}/`;
  const prefix = `${textureName}_1K-JPG`;

  const textures: PBRTextureSet = {};

  // Color/Albedo
  try {
    textures.color = new Texture(`${basePath}${prefix}_Color.jpg`, scene);
  } catch {
    console.warn(`Color texture not found for ${textureName}`);
  }

  // Normal map (use OpenGL format for BabylonJS)
  try {
    textures.normal = new Texture(`${basePath}${prefix}_NormalGL.jpg`, scene);
  } catch {
    console.warn(`Normal texture not found for ${textureName}`);
  }

  // Roughness
  try {
    textures.roughness = new Texture(`${basePath}${prefix}_Roughness.jpg`, scene);
  } catch {
    console.warn(`Roughness texture not found for ${textureName}`);
  }

  // Metalness
  try {
    textures.metalness = new Texture(`${basePath}${prefix}_Metalness.jpg`, scene);
  } catch {
    console.warn(`Metalness texture not found for ${textureName}`);
  }

  // Displacement
  try {
    textures.displacement = new Texture(`${basePath}${prefix}_Displacement.jpg`, scene);
  } catch {
    console.warn(`Displacement texture not found for ${textureName}`);
  }

  return textures;
}

/**
 * Create a PBR material from a texture set
 */
export function createPBRMaterialFromTextures(
  scene: Scene,
  textures: PBRTextureSet,
  options: PBRMaterialOptions
): PBRMaterial {
  const material = new PBRMaterial(options.name, scene);

  // Base color
  if (textures.color) {
    material.albedoTexture = textures.color;
    if (options.tiling) {
      textures.color.uScale = options.tiling.u;
      textures.color.vScale = options.tiling.v;
    }
  }
  if (options.baseColor) {
    material.albedoColor = options.baseColor;
  }

  // Normal map
  if (textures.normal) {
    material.bumpTexture = textures.normal;
    if (options.tiling) {
      textures.normal.uScale = options.tiling.u;
      textures.normal.vScale = options.tiling.v;
    }
  }

  // Roughness
  if (textures.roughness) {
    material.metallicTexture = textures.roughness;
    material.useRoughnessFromMetallicTextureAlpha = false;
    material.useRoughnessFromMetallicTextureGreen = true;
    if (options.tiling) {
      textures.roughness.uScale = options.tiling.u;
      textures.roughness.vScale = options.tiling.v;
    }
  } else {
    material.roughness = options.roughnessValue ?? 0.5;
  }

  // Metalness
  if (textures.metalness) {
    material.metallicTexture = textures.metalness;
    material.useMetallnessFromMetallicTextureBlue = true;
    if (options.tiling) {
      textures.metalness.uScale = options.tiling.u;
      textures.metalness.vScale = options.tiling.v;
    }
  } else {
    material.metallic = options.metallicValue ?? 0.0;
  }

  // Environment reflections
  material.environmentIntensity = 0.8;

  return material;
}

/**
 * Create a complete PBR material from category and texture name
 */
export function createPBRMaterial(
  scene: Scene,
  category: TextureCategory,
  textureName: string,
  options?: Partial<PBRMaterialOptions>
): PBRMaterial {
  const textures = loadPBRTextureSet(scene, category, textureName);
  return createPBRMaterialFromTextures(scene, textures, {
    name: `${category}_${textureName}`,
    ...options,
  });
}

/**
 * Get available textures for a category
 */
export function getAvailableTextures(category: TextureCategory): string[] {
  return TEXTURE_CATALOG[category] ?? [];
}

/**
 * Preload all textures for a category
 */
export function preloadCategory(
  scene: Scene,
  category: TextureCategory
): Map<string, PBRTextureSet> {
  const textures = new Map<string, PBRTextureSet>();

  for (const textureName of TEXTURE_CATALOG[category]) {
    textures.set(textureName, loadPBRTextureSet(scene, category, textureName));
  }

  return textures;
}

// ============================================================================
// PRESET MATERIALS
// ============================================================================

/**
 * Create cyberpunk ground material
 */
export function createCyberpunkGroundMaterial(scene: Scene): PBRMaterial {
  return createPBRMaterial(scene, 'terrain', 'Concrete017', {
    name: 'cyberpunk_ground',
    tiling: { u: 20, v: 20 },
    roughnessValue: 0.7,
  });
}

/**
 * Create icy ground material
 */
export function createIcyGroundMaterial(scene: Scene): PBRMaterial {
  return createPBRMaterial(scene, 'ice', 'Ice001', {
    name: 'icy_ground',
    tiling: { u: 15, v: 15 },
    roughnessValue: 0.1,
    metallicValue: 0.2,
  });
}

/**
 * Create metal panel material for cyberpunk elements
 */
export function createMetalPanelMaterial(scene: Scene): PBRMaterial {
  return createPBRMaterial(scene, 'metal', 'Metal007', {
    name: 'metal_panel',
    tiling: { u: 4, v: 4 },
    metallicValue: 0.9,
    roughnessValue: 0.3,
  });
}

/**
 * Create sci-fi tile material
 */
export function createSciFiTileMaterial(scene: Scene): PBRMaterial {
  return createPBRMaterial(scene, 'tiles', 'Tiles030', {
    name: 'scifi_tiles',
    tiling: { u: 10, v: 10 },
    roughnessValue: 0.4,
  });
}
