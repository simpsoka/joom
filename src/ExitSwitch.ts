import * as THREE from 'three';

export class ExitSwitch {
  public mesh: THREE.Mesh;
  public isOn = false;

  constructor(position: THREE.Vector3) {
    const geometry = new THREE.BoxGeometry(0.5, 1, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  public activate() {
    this.isOn = true;
    // For now, we'll just change the color of the switch
    (this.mesh.material as THREE.MeshBasicMaterial).color.set(0xff0000);
  }
}
