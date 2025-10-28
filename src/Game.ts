import * as THREE from 'three';
import { Player } from './Player';
import { Level } from './Level';
import { CollisionManager } from './CollisionManager';
import { Enemy } from './Enemy';
import { HUD } from './HUD';
import { Door } from './Door';
import { Key } from './Key';
import { Lift } from './Lift';
import { ExitSwitch } from './ExitSwitch';
import { Pickup, PickupType } from './Pickup';
import { GameState } from './GameState';
import { UIManager } from './UIManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private level: Level;
  private collisionManager: CollisionManager;
  private muzzleFlash: THREE.PointLight;
  private hud: HUD;
  private clock = new THREE.Clock();
  private gameState = GameState.MAIN_MENU;
  private uiManager: UIManager;

  constructor() {
    this.scene = new THREE.Scene();
    this.player = new Player(this);
    this.camera = this.player.camera;
    this.scene.add(this.player.getObject());

    this.level = new Level();
    this.scene.add(this.level.getObject());

    this.collisionManager = new CollisionManager();

    this.muzzleFlash = new THREE.PointLight(0xffffff, 10, 5);
    this.muzzleFlash.visible = false;
    this.camera.add(this.muzzleFlash);

    this.hud = new HUD();
    this.uiManager = new UIManager(this);

    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('game-canvas') as HTMLCanvasElement,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    this.uiManager.update(this.gameState);

    if (this.gameState !== GameState.PLAYING) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const delta = this.clock.getDelta();
    this.player.update(delta);
    this.collisionManager.checkCollisions(this.player, this.level.collidableMeshes);
    this.player.applyVelocity();

    // Update doors
    for (const door of this.level.doors) {
      door.update();
    }

    // Update lifts
    for (const lift of this.level.lifts) {
      lift.update();
    }

    // Update enemies
    for (const enemy of this.level.enemies) {
      enemy.update(this.player);
    }

    if (this.player.isInteracting) {
      this.handleInteraction();
      this.player.isInteracting = false;
    }

    this.checkPickups();

    const hit = this.player.shoot(this.scene);
    if (hit) {
      const hitMarker = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      hitMarker.position.copy(hit.point);
      this.scene.add(hitMarker);
      setTimeout(() => this.scene.remove(hitMarker), 100);

      this.muzzleFlash.visible = true;
      setTimeout(() => this.muzzleFlash.visible = false, 50);

      // Check if an enemy was hit
      for (const enemy of this.level.enemies) {
        if (hit.object === enemy.mesh) {
          enemy.takeDamage(20);
          if (enemy.health <= 0) {
            this.scene.remove(enemy.mesh);
            this.level.enemies.splice(this.level.enemies.indexOf(enemy), 1);
          }
        }
      }
    }

    this.hud.updateHealth(this.player.health);
    this.renderer.render(this.scene, this.camera);
  }

  private handleInteraction() {
    const playerPosition = this.player.getObject().position;
    const interactionRange = 2;

    // Check for key pickups
    for (const key of this.level.keys) {
      if (playerPosition.distanceTo(key.mesh.position) < interactionRange) {
        this.player.addKey(key.id);
        this.scene.remove(key.mesh);
        this.level.keys.splice(this.level.keys.indexOf(key), 1);
        return;
      }
    }

    // Check for door interactions
    for (const door of this.level.doors) {
      if (playerPosition.distanceTo(door.mesh.position) < interactionRange) {
        if (door.isLocked) {
          if (this.player.hasKey(door.keyId)) {
            door.unlock();
            door.open();
          }
        } else {
          if (door.isOpen) {
            door.close();
          } else {
            door.open();
          }
        }
        return;
      }
    }

    // Check for lift interactions
    for (const lift of this.level.lifts) {
      if (playerPosition.distanceTo(lift.mesh.position) < 3) {
        if (lift.isActive) {
          lift.deactivate();
          this.player.getObject().removeFromParent();
          this.scene.add(this.player.getObject());
        } else {
          lift.activate();
          lift.mesh.add(this.player.getObject());
        }
        return;
      }
    }

    // Check for exit switch interaction
    if (this.level.exitSwitch && playerPosition.distanceTo(this.level.exitSwitch.mesh.position) < interactionRange) {
      this.level.exitSwitch.activate();
      console.log('Level Complete!');
    }
  }

  private checkPickups() {
    const playerPosition = this.player.getObject().position;
    for (const pickup of this.level.pickups) {
      if (playerPosition.distanceTo(pickup.mesh.position) < 1) {
        switch (pickup.type) {
          case PickupType.HEALTH:
            this.player.health = Math.min(100, this.player.health + pickup.value);
            break;
          case PickupType.ARMOR:
            this.player.armor = Math.min(100, this.player.armor + pickup.value);
            break;
        }
        this.scene.remove(pickup.mesh);
        this.level.pickups.splice(this.level.pickups.indexOf(pickup), 1);
      }
    }
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    if (state === GameState.PLAYING) {
      document.body.requestPointerLock();
    }
  }
}
