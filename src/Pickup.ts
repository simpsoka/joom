import * as THREE from 'three';

export enum PickupType {
  HEALTH,
  ARMOR,
}

export class Pickup {
  public mesh: THREE.Mesh;

  constructor(position: THREE.Vector3, public type: PickupType, public value: number) {
    const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    let material: THREE.MeshBasicMaterial;
    switch (type) {
      case PickupType.HEALTH:
        material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        break;
      case PickupType.ARMOR:
        material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        break;
    }
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }
}
