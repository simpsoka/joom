import * as THREE from 'three';
import { Player } from './Player';

export class Weapon {
  private lastFireTime = 0;
  private fireRate = 150; // milliseconds
  private recoil = 0.01;
  private spread = 0.01;

  public fire(player: Player, scene: THREE.Scene) {
    const currentTime = performance.now();
    if (currentTime - this.lastFireTime < this.fireRate) {
      return null;
    }
    this.lastFireTime = currentTime;

    // Apply recoil
    player.camera.rotation.x -= this.recoil;

    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    player.camera.getWorldDirection(direction);

    // Apply spread
    direction.x += (Math.random() - 0.5) * this.spread;
    direction.y += (Math.random() - 0.5) * this.spread;
    direction.z += (Math.random() - 0.5) * this.spread;

    raycaster.set(player.camera.position, direction);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      return intersects[0];
    }

    return null;
  }
}
