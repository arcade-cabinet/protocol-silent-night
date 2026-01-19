import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORY_A_PROMPT, STORY_B_PROMPT, STORY_C_PROMPT } from '../prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateArc(model: any, prompt: string, arcName: string) {
  console.log(`Generating ${arcName}...`);
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Sanitize JSON
    text = text.replace(/```json/g, '').replace(/```/g, '');
    const json = JSON.parse(text);
    return json;
  } catch (e) {
    console.error(`Failed to generate ${arcName}:`, e);
    return null;
  }
}

export async function generateFullStory() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Skipping Story Generation: GEMINI_API_KEY not found.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Remove unsupported config for now or assume newer SDK supports it if upgraded,
  // but to fix build error, let's remove responseMimeType if it's not in the type definition.
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const [storyA, storyB, storyC] = await Promise.all([
    generateArc(model, STORY_A_PROMPT, 'A-Story'),
    generateArc(model, STORY_B_PROMPT, 'B-Story'),
    generateArc(model, STORY_C_PROMPT, 'C-Story'),
  ]);

  // Validate results
  if (!storyA || !storyB || !storyC) {
      console.error("Story generation incomplete. Skipping write.");
      return; // Or throw error
  }

  // Deep merge strategy:
  // A-Story provides 'dialogues'
  // B-Story provides 'lore'
  // C-Story provides 'dialogues'

  const mergedStory = {
    dialogues: {
      ...(storyA?.dialogues || {}),
      ...(storyC?.dialogues || {})
    },
    lore: {
      ...(storyB?.lore || {})
    },
    items: {}, // Items are currently static or procedural, not yet LLM generated in this pass
    generated_at: new Date().toISOString()
  };

  const outputPath = path.resolve(__dirname, '../../../../packages/game/src/data/story_gen.json');
  fs.writeFileSync(outputPath, JSON.stringify(mergedStory, null, 2));
  console.log(`Full Story written to ${outputPath}`);
}
