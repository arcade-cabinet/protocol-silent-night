import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PipelineExecutor } from './pipelines/pipeline-executor';

const program = new Command();

program
  .name('content-gen')
  .description('CLI for Protocol: Silent Night Content Generation')
  .version('0.1.0');

// ============================================================================
// CHARACTER GENERATION
// ============================================================================

const CHARACTERS_DIR = path.resolve(process.cwd(), '../../assets/characters');

const ALL_CHARACTERS = ['santa', 'cyberelf', 'bumble', 'yuletide', 'minion', 'krampus'];
const HERO_CHARACTERS = ['santa', 'cyberelf', 'bumble', 'yuletide'];
const ENEMY_CHARACTERS = ['minion', 'krampus'];

async function generateCharacter(characterId: string, step?: string): Promise<void> {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error('MESHY_API_KEY environment variable not set');
  }

  const assetDir = path.join(CHARACTERS_DIR, characterId);
  if (!fs.existsSync(path.join(assetDir, 'manifest.json'))) {
    throw new Error(`No manifest.json found for character: ${characterId}`);
  }

  const executor = new PipelineExecutor(apiKey);
  await executor.execute('character', assetDir, step ? { step } : undefined);
}

program.command('character <id>')
  .description('Generate a single character GLB (santa, cyberelf, bumble, yuletide, minion, krampus)')
  .option('-s, --step <step>', 'Run only a specific pipeline step')
  .action(async (id: string, options: { step?: string }) => {
    console.log(`\n🎄 Protocol: Silent Night - Character Generator`);
    console.log(`================================================\n`);

    try {
      await generateCharacter(id, options.step);
    } catch (error) {
      console.error(`❌ Failed to generate ${id}:`, error);
      process.exit(1);
    }
  });

program.command('heroes')
  .description('Generate all hero characters (santa, cyberelf, bumble, yuletide)')
  .action(async () => {
    console.log(`\n🎄 Protocol: Silent Night - Hero Generator`);
    console.log(`==========================================\n`);

    for (const id of HERO_CHARACTERS) {
      try {
        await generateCharacter(id);
      } catch (error) {
        console.error(`❌ Failed to generate ${id}:`, error);
      }
    }
  });

program.command('enemies')
  .description('Generate all enemy characters (minion, krampus)')
  .action(async () => {
    console.log(`\n🎄 Protocol: Silent Night - Enemy Generator`);
    console.log(`===========================================\n`);

    for (const id of ENEMY_CHARACTERS) {
      try {
        await generateCharacter(id);
      } catch (error) {
        console.error(`❌ Failed to generate ${id}:`, error);
      }
    }
  });

program.command('characters')
  .description('Generate all characters')
  .action(async () => {
    console.log(`\n🎄 Protocol: Silent Night - All Characters Generator`);
    console.log(`====================================================\n`);

    for (const id of ALL_CHARACTERS) {
      try {
        await generateCharacter(id);
      } catch (error) {
        console.error(`❌ Failed to generate ${id}:`, error);
      }
    }
  });

// ============================================================================
// ANIMATION LIBRARY SYNC
// ============================================================================

program.command('sync-animations')
  .description('Sync animation library from Meshy API')
  .action(async () => {
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      throw new Error('MESHY_API_KEY environment variable not set');
    }

    console.log(`\n📚 Syncing Animation Library from Meshy API...\n`);

    const response = await fetch('https://api.meshy.ai/openapi/v1/animations/library', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch animation library: ${response.statusText}`);
    }

    const data = await response.json() as { result: Array<{ id: number; name: string; path: string }> };

    const byName: Record<string, number> = {};
    const byPath: Record<string, number> = {};

    for (const anim of data.result) {
      byName[anim.name] = anim.id;
      byPath[anim.path] = anim.id;
    }

    const libraryPath = path.join(
      path.dirname(new URL(import.meta.url).pathname),
      'tasks/definitions/animation-library.json'
    );

    fs.writeFileSync(libraryPath, JSON.stringify({ byName, byPath }, null, 2));
    console.log(`✅ Saved ${data.result.length} animations to animation-library.json`);
  });

// ============================================================================
// LIST CHARACTERS
// ============================================================================

program.command('list')
  .description('List all available character manifests')
  .action(() => {
    console.log(`\n🎄 Protocol: Silent Night - Available Characters`);
    console.log(`=================================================\n`);

    console.log('Heroes:');
    for (const id of HERO_CHARACTERS) {
      const manifestPath = path.join(CHARACTERS_DIR, id, 'manifest.json');
      const exists = fs.existsSync(manifestPath);
      console.log(`  ${exists ? '✓' : '✗'} ${id}`);
    }

    console.log('\nEnemies:');
    for (const id of ENEMY_CHARACTERS) {
      const manifestPath = path.join(CHARACTERS_DIR, id, 'manifest.json');
      const exists = fs.existsSync(manifestPath);
      console.log(`  ${exists ? '✓' : '✗'} ${id}`);
    }
    console.log('');
  });

program.parse();
