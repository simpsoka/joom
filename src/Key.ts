import * as THREE from 'three';

export class Key {
  public mesh: THREE.Mesh;

  constructor(position: THREE.Vector3, public id: number) {
    const geometry = new THREE.BoxGeometry(0.2, 0.5, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }
}
