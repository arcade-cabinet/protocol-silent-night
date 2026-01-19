# Asset Attribution

Protocol: Silent Night uses assets from various CC0 and permissively licensed sources.

## Audio Assets

### Kenney.nl (CC0 1.0)
- **UI Audio Pack**: Click, confirm, cancel sounds
- **Music Jingles (Retro)**: Victory, defeat, level complete jingles

All Kenney assets are licensed under CC0 1.0 Universal (Public Domain).
https://kenney.nl/

## 3D Models

### KayKit (KayKit License)
Character models may be adapted from KayKit Adventurers pack.
https://kaylousberg.com/

### Quaternius (CC0 1.0)
Environmental and character assets.
https://quaternius.com/

## Textures

### AmbientCG (CC0 1.0)
PBR texture materials.
https://ambientcg.com/

---

## Adding New Assets

When adding new assets to this project:

1. Ensure license compatibility (CC0, MIT, Apache 2.0, or similar)
2. Add attribution entry in this file
3. Update the asset manifest in `packages/game-core/src/data/assets.json`
4. Place files in the appropriate subdirectory:
   - `audio/ui/` - UI interaction sounds
   - `audio/sfx/` - Game sound effects
   - `audio/jingles/` - Music jingles and fanfares
   - `audio/music/` - Background music loops
   - `characters/` - Player character models
   - `enemies/` - Enemy models
   - `weapons/` - Weapon models and effects
   - `environment/` - Terrain and skybox assets
   - `ui/` - UI sprites and icons
