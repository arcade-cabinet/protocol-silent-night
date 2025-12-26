/**
 * Fur Shader Utilities
 * Re-exports from @jbcom/strata for fur rendering
 */

// Re-export Strata's fur system from presets
// Re-export shaders for custom use cases
export {
  createFurMaterial,
  createFurSystem,
  createFurUniforms,
  defaultFurConfig,
  type FurConfig,
  type FurOptions,
  type FurUniforms,
  furFragmentShader,
  furVertexShader,
  updateFurUniforms,
} from '@jbcom/strata';
