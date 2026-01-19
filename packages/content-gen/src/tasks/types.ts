/**
 * Task System Type Definitions
 *
 * Declarative task definitions that allow tasks to be defined via JSON specs
 * rather than reimplementing HTTP logic for each API operation.
 */

import type { TaskStatus } from '../api/meshy-client';

// ============================================================================
// TASK DEFINITION SCHEMA
// ============================================================================

/**
 * Declarative task definition - defines how to execute a Meshy API task
 * without writing custom code for each endpoint.
 */
export interface TaskDefinition {
  /** Unique task type identifier */
  type: string;

  /** Human-readable name */
  name: string;

  /** API version (v1 or v2) */
  apiVersion: 'v1' | 'v2';

  /** Base endpoint path (e.g., 'text-to-3d', 'rigging') */
  endpoint: string;

  /** Input parameter definitions */
  inputs: TaskInputDef[];

  /** Output file mappings */
  outputs: TaskOutputDef[];

  /** Dependencies - other task types that must complete first */
  dependsOn?: string[];
}

export interface TaskInputDef {
  /** Parameter name in the API request */
  name: string;

  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object';

  /** Whether this parameter is required */
  required: boolean;

  /** Default value if not provided */
  default?: unknown;

  /** Description for documentation */
  description?: string;

  /** Source for dynamic values: 'manifest', 'previousTask', 'config' */
  source?: 'manifest' | 'previousTask' | 'config';

  /** Path to extract value from source (e.g., 'tasks.preview.taskId') */
  sourcePath?: string;
}

export interface TaskOutputDef {
  /** Name of this output */
  name: string;

  /** Path in API response to extract URL (e.g., 'model_urls.glb') */
  responsePath: string;

  /** Local filename to save as */
  localFilename: string;

  /** Whether this output is required for task success */
  required: boolean;
}

// ============================================================================
// TASK EXECUTION STATE
// ============================================================================

/**
 * Runtime state of a task execution
 */
export interface TaskState {
  taskId?: string;
  status: TaskStatus;
  progress?: number;
  startedAt?: number;
  completedAt?: number;
  resultUrl?: string;
  localPath?: string;
  error?: string;
}

/**
 * Full task record stored in manifest
 */
export interface TaskRecord extends TaskState {
  /** Task definition type */
  type: string;

  /** Input parameters used */
  inputs?: Record<string, unknown>;

  /** Output files generated */
  outputs?: Record<string, string>;
}

// ============================================================================
// TASK EXECUTION CONTEXT
// ============================================================================

/**
 * Context passed to task executors
 */
export interface TaskContext {
  /** Asset directory path */
  assetDir: string;

  /** Current manifest state */
  manifest: Record<string, unknown>;

  /** Previously completed tasks */
  completedTasks: Map<string, TaskRecord>;

  /** Output callback for logging */
  log: (message: string) => void;
}

// ============================================================================
// ANIMATION TASK EXTENSIONS
// ============================================================================

/**
 * Extended task record for animations
 */
export interface AnimationTaskRecord extends TaskRecord {
  animationName: string;
  actionId: number;
}
