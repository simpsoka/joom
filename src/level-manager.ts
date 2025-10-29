import * as THREE from 'three';
import type { Wad } from '@perry-rylance/doom-wad';
import type { CollisionManager } from './collision-manager';
import Textmap from '@perry-rylance/doom-wad/dist/Lumps/Textmap';

// The Linedef type is not exported, so we have to define it ourselves.
// This is not ideal, but it's the only way to get this to compile.
interface Linedef {
  type: 'linedef';
  properties: {
    v1: number;
    v2: number;
    [key: string]: boolean | number | string;
  };
}


export class LevelManager {
  private scene: THREE.Scene;
  private collisionManager: CollisionManager;

  constructor(scene: THREE.Scene, collisionManager: CollisionManager) {
    this.scene = scene;
    this.collisionManager = collisionManager;
  }

  public buildLevel(wad: Wad): void {
    const textmapLump = wad.lumps.find(lump => lump.name === 'TEXTMAP');

    if (!textmapLump || !(textmapLump instanceof Textmap)) {
      throw new Error('TEXTMAP lump not found or is not a Textmap');
    }

    const textmap = textmapLump as Textmap;
    const vertexes = textmap.blocks.filter(block => block.type === 'vertex');
    const linedefs = textmap.blocks.filter(block => block.type === 'linedef') as Linedef[];

    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    linedefs.forEach((linedef: Linedef) => {
      const startVertex = vertexes[linedef.properties.v1 as number];
      const endVertex = vertexes[linedef.properties.v2 as number];

      if (startVertex && endVertex) {
        const start = startVertex.properties;
        const end = endVertex.properties;

        const length = Math.sqrt(Math.pow((end.x as number) - (start.x as number), 2) + Math.pow((end.y as number) - (start.y as number), 2));

        const wallGeometry = new THREE.BoxGeometry(length, 10, 1);
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);

        wall.position.x = ((start.x as number) + (end.x as number)) / 2;
        wall.position.z = ((start.y as number) + (end.y as number)) / 2;
        wall.position.y = 5;

        wall.rotation.y = Math.atan2((end.y as number) - (start.y as number), (end.x as number) - (start.x as number));

        this.scene.add(wall);
        this.collisionManager.addCollidable(wall);
      }
    });
  }
}
