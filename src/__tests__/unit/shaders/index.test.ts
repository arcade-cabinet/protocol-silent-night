import { describe, expect, it } from 'vitest';
import * as ShaderExports from '../../../shaders/index';

describe('Shaders Index Exports', () => {
  it('should export terrainVertexShader', () => {
    expect(ShaderExports.terrainVertexShader).toBeDefined();
    expect(typeof ShaderExports.terrainVertexShader).toBe('string');
  });

  it('should export terrainFragmentShader', () => {
    expect(ShaderExports.terrainFragmentShader).toBeDefined();
    expect(typeof ShaderExports.terrainFragmentShader).toBe('string');
  });

  it('should export all shader strings', () => {
    const expectedExports = ['terrainVertexShader', 'terrainFragmentShader'];

    expectedExports.forEach((exportName) => {
      expect(ShaderExports).toHaveProperty(exportName);
    });
  });

  it('should have non-empty shader strings', () => {
    expect(ShaderExports.terrainVertexShader.length).toBeGreaterThan(0);
    expect(ShaderExports.terrainFragmentShader.length).toBeGreaterThan(0);
  });

  it('should have valid GLSL shader syntax markers', () => {
    // Check for common GLSL keywords
    const vertexShader = ShaderExports.terrainVertexShader;
    const fragmentShader = ShaderExports.terrainFragmentShader;

    // Vertex shader should contain position-related keywords
    expect(
      vertexShader.includes('attribute') ||
        vertexShader.includes('varying') ||
        vertexShader.includes('uniform')
    ).toBe(true);

    // Fragment shader should contain color-related keywords
    expect(
      fragmentShader.includes('varying') ||
        fragmentShader.includes('uniform') ||
        fragmentShader.includes('gl_FragColor')
    ).toBe(true);
  });

  it('should have correct number of exports', () => {
    const exportCount = Object.keys(ShaderExports).length;
    // Should export at least terrainVertexShader, terrainFragmentShader, and fur-related exports
    expect(exportCount).toBeGreaterThanOrEqual(2);
  });
});
