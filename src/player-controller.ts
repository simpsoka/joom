import * as THREE from 'three';
import type { CollisionManager } from './collision-manager';

export class PlayerController {
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private collisionManager: CollisionManager;
  private isLocked = false;

  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;

  private velocity = new THREE.Vector3();
  private direction = new THREE.Vector3();

  private playerBox: THREE.Box3;

  constructor(camera: THREE.Camera, domElement: HTMLElement, collisionManager: CollisionManager) {
    this.camera = camera;
    this.domElement = domElement;
    this.collisionManager = collisionManager;

    this.playerBox = new THREE.Box3(
      new THREE.Vector3(-0.5, -1.8, -0.5),
      new THREE.Vector3(0.5, 0, 0.5)
    );

    this.domElement.addEventListener('click', () => {
      this.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.camera.rotation.y -= movementX * 0.002;
    this.camera.rotation.x -= movementY * 0.002;

    this.camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.camera.rotation.x)
    );
  }

  public update(delta: number): void {
    const speed = 5.0;
    const actualSpeed = speed * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * actualSpeed;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x += this.direction.x * actualSpeed;
    }

    const moveX = this.velocity.x * delta;
    const moveZ = this.velocity.z * delta;

    const originalPosition = this.camera.position.clone();

    this.camera.translateX(moveX);
    this.camera.translateZ(moveZ);

    const newPlayerBox = this.playerBox.clone().translate(this.camera.position);

    if (this.collisionManager.checkCollision(newPlayerBox)) {
      this.camera.position.copy(originalPosition);
    }


    // simple damping
    this.velocity.x *= 0.9;
    this.velocity.z *= 0.9;
  }
}
