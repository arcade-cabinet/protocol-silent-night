## 2024-05-22 - Local Storage Integrity
**Vulnerability:** Game state stored in `localStorage` was plain JSON, allowing trivial modification (cheating) by users.
**Learning:** Client-side games need data integrity checks even if they can't be perfectly secure. The original architecture assumed a checksum mechanism that was missing.
**Prevention:** Implemented FNV-1a checksum wrapper for all persisted data. Loading logic now validates checksums and falls back to safe defaults on tampering, while maintaining backward compatibility for legacy saves.

## 2024-05-22 - Secure Random Number Generation
**Vulnerability:** `SeededRandom` utilized `Math.random()` for default seed generation, which provides weak entropy and is predictable.
**Learning:** Even in non-critical gaming contexts, core primitives like RNG should default to secure implementations to prevent misuse in future security-sensitive contexts (like session IDs).
**Prevention:** Upgraded `SeededRandom` to use `crypto.getRandomValues()` when available for initial seeding, ensuring better entropy for the RNG state.
