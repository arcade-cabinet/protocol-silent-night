/**
 * Fur Shader Utilities
 * Re-exports from @jbcom/strata for fur rendering
 */

// Re-export Strata's fur system from presets
export {
  createFurMaterial,
  createFurSystem,
  updateFurUniforms,
  type FurOptions,
  type FurUniforms,
} from '@jbcom/strata';

// Re-export shaders for custom use cases
export {
  furVertexShader,
  furFragmentShader,
  createFurUniforms,
  defaultFurConfig,
  type FurConfig,
} from '@jbcom/strata';
