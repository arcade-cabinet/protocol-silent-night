#!/usr/bin/env tsx
/**
 * Download missing assets from Meshy
 *
 * Re-fetches model/rigged model for characters that have task IDs
 * but missing local files.
 */

import fs from 'node:fs';
import path from 'node:path';
import { pipeline as streamPipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';

const MESHY_API_KEY = process.env.MESHY_API_KEY;
if (!MESHY_API_KEY) {
  console.error('MESHY_API_KEY not set');
  process.exit(1);
}

const ASSETS_DIR = path.resolve(import.meta.dirname, '../../game/public/assets');

interface TaskState {
  taskId: string;
  status: string;
  outputs?: Record<string, unknown>;
}

interface Manifest {
  id: string;
  name: string;
  tasks: {
    concept?: TaskState;
    model?: TaskState;
    rigging?: TaskState;
    animations?: Array<{ taskId: string; status: string; outputs?: Record<string, string> }>;
  };
}

async function fetchTaskResult(taskId: string, endpoint: string): Promise<Record<string, unknown>> {
  const url = `https://api.meshy.ai${endpoint}/${taskId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch task ${taskId}: ${response.statusText}`);
  }
  const data = await response.json() as Record<string, unknown>;
  return data;
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}`);
  }
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const nodeReadable = Readable.fromWeb(response.body as import('node:stream/web').ReadableStream);
  await streamPipeline(nodeReadable, createWriteStream(dest));
  console.log(`  Downloaded: ${dest}`);
}

async function processCharacter(charDir: string): Promise<void> {
  const manifestPath = path.join(charDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  console.log(`\nProcessing: ${manifest.name}`);

  // Check for rigged model (preferred)
  const riggedPath = path.join(charDir, 'rigged.glb');
  if (!fs.existsSync(riggedPath) && manifest.tasks.rigging?.taskId) {
    console.log('  Fetching rigged model...');
    try {
      const result = await fetchTaskResult(manifest.tasks.rigging.taskId, '/v1/rigging');
      const modelUrl = (result as Record<string, unknown>).model_url as string;
      if (modelUrl) {
        await downloadFile(modelUrl, riggedPath);
      }
    } catch (e) {
      console.log(`  Failed: ${(e as Error).message}`);
    }
  }

  // Check for base model
  const modelPath = path.join(charDir, 'model.glb');
  if (!fs.existsSync(modelPath) && manifest.tasks.model?.taskId) {
    console.log('  Fetching base model...');
    try {
      // v1/multi-image-to-3d or v1/image-to-3d
      const result = await fetchTaskResult(manifest.tasks.model.taskId, '/v1/image-to-3d');
      const urls = result.model_urls as Record<string, string> | undefined;
      const modelUrl = urls?.glb || (result as Record<string, unknown>).model_url as string;
      if (modelUrl) {
        await downloadFile(modelUrl, modelPath);
      }
    } catch (e) {
      console.log(`  Failed: ${(e as Error).message}`);
    }
  }
}

async function main(): Promise<void> {
  console.log('=== Downloading Missing Assets ===');

  // Process main characters
  const mainCharsDir = path.join(ASSETS_DIR, 'characters/main');
  if (fs.existsSync(mainCharsDir)) {
    for (const charName of fs.readdirSync(mainCharsDir)) {
      const charDir = path.join(mainCharsDir, charName);
      if (fs.statSync(charDir).isDirectory()) {
        await processCharacter(charDir);
      }
    }
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
