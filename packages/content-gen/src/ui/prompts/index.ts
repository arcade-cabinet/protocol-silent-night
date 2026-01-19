const DIALOGUE_SCHEMA = `
{
  "dialogues": {
    "scene_id": [
      {
        "id": "unique_id",
        "speaker": "Character Name",
        "text": "Dialogue text",
        "next": "next_node_id_or_null"
      }
    ]
  }
}
`;

const LORE_SCHEMA = `
{
  "lore": {
    "shard_id": {
      "title": "Title",
      "content": "Lore text content"
    }
  }
}
`;

export const STORY_A_PROMPT = `
You are the Lead Narrative Designer for "Neo-Tokyo: Rival Academies".
Generate the "A-Story" Arc (The Main Rivalry).
Context: Kai (Hot-headed Biker) vs Vera (Calculated Student Council President).
They are racing through Neo-Tokyo.

Task: Generate 3 Dialogue Scenes:
1. "intro": They meet at the starting line.
2. "mid_race": They trade insults while driving.
3. "climax": The finish line confrontation.

Output Format: JSON ONLY. Adhere strictly to this schema:
${DIALOGUE_SCHEMA}

Example Output:
{
  "dialogues": {
    "intro": [
      { "id": "intro_1", "speaker": "Kai", "text": "Ready to lose?", "next": "intro_2" },
      { "id": "intro_2", "speaker": "Vera", "text": "Unlikely.", "next": null }
    ]
  }
}

Ensure the tone is competitive, anime-inspired, and punchy. Generate 5-10 nodes per scene.
`;

export const STORY_B_PROMPT = `
You are the Narrative Designer.
Generate the "B-Story" Arc (The Glitch Mystery).
Context: The game world is actually a simulation that is breaking down.
Players find "Data Shards" that reveal the truth.

Task: Generate 5 Lore Entries (Data Shards).
IDs: shard_glitch_1 to shard_glitch_5.

Output Format: JSON ONLY. Adhere strictly to this schema:
${LORE_SCHEMA}

Example Output:
{
  "lore": {
    "shard_glitch_1": { "title": "Error Log", "content": "Buffer overflow detected in sector 7." }
  }
}

The content should be cryptic logs, error reports, or panicked messages from "Admin".
`;

export const STORY_C_PROMPT = `
You are the Narrative Designer.
Generate the "C-Story" Arc (Chaotic Interruptions).
Context: Random events disrupt the race (Alien Abduction, Giant Cat Attack, Mall Sale).

Task: Generate 3 Dialogue Scenes for these interruptions:
1. "event_aliens": Aliens beam them up.
2. "event_cat": A giant cat blocks the road.
3. "event_mall": They accidentally crash into a shopping mall.

Output Format: JSON ONLY. Adhere strictly to this schema:
${DIALOGUE_SCHEMA}

Example Output:
{
  "dialogues": {
    "event_aliens": [
      { "id": "alien_1", "speaker": "Kai", "text": "Why am I floating?", "next": null }
    ]
  }
}

Keep it humorous and absurd. Generate 3-5 nodes per scene.
`;

export const SVG_ICON_PROMPT = (itemName: string, type: string) => `
You are an expert SVG artist specializing in Cyberpunk, Neo-Tokyo, and Anime aesthetic vector art.
Generate a minimal, clean, optimized SVG icon for a game UI.

Item Name: "${itemName}"
Item Type: "${type}"

Requirements:
1.  **Format**: Return ONLY the raw <svg>...</svg> code. No markdown code blocks, no JSON, no explanation.
2.  **ViewBox**: Use viewBox="0 0 512 512".
3.  **Style**:
    -   Thick, distinct outlines (stroke-width: 10-20px).
    -   High contrast colors (Neon Pink #FF00FF, Cyan #00FFFF, Electric Blue #0099FF) against dark fills.
    -   Cel-shaded look (flat colors, hard shadows).
    -   Aggressive, angular shapes.
4.  **Content**:
    -   If it's a weapon, make it look dangerous and futuristic.
    -   If it's an item, make it look recognizable but tech-infused.
    -   If it's a logo, make it bold and graffiti-like.

Code ONLY.
`;

export const ASSET_LIST = [
  { name: 'Cyber Katana', type: 'Weapon', filename: 'IconKatana' },
  { name: 'Plasma Pistol', type: 'Weapon', filename: 'IconPistol' },
  { name: 'Ramen Bowl', type: 'Consumable', filename: 'IconRamen' },
  { name: 'Data Shard', type: 'KeyItem', filename: 'IconShard' },
  { name: 'Neon Health Pack', type: 'Consumable', filename: 'IconHealth' },
  { name: 'Yakuza Crest', type: 'Faction', filename: 'LogoYakuza' },
  { name: 'Biker Skull', type: 'Faction', filename: 'LogoBiker' },
];
