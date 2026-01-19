/**
 * Asset Manifest Schema
 *
 * Declarative manifest format for defining asset generation pipelines.
 * Each asset type (character, tile, background) uses different task combinations.
 *
 * The manifest expresses TASKS in an agnostic way, allowing content-gen
 * to COORDINATE pipelines based on asset type and task definitions.
 */

import { z } from 'zod';

// ============================================================================
// TASK STATE SCHEMAS
// ============================================================================

export const TaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED']);

/**
 * Generic task state record
 */
export const TaskStateSchema = z.object({
  taskId: z.string().optional(),
  status: TaskStatusSchema,
  progress: z.number().optional(),
  startedAt: z.number().optional(),
  completedAt: z.number().optional(),
  error: z.string().optional(),
  outputs: z.record(z.string(), z.string()).optional(),
});

/**
 * Animation-specific task state
 */
export const AnimationTaskStateSchema = TaskStateSchema.extend({
  animationName: z.string(),
  actionId: z.number(),
});

// ============================================================================
// TEXT-TO-IMAGE TASK CONFIG
// ============================================================================

/**
 * Text-to-Image Task Configuration
 * @see https://docs.meshy.ai/en/api/text-to-image
 */
export const TextToImageTaskSchema = z.object({
  /** Image description prompt */
  prompt: z.string(),

  /** Generate multi-view image showing subject from multiple angles */
  generateMultiView: z.boolean().default(true),

  /** Pose mode for character generation */
  poseMode: z.enum(['a-pose', 't-pose', '']).default('a-pose'),
});

/**
 * Multi-Image to 3D Task Configuration
 * @see https://docs.meshy.ai/en/api/image-to-3d
 */
export const MultiImageTo3DTaskSchema = z.object({
  /** Mesh topology */
  topology: z.enum(['quad', 'triangle']).default('quad'),

  /** Target polygon count (100-300,000) */
  targetPolycount: z.number().min(100).max(300000).default(30000),

  /** Symmetry mode */
  symmetryMode: z.enum(['off', 'auto', 'on']).default('auto'),

  /** Enable remeshing */
  shouldRemesh: z.boolean().default(true),

  /** Generate textures */
  shouldTexture: z.boolean().default(true),

  /** Generate PBR maps */
  enablePbr: z.boolean().default(false),

  /** Pose mode for characters */
  poseMode: z.enum(['a-pose', 't-pose', '']).default('a-pose'),

  /** Texture guidance prompt */
  texturePrompt: z.string().max(600).optional(),
});

// ============================================================================
// TEXT-TO-3D TASK CONFIGS
// ============================================================================

/**
 * Text-to-3D Preview Task Configuration
 * @see https://docs.meshy.ai/en/api/text-to-3d
 */
export const TextTo3DPreviewTaskSchema = z.object({
  /** Object description, max 600 characters */
  prompt: z.string().max(600),

  /** Art style: 'realistic' or 'sculpture' */
  artStyle: z.enum(['realistic', 'sculpture']).default('sculpture'),

  /** Mesh topology */
  topology: z.enum(['quad', 'triangle']).default('quad'),

  /** Target polygon count (100-300,000) */
  targetPolycount: z.number().min(100).max(300000).default(40000),

  /** Enable remeshing */
  shouldRemesh: z.boolean().default(true),

  /** Symmetry mode */
  symmetryMode: z.enum(['off', 'auto', 'on']).default('auto'),

  /** Pose mode for characters */
  poseMode: z.enum(['a-pose', 't-pose', '']).default('a-pose'),
});

/**
 * Text-to-3D Refine Task Configuration
 */
export const TextTo3DRefineTaskSchema = z.object({
  /** Enable PBR maps (metallic, roughness, normal) */
  enablePbr: z.boolean().default(false),

  /** Texturing guidance, max 600 characters */
  texturePrompt: z.string().max(600).optional(),

  /** Reference image URL for texture style */
  textureImageUrl: z.string().optional(),
});

// ============================================================================
// RIGGING & ANIMATION TASK CONFIGS
// ============================================================================

/**
 * Rigging Task Configuration
 * @see https://docs.meshy.ai/en/api/rigging-and-animation
 */
export const RiggingTaskSchema = z.object({
  /** Character height in meters */
  heightMeters: z.number().positive().default(1.7),

  /** UV-unwrapped base color texture URL */
  textureImageUrl: z.string().optional(),
});

/**
 * Animation Task Configuration
 */
export const AnimationTaskSchema = z.object({
  /**
   * Animation preset name (hero, enemy, boss, prop)
   * When specified, loads animations from animation-presets.json
   * Takes precedence over explicit animations array
   */
  preset: z.enum(['hero', 'enemy', 'boss', 'prop']).optional(),

  /**
   * Explicit list of animation names to generate
   * Only used if preset is not specified
   */
  animations: z.array(z.string()).optional(),

  /** Post-processing options */
  postProcess: z.object({
    operationType: z.enum(['change_fps', 'fbx2usdz', 'extract_armature']).optional(),
    fps: z.enum(['24', '25', '30', '60']).optional(),
  }).optional(),
});

/**
 * Retexture Task Configuration
 * @see https://docs.meshy.ai/en/api/retexture
 */
export const RetextureTaskSchema = z.object({
  /** Text style prompt for retexturing */
  textStylePrompt: z.string().max(600).optional(),

  /** Reference image for texture style */
  imageStyleUrl: z.string().optional(),

  /** Preserve original UVs */
  enableOriginalUv: z.boolean().default(true),

  /** Enable PBR maps */
  enablePbr: z.boolean().default(true),

  /** AI model version */
  aiModel: z.enum(['meshy-5', 'latest']).default('latest'),
});

// ============================================================================
// ASSET MANIFEST
// ============================================================================

/**
 * Main Asset Manifest Schema
 *
 * Each asset directory contains a manifest.json that declares:
 * 1. Asset metadata (id, name, type, description)
 * 2. Task configurations for each pipeline step
 * 3. Task execution state (populated by content-gen)
 */
export const AssetManifestSchema = z.object({
  // --- Metadata ---
  id: z.string(),
  name: z.string(),
  type: z.enum(['character', 'background', 'prop', 'environment', 'tile']),
  description: z.string(),

  /** Seed for reproducible generation (auto-generated if not provided) */
  seed: z.number().int().optional(),

  // --- Task Configurations ---
  textToImageTask: TextToImageTaskSchema.optional(),
  multiImageTo3DTask: MultiImageTo3DTaskSchema.optional(),
  textTo3DPreviewTask: TextTo3DPreviewTaskSchema.optional(),
  textTo3DRefineTask: TextTo3DRefineTaskSchema.optional(),
  riggingTask: RiggingTaskSchema.optional(),
  animationTask: AnimationTaskSchema.optional(),
  retextureTask: RetextureTaskSchema.optional(),

  // --- Task Execution State ---
  tasks: z.object({
    'text-to-image': TaskStateSchema.optional(),
    'multi-image-to-3d': TaskStateSchema.optional(),
    'text-to-3d-preview': TaskStateSchema.optional(),
    'text-to-3d-refine': TaskStateSchema.optional(),
    rigging: TaskStateSchema.optional(),
    animations: z.array(AnimationTaskStateSchema).optional(),
    retexture: TaskStateSchema.optional(),
  }).default({}),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskState = z.infer<typeof TaskStateSchema>;
export type AnimationTaskState = z.infer<typeof AnimationTaskStateSchema>;
export type TextToImageTask = z.infer<typeof TextToImageTaskSchema>;
export type MultiImageTo3DTask = z.infer<typeof MultiImageTo3DTaskSchema>;
export type TextTo3DPreviewTask = z.infer<typeof TextTo3DPreviewTaskSchema>;
export type TextTo3DRefineTask = z.infer<typeof TextTo3DRefineTaskSchema>;
export type RiggingTask = z.infer<typeof RiggingTaskSchema>;
export type AnimationTask = z.infer<typeof AnimationTaskSchema>;
export type RetextureTask = z.infer<typeof RetextureTaskSchema>;
export type AssetManifest = z.infer<typeof AssetManifestSchema>;
