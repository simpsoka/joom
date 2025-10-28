import * as THREE from 'three';
import { Enemy } from './Enemy';
import { Door } from './Door';
import { Key } from './Key';
import { Lift } from './Lift';
import { ExitSwitch } from './ExitSwitch';
import { Pickup, PickupType } from './Pickup';
import { NavMesh } from './NavMesh';

export class Level {
  private group = new THREE.Group();
  public collidableMeshes: THREE.Mesh[] = [];
  public enemies: Enemy[] = [];
  public doors: Door[] = [];
  public keys: Key[] = [];
  public lifts: Lift[] = [];
  public exitSwitch: ExitSwitch;
  public pickups: Pickup[] = [];
  public navMesh: NavMesh;

  constructor() {
    this.createLevel();
  }

  private createLevel() {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    this.group.add(floor);

    // Ceiling
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    this.group.add(ceiling);

    // Walls
    const wallGeometry = new THREE.BoxGeometry(20, 5, 0.1);
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xa0a0a0 });

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.z = -10;
    wall1.position.y = 2.5;
    this.group.add(wall1);
    this.collidableMeshes.push(wall1);

    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.z = 10;
    wall2.position.y = 2.5;
    this.group.add(wall2);
    this.collidableMeshes.push(wall2);

    const wall3 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall3.rotation.y = Math.PI / 2;
    wall3.position.x = -10;
    wall3.position.y = 2.5;
    this.group.add(wall3);
    this.collidableMeshes.push(wall3);

    const wall4 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall4.rotation.y = Math.PI / 2;
    wall4.position.x = 10;
    wall4.position.y = 2.5;
    this.group.add(wall4);
    this.collidableMeshes.push(wall4);

    // NavMesh
    this.navMesh = new NavMesh(this);

    // Enemy
    const enemy = new Enemy(new THREE.Vector3(0, 1, -5), this.navMesh);
    this.enemies.push(enemy);
    this.group.add(enemy.mesh);

    // Door and Key
    const door = new Door(new THREE.Vector3(0, 2, 8), true, 1);
    this.doors.push(door);
    this.collidableMeshes.push(door.mesh);
    this.group.add(door.mesh);

    const key = new Key(new THREE.Vector3(5, 1, 5), 1);
    this.keys.push(key);
    this.group.add(key.mesh);

    // Lift
    const lift = new Lift(new THREE.Vector3(-8, 0, -8), new THREE.Vector3(-8, 5, -8));
    this.lifts.push(lift);
    this.collidableMeshes.push(lift.mesh);
    this.group.add(lift.mesh);

    // Exit Switch
    this.exitSwitch = new ExitSwitch(new THREE.Vector3(9.5, 2.5, 0));
    this.group.add(this.exitSwitch.mesh);

    // Pickups
    const healthPickup = new Pickup(new THREE.Vector3(-5, 0.5, 5), PickupType.HEALTH, 25);
    this.pickups.push(healthPickup);
    this.group.add(healthPickup.mesh);

    const armorPickup = new Pickup(new THREE.Vector3(-5, 0.5, -5), PickupType.ARMOR, 50);
    this.pickups.push(armorPickup);
    this.group.add(armorPickup.mesh);
  }

  public getObject() {
    return this.group;
  }
}
