import * as THREE from 'three';
import { Wad } from '@perry-rylance/doom-wad';
import { CollisionManager } from './collision-manager';

export class LevelManager {
  private scene: THREE.Scene;
  private collisionManager: CollisionManager;

  constructor(scene: THREE.Scene, collisionManager: CollisionManager) {
    this.scene = scene;
    this.collisionManager = collisionManager;
  }

  public buildLevel(wad: Wad, levelName: string): void {
    const level = wad.levels.get(levelName);
    if (!level) {
      throw new Error(`Level ${levelName} not found in WAD`);
    }

    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    level.linedefs.forEach(linedef => {
      const start = level.vertexes[linedef.startVertex];
      const end = level.vertexes[linedef.endVertex];

      const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

      const wallGeometry = new THREE.BoxGeometry(length, 10, 1);
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);

      wall.position.x = (start.x + end.x) / 2;
      wall.position.z = (start.y + end.y) / 2;
      wall.position.y = 5;

      wall.rotation.y = Math.atan2(end.y - start.y, end.x - start.x);

      this.scene.add(wall);
      this.collisionManager.addCollidable(wall);
    });
  }
}
