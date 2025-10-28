import * as THREE from 'three';
import { Weapon } from './Weapon';
import { Game } from './Game';
import { GameState } from './GameState';

export class Player {
  public camera: THREE.PerspectiveCamera;
  public velocity = new THREE.Vector3();
  private pitchObject: THREE.Object3D;
  private yawObject: THREE.Object3D;
  private controls: { [key: string]: boolean } = {};
  public isShooting = false;
  private weapon: Weapon;
  public health = 100;
  public armor = 0;
  public keys: number[] = [];
  public isInteracting = false;
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add(this.camera);
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 1;
    this.yawObject.add(this.pitchObject);
    this.weapon = new Weapon();

    this.initControls();
  }

  private initControls() {
    document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    document.addEventListener('keydown', this.onKeyDown.bind(this), false);
    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    document.addEventListener('mousedown', () => { this.isShooting = true; });
    document.addEventListener('mouseup', () => { this.isShooting = false; });
    document.body.addEventListener('click', () => {
      document.body.requestPointerLock();
    });
  }

  private onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement === document.body) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      this.yawObject.rotation.y -= movementX * 0.002;
      this.pitchObject.rotation.x -= movementY * 0.002;
      this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    this.controls[event.key.toLowerCase()] = true;
    if (event.key === ' ') {
      this.isInteracting = true;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.controls[event.key.toLowerCase()] = false;
    if (event.key === ' ') {
      this.isInteracting = false;
    }
  }

  public getObject() {
    return this.yawObject;
  }

  public shoot(scene: THREE.Scene) {
    if (this.isShooting) {
      return this.weapon.fire(this, scene);
    }
    return null;
  }

  public takeDamage(amount: number) {
    if (this.armor > 0) {
      const damageToArmor = Math.min(this.armor, amount);
      this.armor -= damageToArmor;
      amount -= damageToArmor;
    }

    if (amount > 0) {
      this.health -= amount;
    }

    if (this.health <= 0) {
      this.game.setGameState(GameState.GAME_OVER);
    }
  }

  public dealDamage(amount: number) {
    this.health -= amount;
  }

  public addKey(keyId: number) {
    this.keys.push(keyId);
  }

  public hasKey(keyId: number) {
    return this.keys.includes(keyId);
  }

  public update(delta: number) {
    const moveSpeed = 10 * delta;
    if (this.controls['w']) {
      this.velocity.z = -moveSpeed;
    } else if (this.controls['s']) {
      this.velocity.z = moveSpeed;
    } else {
      this.velocity.z = 0;
    }

    if (this.controls['a']) {
      this.velocity.x = -moveSpeed;
    } else if (this.controls['d']) {
      this.velocity.x = moveSpeed;
    } else {
      this.velocity.x = 0;
    }

    // Apply rotation to velocity vector
    this.velocity.applyQuaternion(this.yawObject.quaternion);
  }

  public applyVelocity() {
    this.yawObject.position.add(this.velocity);
  }
}
