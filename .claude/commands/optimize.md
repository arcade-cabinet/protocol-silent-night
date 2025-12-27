---
allowed-tools: Read,Glob,Grep,LS
description: Analyze code for performance optimizations
---

# Performance Optimization Analysis

Analyze the specified code for performance issues and suggest optimizations.

## Usage

`/optimize <file-or-pattern>`

## Analysis Areas

### 1. Game Loop Performance
- Check for allocations inside update loops
- Identify expensive calculations that could be cached
- Look for unnecessary object creation

### 2. Rendering Efficiency
- Canvas context state changes
- Draw call batching opportunities
- Sprite atlas usage
- Off-screen rendering for complex elements

### 3. Memory Management
- Object pooling opportunities
- Garbage collection triggers
- Array pre-allocation
- Avoiding closures in hot paths

### 4. Data Structures
- Array vs Set/Map for lookups
- Spatial partitioning for collision detection
- Sorted arrays for binary search opportunities

### 5. Algorithm Complexity
- O(n²) loops that could be O(n) or O(n log n)
- Early exit opportunities
- Memoization candidates

## Output Format

For each optimization found:

1. **Issue**: What the problem is
2. **Location**: File, function, line
3. **Impact**: Estimated performance improvement
4. **Solution**: Specific code change with example
5. **Priority**: Critical / High / Medium / Low

## Game-Specific Considerations

- Target: 60 FPS on mid-range devices
- Canvas 2D rendering constraints
- Large entity counts (enemies, projectiles)
- Particle system efficiency

---
