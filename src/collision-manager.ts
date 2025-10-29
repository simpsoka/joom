import * as THREE from 'three';

export class CollisionManager {
  private collidables: THREE.Box3[] = [];

  public addCollidable(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    this.collidables.push(box);
  }

  public checkCollision(playerBox: THREE.Box3): boolean {
    for (const collidable of this.collidables) {
      if (playerBox.intersectsBox(collidable)) {
        return true;
      }
    }
    return false;
  }
}
