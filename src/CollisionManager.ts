import * as THREE from 'three';
import { Player } from './Player';

export class CollisionManager {
  private raycaster = new THREE.Raycaster();
  private collisionDistance = 0.5;

  public checkCollisions(player: Player, collidableMeshes: THREE.Mesh[]) {
    const playerPosition = player.getObject().position;
    const playerVelocity = player.velocity;

    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];

    for (const direction of directions) {
      this.raycaster.set(playerPosition, direction);
      const intersects = this.raycaster.intersectObjects(collidableMeshes, true);

      if (intersects.length > 0 && intersects[0].distance < this.collisionDistance) {
        if (direction.x > 0 && playerVelocity.x > 0) {
          playerVelocity.x = 0;
        }
        if (direction.x < 0 && playerVelocity.x < 0) {
          playerVelocity.x = 0;
        }
        if (direction.z > 0 && playerVelocity.z > 0) {
          playerVelocity.z = 0;
        }
        if (direction.z < 0 && playerVelocity.z < 0) {
          playerVelocity.z = 0;
        }
      }
    }
  }
}
