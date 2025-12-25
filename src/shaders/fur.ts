/**
 * Fur Shell Shader - Layered alpha-tested shells for volumetric fur effect
 * Based on Strata's fur system with custom enhancements for game characters
 */

import * as THREE from 'three';

export const furVertexShader = /* glsl */ `
  uniform float layerOffset;
  uniform float spacing;
  uniform float time;
  uniform float windStrength;
  uniform float gravityDroop;
  
  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vLayer = layerOffset;
    vNormal = normalize(normalMatrix * normal);
    
    // Extrude along normal based on layer
    vec3 pos = position + normal * (layerOffset * spacing);
    
    // Enhanced wind effect on fur tips
    if (layerOffset > 0.3) {
      float windAmt = layerOffset * layerOffset * windStrength;
      pos.x += sin(time * 1.5 + position.y * 3.0 + position.z * 2.0) * 0.008 * windAmt;
      pos.z += cos(time * 1.8 + position.x * 2.5 + position.y * 3.0) * 0.006 * windAmt;
    }
    
    // Gravity droop - more pronounced at tips
    pos.y -= pow(layerOffset, 2.5) * gravityDroop;
    
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const furFragmentShader = /* glsl */ `
  uniform vec3 colorBase;
  uniform vec3 colorTip;
  uniform float time;
  
  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  // Noise function for fur strand variation
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); 
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  void main() {
    // Multi-octave noise for natural fur pattern
    float n = noise(vUv * 40.0) * 0.6 + noise(vUv * 80.0) * 0.4;
    
    // Alpha test - tapering strands toward tips
    float threshold = 0.35 + vLayer * 0.65;
    if (n < threshold) discard;
    
    // Color gradient from base to tip
    vec3 col = mix(colorBase, colorTip, vLayer);
    
    // Ambient occlusion at roots
    float ao = 0.4 + 0.6 * vLayer;
    col *= ao;
    
    // Rim lighting for depth
    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    col += vec3(0.15) * rim * vLayer;
    
    // Subtle specular highlight
    float spec = pow(rim, 4.0) * 0.3 * vLayer;
    col += vec3(spec);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface FurConfig {
  layers: number;
  spacing: number;
  colorBase: [number, number, number];
  colorTip: [number, number, number];
  windStrength?: number;
  gravityDroop?: number;
}

export const defaultFurConfig: FurConfig = {
  layers: 12,
  spacing: 0.025,
  colorBase: [0.3, 0.2, 0.1],
  colorTip: [0.6, 0.5, 0.3],
  windStrength: 1.0,
  gravityDroop: 0.04,
};

/**
 * Create fur material for a single shell layer
 */
export function createFurMaterial(
  layerIndex: number,
  totalLayers: number,
  config: Partial<FurConfig> = {}
): THREE.ShaderMaterial {
  const {
    spacing = defaultFurConfig.spacing,
    colorBase = defaultFurConfig.colorBase,
    colorTip = defaultFurConfig.colorTip,
    windStrength = defaultFurConfig.windStrength,
    gravityDroop = defaultFurConfig.gravityDroop,
  } = config;

  const layerOffset = layerIndex / totalLayers;

  return new THREE.ShaderMaterial({
    vertexShader: furVertexShader,
    fragmentShader: furFragmentShader,
    uniforms: {
      layerOffset: { value: layerOffset },
      spacing: { value: spacing },
      colorBase: { value: new THREE.Vector3(...colorBase) },
      colorTip: { value: new THREE.Vector3(...colorTip) },
      time: { value: 0 },
      windStrength: { value: windStrength },
      gravityDroop: { value: gravityDroop },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/**
 * Create complete fur system with all shell layers
 */
export function createFurLayers(
  geometry: THREE.BufferGeometry,
  config: Partial<FurConfig> = {}
): THREE.Mesh[] {
  const { layers = defaultFurConfig.layers } = config;
  const meshes: THREE.Mesh[] = [];

  for (let i = 1; i <= layers; i++) {
    const material = createFurMaterial(i, layers, config);
    const mesh = new THREE.Mesh(geometry, material);
    meshes.push(mesh);
  }

  return meshes;
}

/**
 * Update fur uniforms for animation
 */
export function updateFurTime(meshes: THREE.Mesh[], time: number): void {
  for (const mesh of meshes) {
    const material = mesh.material as THREE.ShaderMaterial;
    if (material.uniforms?.time) {
      material.uniforms.time.value = time;
    }
  }
}
