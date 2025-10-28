# DESIGN.md

This document outlines the technical design choices for the retro FPS project.

## Engine Choice

We will be using **Three.js**, a powerful and versatile 3D library for the web. While a classic 2.5D ray-casting engine would perfectly capture the feel of games like Wolfenstein 3D, Three.js provides a more flexible foundation that will allow for more complex geometry, lighting, and effects, closer to the Doom and Quake era, while still allowing us to enforce retro aesthetic constraints (low-res textures, limited color palettes, etc.). This choice also provides a solid base for future expansion.

## Collision Approach

Collisions will be handled using **Axis-Aligned Bounding Boxes (AABB)** for all dynamic entities (player, enemies, pickups). For the level geometry, we will use a simple wall-based collision system. The player will be treated as a cylinder, and collisions will be resolved by sliding along the walls. This approach is computationally inexpensive and well-suited for the corridor-style levels we will be building.

## AI State Machine

Enemy AI will be implemented using a **Finite-State Machine (FSM)**. The initial enemy type will have the following states:

- **IDLE:** The enemy is stationary or patrolling a small area, waiting for the player.
- **PURSUE:** The enemy has detected the player (via line-of-sight or sound) and is moving towards them. Pathfinding will be handled by the `three-pathfinding` library on a navigation mesh generated from the level data.
- **ATTACK:** The enemy is within range of the player and is performing its attack.
- **FLINCH:** The enemy has taken damage and briefly recoils, interrupting its current action.
- **DIE:** The enemy has reached zero health and is playing its death animation.

## Data Formats

Level data will be defined in **JSON format**. This allows for easy creation and modification of levels without needing to recompile the game. The JSON files will define:

- **Geometry:** A list of sectors, walls, and their properties (textures, height, etc.).
- **Entities:** The initial placement of the player, enemies, and items (health, ammo, keys).
- **Triggers:** The location and behavior of interactive elements like doors, lifts, and switches.
- **NavMesh:** A pre-calculated navigation mesh for AI pathfinding.
