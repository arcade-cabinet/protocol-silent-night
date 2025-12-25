/**
 * Fur Shader Utilities
 * Re-exports from @jbcom/strata with custom extensions for game characters
 */

// Re-export Strata's fur system
export {
  createFurMaterial,
  createFurSystem,
  updateFurUniforms,
  type FurOptions,
  type FurUniforms,
} from '@jbcom/strata';

// Also export shaders for custom use cases
export {
  furVertexShader,
  furFragmentShader,
  createFurUniforms,
  defaultFurConfig,
  type FurConfig,
} from '@jbcom/strata';
