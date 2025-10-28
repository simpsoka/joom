import * as THREE from 'three';
import { Player } from './Player';
import { NavMesh } from './NavMesh';

enum EnemyState {
  IDLE,
  CHASING,
  ATTACKING,
}

export class Enemy {
  public mesh: THREE.Mesh;
  public health = 100;
  private state = EnemyState.IDLE;
  private speed = 0.05;
  private detectionRange = 10;
  private attackRange = 2;
  private lastAttackTime = 0;
  private attackCooldown = 1000; // milliseconds
  private path: THREE.Vector3[] = [];
  private navMesh: NavMesh;

  constructor(position: THREE.Vector3, navMesh: NavMesh) {
    this.navMesh = navMesh;
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      // The enemy is dead
    }
  }

  public update(player: Player) {
    const distanceToPlayer = this.mesh.position.distanceTo(player.getObject().position);

    switch (this.state) {
      case EnemyState.IDLE:
        if (distanceToPlayer < this.detectionRange) {
          this.state = EnemyState.CHASING;
        }
        break;
      case EnemyState.CHASING:
        if (distanceToPlayer < this.attackRange) {
          this.state = EnemyState.ATTACKING;
          this.path = [];
        } else if (distanceToPlayer > this.detectionRange) {
          this.state = EnemyState.IDLE;
          this.path = [];
        } else {
          this.path = this.navMesh.findPath(this.mesh.position, player.getObject().position);
          if (this.path && this.path.length > 1) {
            const direction = new THREE.Vector3().subVectors(this.path[1], this.mesh.position).normalize();
            this.mesh.position.add(direction.multiplyScalar(this.speed));
          }
        }
        break;
      case EnemyState.ATTACKING:
        if (distanceToPlayer > this.attackRange) {
          this.state = EnemyState.CHASING;
        } else {
          const now = Date.now();
          if (now - this.lastAttackTime > this.attackCooldown) {
            player.takeDamage(10);
            this.lastAttackTime = now;
          }
        }
        break;
    }
  }
}
