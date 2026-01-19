/**
 * @fileoverview Anime-style face rendering using BabylonJS DynamicTexture
 * @module characters/AnimeFace
 *
 * Creates 2D anime-style faces rendered onto head meshes.
 * Supports different eye styles and expressions for character variety.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  DynamicTexture,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import type { FaceConfig } from './CharacterTypes';

/**
 * Canvas context type alias for BabylonJS compatibility
 * BabylonJS DynamicTexture actually provides full CanvasRenderingContext2D at runtime,
 * but the type definition is conservative. We use this type assertion for broader API access.
 */
type CanvasContext = CanvasRenderingContext2D;

/**
 * Default face configuration
 */
export const DEFAULT_FACE_CONFIG: FaceConfig = {
  textureSize: 256,
  eyeStyle: 'angular',
  eyeColor: '#00ffff',
  baseColor: '#ffe4c4',
  showMouth: true,
};

/**
 * Expression types for anime faces
 */
export type FaceExpression =
  | 'neutral'
  | 'happy'
  | 'angry'
  | 'determined'
  | 'surprised';

/**
 * Eye style configurations
 */
interface EyeStyleConfig {
  /** Width relative to texture */
  width: number;
  /** Height relative to texture */
  height: number;
  /** X offset from center for each eye */
  offsetX: number;
  /** Y position from center */
  offsetY: number;
  /** Whether to draw as circle/ellipse or angular shape */
  isRound: boolean;
  /** Highlight position and size */
  highlight?: {
    x: number;
    y: number;
    radius: number;
  };
}

const EYE_STYLES: Record<FaceConfig['eyeStyle'], EyeStyleConfig> = {
  round: {
    width: 0.15,
    height: 0.2,
    offsetX: 0.15,
    offsetY: 0.05,
    isRound: true,
    highlight: { x: 0.03, y: -0.03, radius: 0.03 },
  },
  angular: {
    width: 0.18,
    height: 0.12,
    offsetX: 0.14,
    offsetY: 0.03,
    isRound: false,
    highlight: { x: 0.04, y: -0.02, radius: 0.025 },
  },
  visor: {
    width: 0.4,
    height: 0.08,
    offsetX: 0,
    offsetY: 0.02,
    isRound: false,
  },
};

/**
 * Converts hex color string to RGB values (0-255)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Creates an anime face texture
 *
 * @param scene - BabylonJS scene
 * @param config - Face configuration
 * @param expression - Current expression
 * @returns Dynamic texture with rendered face
 */
export function createFaceTexture(
  scene: Scene,
  config: Partial<FaceConfig> = {},
  expression: FaceExpression = 'neutral'
): DynamicTexture {
  const fullConfig: FaceConfig = { ...DEFAULT_FACE_CONFIG, ...config };
  const { textureSize, eyeStyle, eyeColor, baseColor, showMouth } = fullConfig;

  const texture = new DynamicTexture(
    'faceTexture',
    { width: textureSize, height: textureSize },
    scene,
    false
  );

  const ctx = texture.getContext() as unknown as CanvasContext;
  const size = textureSize;

  // Clear with base color
  const baseRgb = hexToRgb(baseColor);
  ctx.fillStyle = `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`;
  ctx.fillRect(0, 0, size, size);

  // Get eye style config
  const eyeConf = EYE_STYLES[eyeStyle];
  const eyeRgb = hexToRgb(eyeColor);

  // Calculate eye dimensions
  const eyeWidth = size * eyeConf.width;
  const eyeHeight = size * eyeConf.height;
  const eyeY = size * 0.45 - size * eyeConf.offsetY;

  if (eyeStyle === 'visor') {
    // Draw single visor bar
    drawVisor(ctx, size, eyeWidth, eyeHeight, eyeY, eyeRgb, expression);
  } else {
    // Draw two separate eyes
    const leftEyeX = size * 0.5 - size * eyeConf.offsetX - eyeWidth / 2;
    const rightEyeX = size * 0.5 + size * eyeConf.offsetX - eyeWidth / 2;

    drawEye(
      ctx,
      leftEyeX,
      eyeY,
      eyeWidth,
      eyeHeight,
      eyeRgb,
      eyeConf,
      expression,
      false
    );
    drawEye(
      ctx,
      rightEyeX,
      eyeY,
      eyeWidth,
      eyeHeight,
      eyeRgb,
      eyeConf,
      expression,
      true
    );
  }

  // Draw mouth if enabled
  if (showMouth && eyeStyle !== 'visor') {
    drawMouth(ctx, size, expression);
  }

  texture.update();
  return texture;
}

/**
 * Draws a single anime eye
 */
function drawEye(
  ctx: CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
  styleConfig: EyeStyleConfig,
  expression: FaceExpression,
  isRight: boolean
): void {
  ctx.save();

  // Expression modifiers
  let heightMod = 1;
  let yOffset = 0;
  let angleOffset = 0;

  switch (expression) {
    case 'happy':
      heightMod = 0.6;
      yOffset = height * 0.1;
      break;
    case 'angry':
      angleOffset = isRight ? 0.15 : -0.15;
      heightMod = 0.85;
      break;
    case 'determined':
      angleOffset = isRight ? 0.1 : -0.1;
      break;
    case 'surprised':
      heightMod = 1.3;
      break;
  }

  const finalHeight = height * heightMod;
  const finalY = y + yOffset;

  // Draw outer glow
  ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
  ctx.shadowBlur = 10;

  if (styleConfig.isRound) {
    // Elliptical eye
    ctx.beginPath();
    ctx.ellipse(
      x + width / 2,
      finalY + finalHeight / 2,
      width / 2,
      finalHeight / 2,
      angleOffset,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.fill();
  } else {
    // Angular eye (polygon)
    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
    ctx.beginPath();

    // Slight rotation for expression
    ctx.translate(x + width / 2, finalY + finalHeight / 2);
    ctx.rotate(angleOffset);
    ctx.translate(-(x + width / 2), -(finalY + finalHeight / 2));

    // Draw angular shape
    ctx.moveTo(x, finalY + finalHeight * 0.3);
    ctx.lineTo(x + width * 0.2, finalY);
    ctx.lineTo(x + width * 0.8, finalY);
    ctx.lineTo(x + width, finalY + finalHeight * 0.3);
    ctx.lineTo(x + width, finalY + finalHeight * 0.7);
    ctx.lineTo(x + width * 0.8, finalY + finalHeight);
    ctx.lineTo(x + width * 0.2, finalY + finalHeight);
    ctx.lineTo(x, finalY + finalHeight * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw highlight if configured
  if (styleConfig.highlight && expression !== 'happy') {
    const hl = styleConfig.highlight;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(
      x + width / 2 + width * hl.x,
      finalY + finalHeight / 2 + finalHeight * hl.y,
      width * hl.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw pupil (darker center)
  if (styleConfig.isRound && expression !== 'happy') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(
      x + width / 2,
      finalY + finalHeight / 2,
      width * 0.15,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws a visor-style eye bar
 */
function drawVisor(
  ctx: CanvasContext,
  size: number,
  width: number,
  height: number,
  y: number,
  color: { r: number; g: number; b: number },
  expression: FaceExpression
): void {
  const x = (size - width) / 2;

  // Expression modifiers
  let heightMod = 1;
  switch (expression) {
    case 'angry':
    case 'determined':
      heightMod = 0.8;
      break;
    case 'surprised':
      heightMod = 1.4;
      break;
  }

  const finalHeight = height * heightMod;

  // Outer glow
  ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
  ctx.shadowBlur = 15;

  // Draw visor bar with rounded corners
  ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
  const radius = finalHeight / 2;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arc(x + width - radius, y + finalHeight / 2, radius, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + radius, y + finalHeight);
  ctx.arc(x + radius, y + finalHeight / 2, radius, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Reset shadow
  ctx.shadowBlur = 0;

  // Draw scan line effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(x + radius, y + finalHeight * 0.2, width - radius * 2, 2);

  // Draw segments
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const segX = x + (width / 4) * i;
    ctx.beginPath();
    ctx.moveTo(segX, y + 2);
    ctx.lineTo(segX, y + finalHeight - 2);
    ctx.stroke();
  }
}

/**
 * Draws the mouth based on expression
 */
function drawMouth(
  ctx: CanvasContext,
  size: number,
  expression: FaceExpression
): void {
  const mouthY = size * 0.68;
  const mouthX = size * 0.5;

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  ctx.beginPath();

  switch (expression) {
    case 'happy':
      // Smile curve
      ctx.arc(mouthX, mouthY - 5, 15, 0.2, Math.PI - 0.2);
      break;
    case 'angry':
      // Frown
      ctx.moveTo(mouthX - 12, mouthY + 3);
      ctx.lineTo(mouthX - 4, mouthY);
      ctx.lineTo(mouthX + 4, mouthY);
      ctx.lineTo(mouthX + 12, mouthY + 3);
      break;
    case 'determined':
      // Straight line with slight upturn
      ctx.moveTo(mouthX - 10, mouthY);
      ctx.lineTo(mouthX + 8, mouthY);
      ctx.lineTo(mouthX + 12, mouthY - 2);
      break;
    case 'surprised':
      // Small O
      ctx.arc(mouthX, mouthY, 6, 0, Math.PI * 2);
      break;
    default:
      // Neutral - simple line
      ctx.moveTo(mouthX - 10, mouthY);
      ctx.lineTo(mouthX + 10, mouthY);
  }

  ctx.stroke();
}

/**
 * Creates a head mesh with anime face texture
 *
 * @param scene - BabylonJS scene
 * @param config - Face configuration
 * @param headSize - Size of the head mesh
 * @returns Object containing head mesh and face texture
 */
export function createAnimeFaceHead(
  scene: Scene,
  config: Partial<FaceConfig> = {},
  headSize: number = 0.25
): { mesh: Mesh; texture: DynamicTexture; material: StandardMaterial } {
  // Create head mesh (slightly flattened sphere for anime proportions)
  const head = MeshBuilder.CreateSphere(
    'head',
    {
      diameter: headSize * 2,
      segments: 16,
    },
    scene
  );

  // Scale for anime proportions (wider face)
  head.scaling.set(0.9, 1, 0.85);

  // Create face texture
  const faceTexture = createFaceTexture(scene, config);

  // Create material
  const material = new StandardMaterial('headMat', scene);
  const baseRgb = hexToRgb(config.baseColor ?? DEFAULT_FACE_CONFIG.baseColor);
  material.diffuseColor = new Color3(
    baseRgb.r / 255,
    baseRgb.g / 255,
    baseRgb.b / 255
  );
  material.diffuseTexture = faceTexture;
  material.specularColor = new Color3(0.2, 0.2, 0.2);
  material.specularPower = 16;
  head.material = material;

  return { mesh: head, texture: faceTexture, material };
}

/**
 * Updates the face expression by re-rendering the texture
 *
 * @param scene - BabylonJS scene
 * @param texture - Existing face texture to update
 * @param config - Face configuration
 * @param expression - New expression to display
 */
export function updateFaceExpression(
  scene: Scene,
  texture: DynamicTexture,
  config: Partial<FaceConfig> = {},
  expression: FaceExpression
): void {
  const fullConfig: FaceConfig = { ...DEFAULT_FACE_CONFIG, ...config };
  const { textureSize, eyeStyle, eyeColor, baseColor, showMouth } = fullConfig;

  const ctx = texture.getContext() as unknown as CanvasContext;
  const size = textureSize;

  // Clear and redraw
  const baseRgb = hexToRgb(baseColor);
  ctx.fillStyle = `rgb(${baseRgb.r}, ${baseRgb.g}, ${baseRgb.b})`;
  ctx.fillRect(0, 0, size, size);

  const eyeConf = EYE_STYLES[eyeStyle];
  const eyeRgb = hexToRgb(eyeColor);

  const eyeWidth = size * eyeConf.width;
  const eyeHeight = size * eyeConf.height;
  const eyeY = size * 0.45 - size * eyeConf.offsetY;

  if (eyeStyle === 'visor') {
    drawVisor(ctx, size, eyeWidth, eyeHeight, eyeY, eyeRgb, expression);
  } else {
    const leftEyeX = size * 0.5 - size * eyeConf.offsetX - eyeWidth / 2;
    const rightEyeX = size * 0.5 + size * eyeConf.offsetX - eyeWidth / 2;

    drawEye(
      ctx,
      leftEyeX,
      eyeY,
      eyeWidth,
      eyeHeight,
      eyeRgb,
      eyeConf,
      expression,
      false
    );
    drawEye(
      ctx,
      rightEyeX,
      eyeY,
      eyeWidth,
      eyeHeight,
      eyeRgb,
      eyeConf,
      expression,
      true
    );
  }

  if (showMouth && eyeStyle !== 'visor') {
    drawMouth(ctx, size, expression);
  }

  texture.update();
}
