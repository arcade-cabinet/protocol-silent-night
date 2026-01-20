/**
 * Task Executor
 *
 * Generic executor that can run any task based on its JSON definition.
 * Handles the common pattern: POST → stream → download outputs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import type { MeshyClient, } from '../api/meshy-client';
import type { TaskDefinition, TaskContext, TaskRecord, TaskInputDef } from './types';

// ============================================================================
// TASK EXECUTOR
// ============================================================================

export class TaskExecutor {
  private readonly client: MeshyClient;

  constructor(client: MeshyClient) {
    this.client = client;
  }

  /**
   * Execute a task based on its definition
   */
  async execute(
    definition: TaskDefinition,
    context: TaskContext,
    additionalInputs?: Record<string, unknown>
  ): Promise<TaskRecord> {
    const { assetDir, log } = context;

    log(`\n[${definition.name}] Starting...`);

    // Build request body from definition
    const requestBody = this.buildRequestBody(definition, context, additionalInputs);

    log(`  Endpoint: /${definition.apiVersion}/${definition.endpoint}`);

    // Create task via POST
    const createPath = `/${definition.apiVersion}/${definition.endpoint}`;
    const createResponse = await this.client.post<{ result: string }>(createPath, requestBody);

    if (!createResponse.result) {
      throw new Error(`Failed to create ${definition.type} task: ${JSON.stringify(createResponse)}`);
    }

    const taskId = createResponse.result;
    log(`  Task ID: ${taskId}`);

    // Stream until complete
    const streamPath = `/${definition.apiVersion}/${definition.endpoint}/${taskId}/stream`;
    const result = await this.client.streamUntilComplete<Record<string, unknown>>(streamPath);

    if (result.status !== 'SUCCEEDED') {
      const error = result.task_error?.message ?? JSON.stringify(result);
      return {
        type: definition.type,
        taskId,
        status: result.status,
        error,
      };
    }

    // Download outputs
    const outputs: Record<string, string> = {};
    for (const outputDef of definition.outputs) {
      const url = this.extractValue(result, outputDef.responsePath);
      if (!url) {
        if (outputDef.required) {
          throw new Error(`Required output '${outputDef.name}' not found in response`);
        }
        continue;
      }

      const localPath = path.join(assetDir, outputDef.localFilename);
      await this.downloadFile(url as string, localPath);
      outputs[outputDef.name] = localPath;
      log(`  Downloaded: ${outputDef.localFilename}`);
    }

    return {
      type: definition.type,
      taskId,
      status: 'SUCCEEDED',
      completedAt: Date.now(),
      outputs,
      inputs: requestBody,
    };
  }

  /**
   * Build request body from task definition and context
   */
  private buildRequestBody(
    definition: TaskDefinition,
    context: TaskContext,
    additionalInputs?: Record<string, unknown>
  ): Record<string, unknown> {
    const body: Record<string, unknown> = {};

    for (const inputDef of definition.inputs) {
      let value: unknown;

      // Check additional inputs first (for dynamic values like actionId)
      if (additionalInputs && inputDef.name in additionalInputs) {
        value = additionalInputs[inputDef.name];
      }
      // Then check source-based resolution
      else if (inputDef.source && inputDef.sourcePath) {
        value = this.resolveInputValue(inputDef, context);
      }

      // Apply default if no value found
      if (value === undefined && inputDef.default !== undefined) {
        value = inputDef.default;
      }

      // Validate required fields
      if (value === undefined && inputDef.required) {
        throw new Error(`Required input '${inputDef.name}' not provided for ${definition.type}`);
      }

      // Only include defined values (skip undefined optionals)
      if (value !== undefined && value !== '') {
        body[inputDef.name] = value;
      }
    }

    return body;
  }

  /**
   * Resolve input value from its source
   */
  private resolveInputValue(inputDef: TaskInputDef, context: TaskContext): unknown {
    const { manifest, completedTasks } = context;

    switch (inputDef.source) {
      case 'manifest':
        return this.extractValue(manifest, inputDef.sourcePath!);

      case 'previousTask': {
        // sourcePath format: "taskType.fieldName"
        const [taskType, field] = inputDef.sourcePath!.split('.');
        const task = completedTasks.get(taskType);
        if (!task) {
          throw new Error(`Dependency '${taskType}' not completed for ${inputDef.name}`);
        }
        // Access task properties dynamically
        return (task as unknown as Record<string, unknown>)[field];
      }

      case 'config':
        // Config values come from additionalInputs, handled in buildRequestBody
        return undefined;

      default:
        return undefined;
    }
  }

  /**
   * Extract nested value from object using dot notation
   * Supports array indexing: "texture_urls[0].base_color"
   */
  private extractValue(obj: unknown, path: string): unknown {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
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
   * Download a file from URL to local path
   */
  private async downloadFile(url: string, dest: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.status}`);
    }

    if (!response.body) {
      throw new Error(`No body in response for ${url}`);
    }

    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // @ts-expect-error - Node streams compatibility
    await pipeline(response.body, createWriteStream(dest));
  }
}
