# Board Generation Contract

This document defines the environment problem the reboot is actually solving.

## Core Decision

`Protocol: Silent Night` should be built as a board-first roguelike arena.

That means:

- the gameboard fills the viewport
- the player reads space primarily as a combat board
- environment identity comes from surface treatment, obstacle composition, decals, and landmarks
- procedural generation should optimize readability and variety, not scenic topography

## Why This Is More Faithful

This better matches the game than a heightmap-terrain approach because:

- the POC already behaves like a survival arena board
- mobile roguelike readability depends on pathing clarity and pressure space
- holidaypunk identity is more likely to come from composition and dressing than from elevation

## Environment Sources

The mounted asset library at `/Volumes/home/assets/2DPhotorealistic` supports this direction directly.

Relevant categories already available:

- `MATERIAL/1K-JPG`
- `DECAL/1K-JPG`
- `PLAIN/Backdrop*`
- `TERRAIN/Terrain*`

Representative available surface families include:

- `Asphalt*`
- `Concrete*`
- `Gravel*`
- `Fabric*`

Representative available decal families include:

- `AsphaltDamage001`
- `Leaking*`
- `ManholeCover*`
- `PavingEdge*`
- `RoadLines*`

These are enough to support a snowy industrial board language without requiring a scenic world pipeline first.

## What `Gaea` Should Generate

`Gaea` should be used to generate board structure, not dramatic landform relief.

Primary outputs:

- walkable board mask
- perimeter silhouette and outer ridge dressing
- spawn anchors
- boss staging space
- decorative snow drift slots
- optional non-blocking landmark slots

Secondary outputs:

- low-relief board base selection
- sparse elevation accents only where they do not hurt readability

## What `Gaea` Should Not Generate

Avoid treating `Gaea` as a system for:

- mountainous terrain
- scenic cliffs
- horizon composition
- skybox-dependent environments
- vertical traversal
- deep z-axis combat complexity

If a generated feature makes enemy pressure, pickup readability, or dash navigation worse, it is the wrong feature for this game.

## Visual Composition Model

The board should be authored as layered composition:

1. Board base
2. Surface zoning
3. Navigation decals
4. Obstacles and cover silhouettes
5. Landmark props
6. Seasonal and holidaypunk dressing
7. Lighting and VFX accents

### 1. Board Base

Use:

- flat plane
- low-relief terrain mesh
- bounded arena slab

Do not assume a sculpted terrain height field is necessary.

### 2. Surface Zoning

Primary zones should be assembled from PBR material families such as:

- icy lake floor
- packed snow drifts
- frozen industrial perimeter dressing

These surfaces should communicate mood and silhouette without introducing gameplay complexity the POC does not have.

### 3. Navigation Decals

Use decals to provide tactical readability:

- subtle grid breakup
- edge falloff
- frozen wear patterns
- restrained industrial grime at the perimeter

### 4. Obstacles And Cover Silhouettes

Obstacle generation should focus on readable pressure patterns:

- straight blockers
- corner blockers
- clustered junk
- circular hazards
- boss-safe-radius boundaries

### 5. Landmark Props

Landmarks are the strongest place to express holidaypunk:

- broken gift machinery
- present stacks
- industrial wreath frames
- candy-cane barriers
- neon nativity fragments
- frozen utility pylons
- workshop salvage heaps

These need not be sourced entirely from premade assets; they can be assembled compositionally.

## Camera And Framing

Camera rules:

- keep the whole board readable
- favor orthographic or low-perspective isometric/top-down framing
- do not spend budget on vistas
- do not require skybox readability for the environment to work

The player should read the board in one glance.

## Generation Quality Metrics

A generated board is good if:

- enemy approach vectors are readable in open space
- spawn positions are fair but varied
- presents are readable against the floor
- boss space is clean and readable
- perimeter dressing enriches the silhouette without cluttering combat
- the board feels festive-industrial rather than generic urban or generic snowfield

## Testable Output Contract

Worldgen tests should assert:

- deterministic output for the same seed
- minimum clean playable area
- guaranteed player spawn safety radius
- guaranteed boss arena radius
- bounded decorative density at the perimeter
- minimum present visibility contrast against the arena floor

## Anti-Goals

Do not let environment work drift into:

- open-world terrain thinking
- realistic snow simulation as a prerequisite
- sky and weather systems before the board reads well
- vertical spectacle that harms combat clarity
- procedural generation that produces novelty without tactical value
