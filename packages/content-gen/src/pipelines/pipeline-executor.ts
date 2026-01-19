/**
 * Pipeline Executor
 *
 * Executes pipelines defined via JSON definitions.
 * Handles input/output mapping, step dependencies, and forEach loops.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pipeline as streamPipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import seedrandom from 'seedrandom';
import { MeshyClient, type TaskResult } from '../api/meshy-client';
import { ANIMATION_IDS } from '../tasks/registry';
import type { AnimationTaskState, AssetManifest } from '../types/manifest';

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

interface AnimationPresets {
  description: string;
  presets: Record<string, { description: string; animations: string[] }>;
  default: string;
}

let _animationPresets: AnimationPresets | null = null;

function loadAnimationPresets(): AnimationPresets {
  if (!_animationPresets) {
    const presetsPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../tasks/definitions/animation-presets.json'
    );
    _animationPresets = JSON.parse(fs.readFileSync(presetsPath, 'utf-8')) as AnimationPresets;
  }
  return _animationPresets;
}

/**
 * Resolve animation preset or explicit list to final animation array
 */
function resolveAnimations(manifest: AssetManifest): string[] {
  const animTask = manifest.animationTask;
  if (!animTask) {
    // Use default preset if no animation task configured
    const presets = loadAnimationPresets();
    return presets.presets[presets.default].animations;
  }

  // Preset takes precedence
  if (animTask.preset) {
    const presets = loadAnimationPresets();
    const preset = presets.presets[animTask.preset];
    if (!preset) {
      console.warn(`Unknown animation preset: ${animTask.preset}, using default`);
      return presets.presets[presets.default].animations;
    }
    return preset.animations;
  }

  // Explicit animations list
  if (animTask.animations?.length) {
    return animTask.animations;
  }

  // Fall back to default preset
  const presets = loadAnimationPresets();
  return presets.presets[presets.default].animations;
}

// ============================================================================
// TYPES
// ============================================================================

interface InputBinding {
  value?: unknown;
  source?: 'manifest' | 'step' | 'lookup';
  path?: string;
  step?: string;
  table?: string;
  key?: string;
  default?: unknown;
}

interface PipelineStep {
  id: string;
  task: string;
  dependsOn?: string[];
  forEach?: {
    source: string;
    path: string;
    as: string;
  };
  inputs: Record<string, InputBinding>;
  outputs: Record<string, string>;
  artifacts?: Record<string, string>;
}

interface PipelineDefinition {
  name: string;
  description?: string;
  version?: string;
  steps: PipelineStep[];
  stateMapping?: Record<string, string>;
}

interface StepResult {
  taskId: string;
  status: string;
  outputs: Record<string, unknown>;
  artifacts: Record<string, string>;
}

interface ExecutionContext {
  manifest: AssetManifest;
  assetDir: string;
  stepResults: Map<string, StepResult>;
  iterationVars: Record<string, unknown>;
  seed: number;
}

// ============================================================================
// LOOKUP TABLES
// ============================================================================

const LOOKUP_TABLES: Record<string, Record<string, unknown>> = {
  ANIMATION_IDS,
};

// ============================================================================
// PIPELINE EXECUTOR
// ============================================================================

export class PipelineExecutor {
  private readonly client: MeshyClient;
  private readonly definitionsDir: string;

  constructor(apiKey: string) {
    this.client = new MeshyClient({ apiKey });
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.definitionsDir = path.join(__dirname, 'definitions');
  }

  /**
   * Load and execute a pipeline by name
   */
  async execute(
    pipelineName: string,
    assetDir: string,
    options?: { step?: string }
  ): Promise<AssetManifest> {
    // Load pipeline definition
    const defPath = path.join(this.definitionsDir, `${pipelineName}.pipeline.json`);
    if (!fs.existsSync(defPath)) {
      throw new Error(`Pipeline definition not found: ${pipelineName}`);
    }

    const pipeline = JSON.parse(fs.readFileSync(defPath, 'utf-8')) as PipelineDefinition;

    // Load manifest
    const manifestPath = path.join(assetDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found: ${manifestPath}`);
    }
    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as AssetManifest;

    // Generate seed if not present (for reproducible generation)
    let seed = manifest.seed;
    if (seed === undefined) {
      const rng = seedrandom();
      seed = rng.int32() >>> 0; // Convert to unsigned 32-bit
      manifest.seed = seed;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`\n  Generated seed: ${seed}`);
    }

    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`  Pipeline: ${pipeline.name} v${pipeline.version ?? '1.0.0'}`);
    console.log(`  Asset: ${manifest.name}`);
    console.log(`  Seed: ${seed}`);
    console.log(`  Directory: ${assetDir}`);
    console.log(`═══════════════════════════════════════════════════════════════`);

    // Create execution context
    const context: ExecutionContext = {
      manifest,
      assetDir,
      stepResults: new Map(),
      iterationVars: {},
      seed,
    };

    // Load existing step results from manifest
    this.loadExistingResults(manifest, pipeline, context);

    // Determine which steps to run
    const stepsToRun = options?.step
      ? pipeline.steps.filter(s => s.id === options.step)
      : pipeline.steps;

    // Execute steps
    for (const step of stepsToRun) {
      manifest = await this.executeStep(step, pipeline, context);

      // Save manifest after each step
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    console.log(`\n═══════════════════════════════════════════════════════════════`);
    console.log(`  ✅ Pipeline complete: ${manifest.name}`);
    console.log(`═══════════════════════════════════════════════════════════════\n`);

    return manifest;
  }

  /**
   * Execute a single pipeline step
   */
  private async executeStep(
    step: PipelineStep,
    pipeline: PipelineDefinition,
    context: ExecutionContext
  ): Promise<AssetManifest> {
    // Check dependencies
    for (const dep of step.dependsOn ?? []) {
      if (!context.stepResults.has(dep)) {
        const existing = this.getExistingStepResult(dep, context.manifest, pipeline);
        if (!existing || existing.status !== 'SUCCEEDED') {
          throw new Error(`Dependency '${dep}' not completed for step '${step.id}'`);
        }
        context.stepResults.set(dep, existing);
      }
    }

    // Handle forEach loops
    if (step.forEach) {
      return this.executeForEach(step, pipeline, context);
    }

    return this.executeSingleStep(step, pipeline, context);
  }

  /**
   * Execute a step with forEach iteration
   */
  private async executeForEach(
    step: PipelineStep,
    pipeline: PipelineDefinition,
    context: ExecutionContext
  ): Promise<AssetManifest> {
    const { forEach } = step;
    if (!forEach) return context.manifest;

    // Get iteration values
    const values = this.resolveValue(
      { source: forEach.source as 'manifest', path: forEach.path },
      context
    ) as unknown[];

    if (!Array.isArray(values)) {
      throw new Error(`forEach path '${forEach.path}' did not resolve to an array`);
    }

    console.log(`\n[${step.id}] Iterating over ${values.length} items...`);

    for (const value of values) {
      // Set iteration variable
      context.iterationVars[forEach.as] = value;

      // Check if already completed
      const itemId = String(value).toLowerCase();
      const existingResults = this.getAnimationResults(context.manifest);
      const existing = existingResults.find(r =>
        (r.outputs?.animationName as string)?.toLowerCase() === itemId
      );

      if (existing?.status === 'SUCCEEDED') {
        console.log(`  ✓ ${value} already exists`);
        continue;
      }

      // Execute for this iteration
      await this.executeSingleStep(step, pipeline, context, String(value));
    }

    return context.manifest;
  }

  /**
   * Execute a single step (non-forEach)
   */
  private async executeSingleStep(
    step: PipelineStep,
    pipeline: PipelineDefinition,
    context: ExecutionContext,
    iterationLabel?: string
  ): Promise<AssetManifest> {
    const label = iterationLabel ? `${step.id}:${iterationLabel}` : step.id;

    // Check if already completed (non-forEach)
    if (!iterationLabel) {
      const existing = this.getExistingStepResult(step.id, context.manifest, pipeline);
      if (existing?.status === 'SUCCEEDED') {
        console.log(`\n[${label}] Already completed, skipping`);
        context.stepResults.set(step.id, existing);
        return context.manifest;
      }
    }

    console.log(`\n[${label}] Starting...`);

    // Build request body
    const requestBody = this.buildRequestBody(step, context);

    // Determine API endpoint
    const endpoint = this.getEndpointForTask(step.task);
    console.log(`  Endpoint: ${endpoint}`);

    // Create task
    const createResponse = await this.client.post<{ result: string }>(endpoint, requestBody);
    const taskId = createResponse.result;
    console.log(`  Task ID: ${taskId}`);

    // Stream until complete
    const streamEndpoint = `${endpoint}/${taskId}/stream`;
    const result = await this.client.streamUntilComplete<Record<string, unknown>>(streamEndpoint);

    if (result.status !== 'SUCCEEDED') {
      const error = result.task_error?.message ?? JSON.stringify(result);
      console.log(`  ❌ Failed: ${error}`);
      this.updateManifestState(step, pipeline, context, {
        taskId,
        status: result.status,
        outputs: {},
        artifacts: {},
      }, iterationLabel);
      return context.manifest;
    }

    // Download artifacts (files only - URLs stay in memory for step passing)
    const artifacts: Record<string, string> = {};
    if (step.artifacts) {
      for (const [localPath, responsePath] of Object.entries(step.artifacts)) {
        const resolvedPath = this.interpolateString(localPath, context);
        const value = this.extractJsonPath(result, responsePath);

        // Handle arrays (e.g., image_urls from text-to-image)
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const url = value[i];
            if (url && typeof url === 'string') {
              // Insert index before extension: concept.png -> concept_0.png
              const ext = path.extname(resolvedPath);
              const base = resolvedPath.slice(0, -ext.length);
              const indexedPath = `${base}_${i}${ext}`;
              const fullPath = path.join(context.assetDir, indexedPath);
              await this.downloadFile(url, fullPath);
              artifacts[indexedPath] = indexedPath;
              console.log(`  Downloaded: ${indexedPath}`);
            }
          }
        } else if (value && typeof value === 'string') {
          const fullPath = path.join(context.assetDir, resolvedPath);
          await this.downloadFile(value, fullPath);
          artifacts[resolvedPath] = resolvedPath;
          console.log(`  Downloaded: ${resolvedPath}`);
        }
      }
    }

    // Extract outputs (URLs stay in memory, only filenames go to manifest)
    const outputs: Record<string, unknown> = { taskId };
    for (const [name, jsonPath] of Object.entries(step.outputs)) {
      outputs[name] = this.extractJsonPath(result, jsonPath) ?? this.extractJsonPath({ result: taskId }, jsonPath);
    }

    // Add iteration-specific outputs
    if (iterationLabel) {
      outputs.animationName = iterationLabel.toUpperCase();
      const actionId = LOOKUP_TABLES.ANIMATION_IDS[iterationLabel.toUpperCase()];
      if (actionId !== undefined) {
        outputs.actionId = actionId;
      }
    }

    const stepResult: StepResult = {
      taskId,
      status: 'SUCCEEDED',
      outputs,
      artifacts,
    };

    context.stepResults.set(step.id, stepResult);

    // Update manifest
    this.updateManifestState(step, pipeline, context, stepResult, iterationLabel);

    return context.manifest;
  }

  /**
   * Build request body from step inputs
   */
  private buildRequestBody(step: PipelineStep, context: ExecutionContext): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    for (const [name, binding] of Object.entries(step.inputs)) {
      let value = this.resolveValue(binding, context);

      // Apply default if undefined
      if (value === undefined && binding.default !== undefined) {
        value = binding.default;
      }

      // Only include defined, non-empty values
      if (value !== undefined && value !== '') {
        body[name] = value;
      }
    }

    // Always include seed for reproducibility
    body.seed = context.seed;

    return body;
  }

  /**
   * Resolve an input binding to a value
   */
  private resolveValue(binding: InputBinding, context: ExecutionContext): unknown {
    // Static value
    if ('value' in binding && binding.value !== undefined) {
      return binding.value;
    }

    // Interpolate any template strings in path/key
    const resolvedPath = binding.path ? this.interpolateString(binding.path, context) : undefined;
    const resolvedKey = binding.key ? this.interpolateString(binding.key, context) : undefined;

    switch (binding.source) {
      case 'manifest':
        // Special handling for animation list - resolve presets
        if (resolvedPath === 'animationTask.animations') {
          return resolveAnimations(context.manifest);
        }
        if (!resolvedPath) return undefined;
        return this.extractPath(context.manifest, resolvedPath);

      case 'step': {
        const stepResult = context.stepResults.get(binding.step!);
        if (!stepResult || !resolvedPath) return undefined;
        return this.extractPath(stepResult.outputs, resolvedPath);
      }

      case 'lookup': {
        const table = LOOKUP_TABLES[binding.table!];
        if (!table) return undefined;
        return table[resolvedKey!];
      }

      default:
        return undefined;
    }
  }

  /**
   * Interpolate template strings like {{varName}}
   */
  private interpolateString(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{(\w+)(\s*\|\s*(\w+))?\}\}/g, (_, varName, __, filter) => {
      let value = context.iterationVars[varName];
      if (value === undefined) return '';

      if (filter === 'lowercase') {
        value = String(value).toLowerCase();
      } else if (filter === 'uppercase') {
        value = String(value).toUpperCase();
      }

      return String(value);
    });
  }

  /**
   * Extract value from object using dot notation path
   */
  private extractPath(obj: unknown, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Extract value using JSONPath-like syntax
   */
  private extractJsonPath(obj: unknown, path: string): unknown {
    // Remove leading $. if present
    const cleanPath = path.replace(/^\$\.?/, '');
    const parts = cleanPath.split(/\.|\[|\]/).filter(Boolean);

    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Get endpoint path for a task type
   */
  private getEndpointForTask(task: string): string {
    const mapping: Record<string, string> = {
      'text-to-image': '/v1/text-to-image',
      'multi-image-to-3d': '/v1/multi-image-to-3d',
      'image-to-3d': '/v1/image-to-3d',
      'text-to-3d-preview': '/v2/text-to-3d',
      'text-to-3d-refine': '/v2/text-to-3d',
      'rigging': '/v1/rigging',
      'animation': '/v1/animations',
    };
    return mapping[task] ?? `/v1/${task}`;
  }

  /**
   * Download a file from URL
   */
  private async downloadFile(url: string, dest: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ${url}`);
    }

    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // @ts-ignore - Node streams
    await streamPipeline(response.body, createWriteStream(dest));
  }

  /**
   * Load existing step results from manifest
   */
  private loadExistingResults(
    manifest: AssetManifest,
    pipeline: PipelineDefinition,
    context: ExecutionContext
  ): void {
    for (const step of pipeline.steps) {
      if (step.forEach) continue; // forEach results handled separately

      const existing = this.getExistingStepResult(step.id, manifest, pipeline);
      if (existing?.status === 'SUCCEEDED') {
        context.stepResults.set(step.id, existing);
      }
    }
  }

  /**
   * Get existing step result from manifest
   * NOTE: URLs are persisted (small, needed for handoff). Base64 data is NEVER stored.
   */
  private getExistingStepResult(
    stepId: string,
    manifest: AssetManifest,
    pipeline: PipelineDefinition
  ): StepResult | undefined {
    // Direct access to task state in manifest
    const tasks = manifest.tasks as Record<string, unknown>;
    const stateKey = stepId === 'preview' ? 'text-to-3d-preview'
      : stepId === 'refine' ? 'text-to-3d-refine'
      : stepId;

    const state = tasks[stateKey] as Record<string, unknown> | undefined;
    if (!state) return undefined;

    const savedOutputs = (state.outputs as Record<string, unknown>) ?? {};
    const savedArtifacts = (state.artifacts as Record<string, string>) ?? {};

    return {
      taskId: state.taskId as string,
      status: state.status as string,
      outputs: {
        taskId: state.taskId,
        ...savedOutputs,
      },
      artifacts: savedArtifacts,
    };
  }

  /**
   * Get animation results from manifest
   */
  private getAnimationResults(manifest: AssetManifest): StepResult[] {
    const animations = (manifest.tasks as Record<string, unknown>).animations as Array<Record<string, unknown>> | undefined;
    if (!animations) return [];

    return animations.map(a => ({
      taskId: a.taskId as string,
      status: a.status as string,
      outputs: a,
      artifacts: {},
    }));
  }

  /**
   * Update manifest with step result
   */
  private updateManifestState(
    step: PipelineStep,
    pipeline: PipelineDefinition,
    context: ExecutionContext,
    result: StepResult,
    iterationLabel?: string
  ): void {
    const { manifest } = context;

    // Animation steps (forEach)
    if (iterationLabel) {
      if (!manifest.tasks.animations) {
        manifest.tasks.animations = [];
      }

      const animRecord = {
        taskId: result.taskId,
        status: result.status as 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'IN_PROGRESS' | 'CANCELED',
        animationName: iterationLabel.toUpperCase(),
        actionId: result.outputs.actionId as number,
        completedAt: Date.now(),
        outputs: result.artifacts,
      };

      const existingIdx = manifest.tasks.animations.findIndex(
        (a: AnimationTaskState) => a.animationName === iterationLabel.toUpperCase()
      );

      if (existingIdx >= 0) {
        manifest.tasks.animations[existingIdx] = animRecord;
      } else {
        manifest.tasks.animations.push(animRecord);
      }
      return;
    }

    // Regular steps - persist URLs (small, needed for handoff) but NEVER base64 data
    const stateKey = step.id === 'preview' ? 'text-to-3d-preview'
      : step.id === 'refine' ? 'text-to-3d-refine'
      : step.id;

    (manifest.tasks as Record<string, unknown>)[stateKey] = {
      taskId: result.taskId,
      status: result.status,
      completedAt: Date.now(),
      outputs: result.outputs, // URLs are OK, base64 data is NOT
      artifacts: result.artifacts,
    };

    context.manifest = manifest;
  }
}
