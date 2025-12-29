## SENTINEL'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2024-05-22 - [Data Persistence Security]
**Vulnerability:** Local storage data persistence (`src/store/gameStore.ts`) is protected against tampering using an FNV-1a checksum mechanism (`src/utils/security.ts`), but the integrity check relies on a client-side secret if not carefully managed (though FNV is just a hash, not cryptographic).
**Learning:** Client-side "security" for save games is mostly obfuscation. The learning here is that FNV-1a is fast but not cryptographically secure, which is acceptable for single-player game save integrity but not for preventing determined cheating.
**Prevention:** If leaderboard or competitive features are added, server-side validation is required. For now, the current mechanism prevents accidental corruption and casual editing.
