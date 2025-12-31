## 2024-05-22 - Local Storage Integrity
**Vulnerability:** Game state stored in `localStorage` was plain JSON, allowing trivial modification (cheating) by users.
**Learning:** Client-side games need data integrity checks even if they can't be perfectly secure. The original architecture assumed a checksum mechanism that was missing.
**Prevention:** Implemented FNV-1a checksum wrapper for all persisted data. Loading logic now validates checksums and falls back to safe defaults on tampering, while maintaining backward compatibility for legacy saves.
