import * as THREE from 'three';
import { PlayerController } from './player-controller';
import { CollisionManager } from './collision-manager';
import { LevelManager } from './level-manager';
import type { Wad } from '@perry-rylance/doom-wad';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private playerController: PlayerController;
  private clock: THREE.Clock;
  private collisionManager: CollisionManager;
  private levelManager: LevelManager;

  constructor(canvas: HTMLCanvasElement, wad: Wad) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.collisionManager = new CollisionManager();
    this.playerController = new PlayerController(this.camera, this.canvas, this.collisionManager);
    this.clock = new THREE.Clock();
    this.levelManager = new LevelManager(this.scene, this.collisionManager);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.add(new THREE.AmbientLight(0xffffff));

    this.levelManager.buildLevel(wad);

    this.camera.position.y = 1.8; // Player height
  }

  public start(): void {
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    this.playerController.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
