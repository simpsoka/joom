import * as THREE from 'three';

export class Door {
  public mesh: THREE.Mesh;
  public isOpen = false;
  public isLocked = false;
  public keyId: number | null = null;
  private openPosition: THREE.Vector3;
  private closedPosition: THREE.Vector3;
  private animationSpeed = 0.05;

  constructor(position: THREE.Vector3, isLocked = false, keyId: number | null = null) {
    const geometry = new THREE.BoxGeometry(2, 4, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    this.closedPosition = position.clone();
    this.openPosition = position.clone().add(new THREE.Vector3(0, 0, -2));
    this.isLocked = isLocked;
    this.keyId = keyId;
  }

  public open() {
    if (!this.isLocked) {
      this.isOpen = true;
    }
  }

  public close() {
    this.isOpen = false;
  }

  public unlock() {
    this.isLocked = false;
  }

  public update() {
    if (this.isOpen) {
      if (this.mesh.position.z > this.openPosition.z) {
        this.mesh.position.z -= this.animationSpeed;
      }
    } else {
      if (this.mesh.position.z < this.closedPosition.z) {
        this.mesh.position.z += this.animationSpeed;
      }
    }
  }
}
