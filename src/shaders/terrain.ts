/**
 * Terrain Shaders - Tron-Grid aesthetic with height-based coloring
 */

export const terrainVertexShader = /* glsl */ `
  varying float vHeight;
  varying vec3 vWorldPosition;
  
  void main() {
    vHeight = instanceMatrix[3][1];
    vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const terrainFragmentShader = /* glsl */ `
  varying float vHeight;
  varying vec3 vWorldPosition;
  
  void main() {
    // Dark blue to icy blue gradient based on height
    vec3 darkBlue = vec3(0.02, 0.05, 0.1);
    vec3 icyBlue = vec3(0.1, 0.4, 0.6);
    vec3 glowBlue = vec3(0.3, 0.7, 1.0);
    
    // Height gradient
    float h = smoothstep(-5.0, 5.0, vHeight);
    vec3 col = mix(darkBlue, icyBlue, h);
    
    // Grid edge glow effect
    vec2 gridUv = fract(vWorldPosition.xz * 0.5);
    float gridLine = smoothstep(0.02, 0.0, abs(gridUv.x - 0.5)) + 
                     smoothstep(0.02, 0.0, abs(gridUv.y - 0.5));
    gridLine = clamp(gridLine, 0.0, 1.0);
    
    // Add glow on elevated areas
    if (vHeight > 0.5) {
      col += glowBlue * 0.2;
    }
    
    // Add grid lines
    col += glowBlue * gridLine * 0.15;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createTerrainUniforms() {
  return {
    time: { value: 0 },
  };
}
