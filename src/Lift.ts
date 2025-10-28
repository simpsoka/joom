import * as THREE from 'three';

export class Lift {
  public mesh: THREE.Mesh;
  public isActive = false;
  private startPosition: THREE.Vector3;
  private endPosition: THREE.Vector3;
  private animationSpeed = 0.05;

  constructor(position: THREE.Vector3, endPosition: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(4, 0.2, 4);
    const material = new THREE.MeshBasicMaterial({ color: 0x444444 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    this.startPosition = position.clone();
    this.endPosition = endPosition;
  }

  public activate() {
    this.isActive = true;
  }

  public deactivate() {
    this.isActive = false;
  }

  public update() {
    if (this.isActive) {
      if (this.mesh.position.y < this.endPosition.y) {
        this.mesh.position.y += this.animationSpeed;
      }
    } else {
      if (this.mesh.position.y > this.startPosition.y) {
        this.mesh.position.y -= this.animationSpeed;
      }
    }
  }
}
