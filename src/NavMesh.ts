import * as THREE from 'three';
import { Pathfinding } from 'three-pathfinding';
import { Level } from './Level';

export class NavMesh {
  private pathfinding = new Pathfinding();
  private zone: any;

  constructor(level: Level) {
    const levelGroup = level.getObject();
    const meshes: THREE.Mesh[] = [];
    levelGroup.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        meshes.push(node);
      }
    });

    const zone = Pathfinding.createZone(meshes.map(mesh => mesh.geometry));
    this.pathfinding.setZoneData('level', zone);
    this.zone = zone;
  }

  public findPath(start: THREE.Vector3, end: THREE.Vector3) {
    const groupID = this.pathfinding.getGroup('level', start);
    return this.pathfinding.findPath(start, end, 'level', groupID);
  }
}
