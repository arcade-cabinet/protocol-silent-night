/**
 * Metro configuration for Protocol: Silent Night
 *
 * Configures Metro to resolve assets from the shared game-core package,
 * enabling a single source of truth for all game assets across platforms.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the monorepo root (two levels up from apps/mobile)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Resolve game-core assets directory
config.resolver.extraNodeModules = {
  '@protocol-silent-night/game-core': path.resolve(
    monorepoRoot,
    'packages/game-core'
  ),
};

// 4. Add asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  // Audio formats
  'ogg',
  'mp3',
  'wav',
  'flac',
  // Image/texture formats
  'exr',
  'hdr',
  'ktx',
  'ktx2',
  // 3D model formats
  'glb',
  'gltf',
  'fbx',
  'obj',
];

// 5. Include game-core assets in resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
