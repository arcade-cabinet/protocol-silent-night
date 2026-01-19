# Product Context - Protocol: Silent Night

## Why This Product Exists

Protocol: Silent Night exists to prove that JavaScript/TypeScript tools can create premium mobile games that rival native App Store quality. It's not a web wrapper or PWA compromise - it's a real native game.

## Problems It Solves

### For Players
1. **Quick Fun:** 30-second gameplay loops perfect for mobile sessions
2. **Depth Without Complexity:** Roguelike progression without overwhelming mechanics
3. **Offline Play:** Full game experience without network dependency
4. **Premium Feel:** No ads, no aggressive monetization in v1.0

### For the Developer (jbcom)
1. **Portfolio Piece:** Demonstrates mobile-native game development skills
2. **Architecture Exploration:** Validates React Native + BabylonJS stack
3. **AI Agent Collaboration:** Testbed for multi-agent development workflows

## Core Gameplay Loop

```
┌─────────────────────────────────────────────────────────┐
│                      GAME LOOP                          │
├─────────────────────────────────────────────────────────┤
│  1. SELECT    → Choose mech class (Santa/Elf/Bumble)   │
│  2. BRIEFING  → Mission narrative with objectives       │
│  3. FIGHT     → Survive waves on isometric arena       │
│  4. LEVEL UP  → Pick roguelike upgrade (choice of 3)   │
│  5. BOSS      → Defeat KRAMPUS-PRIME                    │
│  6. PROGRESS  → Earn Nice Points for meta-upgrades     │
│  7. REPEAT    → Endless mode or return to menu         │
└─────────────────────────────────────────────────────────┘
```

## Target Audience

- **Primary:** Mobile gamers who enjoy roguelikes (Vampire Survivors, Soul Knight)
- **Secondary:** Nostalgic gamers who love JRPG aesthetics (FF7, FF Tactics)
- **Tertiary:** Casual players seeking quick, satisfying gameplay sessions

## Design Pillars

### 1. 30-Second Fun
Every interaction should feel satisfying within 30 seconds. No slow starts, no tutorial walls, immediate action.

### 2. Mobile-First
Every feature designed for touch input and phone form factor. Not "web that works on mobile" - truly mobile-native.

### 3. Anime Style
DBZ combat explosions, Ghost in the Shell character aesthetics, Final Fantasy HUD systems. Visual flair over realism.

### 4. Data-Driven
All game content in JSON DDLs. Balance changes, new content, tuning adjustments - all without code deploys.

## User Experience Goals

| Aspect | Target |
|--------|--------|
| Time to first gameplay | < 30 seconds |
| Average session length | 5-15 minutes |
| Haptic feedback | Every meaningful action |
| Load times | < 3 seconds cold start |
| Battery drain | < 15% per 30 min |

## Success Metrics (v1.0)

- Ships to App Store and Play Store
- Maintains 4+ star rating
- < 0.1% crash rate
- 60fps on flagship, 30fps on mid-tier
- 75%+ test coverage
