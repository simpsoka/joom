// Joom - A Three.js Game

// --- Basic setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Event Listeners ---
const overlay = document.getElementById('overlay');
overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
    renderer.domElement.focus();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Player and Controls ---
const player = {
    health: 100,
    ink: 10,
    score: 0,
    speed: 5,
    turnSpeed: Math.PI / 100,
    position: new THREE.Vector3(0, 0.5, 0),
    isInvincible: false,
};
camera.position.set(player.position.x, player.position.y, player.position.z);

const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

function updatePlayer(deltaTime) {
    const prevPosition = camera.position.clone();

    // Forward/backward movement
    if (keys['ArrowUp']) {
        camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), player.speed * deltaTime);
    }
    if (keys['ArrowDown']) {
        camera.position.addScaledVector(camera.getWorldDirection(new THREE.Vector3()), -player.speed * deltaTime);
    }

    // Rotation
    if (keys['ArrowLeft']) {
        camera.rotation.y += player.turnSpeed;
    }
    if (keys['ArrowRight']) {
        camera.rotation.y -= player.turnSpeed;
    }

    // Shooting
    if (keys[' '] && canShoot) {
        shoot();
    }

    // Collision detection
    const playerCollider = new THREE.Box3().setFromCenterAndSize(camera.position, new THREE.Vector3(1, 1, 1));
    for (const collider of colliders) {
        if (playerCollider.intersectsBox(collider)) {
            camera.position.copy(prevPosition);
            break;
        }
    }

    player.position.copy(camera.position);

    // Win condition
    if (exitPosition && player.position.distanceTo(exitPosition) < TILE_SIZE / 2) {
        missionComplete();
    }
}

function createImpactEffect(position) {
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 });
    const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);

    for (let i = 0; i < 5; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * 2);
        particle.lifetime = 0.5; // seconds
        particles.push(particle);
        scene.add(particle);
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.addScaledVector(p.velocity, deltaTime);
        p.lifetime -= deltaTime;
        p.material.opacity = p.lifetime * 2; // Fade out

        if (p.lifetime <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }
}

// --- Particles ---
const particles = [];

// --- Projectiles ---
const projectiles = [];
let canShoot = true;
const SHOOT_COOLDOWN = 0.5; // seconds

function shoot() {
    if (player.ink > 0) {
        player.ink--;
        const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

        projectile.position.copy(camera.position);
        projectile.velocity = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(20);

        projectiles.push(projectile);
        scene.add(projectile);

        canShoot = false;
        setTimeout(() => (canShoot = true), SHOOT_COOLDOWN * 1000);
    }
}

function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.position.addScaledVector(p.velocity, deltaTime);

        // Collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (p.position.distanceTo(enemy.position) < 1) {
                scene.remove(p);
                projectiles.splice(i, 1);
                createImpactEffect(p.position);
                enemy.health--;
                enemy.speed = ENEMY_SPEED / 2; // Slow down
                setTimeout(() => (enemy.speed = ENEMY_SPEED), 2000);

                if (enemy.health <= 0) {
                    scene.remove(enemy);
                    enemies.splice(j, 1);
                    player.score += 10;
                }
                break; // Projectile can only hit one enemy
            }
        }

        // Remove projectiles that go too far
        if (p.position.distanceTo(player.position) > 100) {
            scene.remove(p);
            projectiles.splice(i, 1);
        }
    }
}


// --- Enemies ---
const enemies = [];
const ENEMY_SPEED = 2;
const CHASE_DISTANCE = 15;

function spawnEnemy(x, z) {
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red for fish/crabs
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(x, 0, z);
    enemy.health = 3;
    enemy.speed = ENEMY_SPEED;
    enemy.patrolTarget = new THREE.Vector3(x + Math.random() * 10 - 5, 0, z + Math.random() * 10 - 5);
    enemies.push(enemy);
    scene.add(enemy);
}

function updateEnemies(deltaTime) {
    enemies.forEach(enemy => {
        const distanceToPlayer = enemy.position.distanceTo(player.position);
        if (distanceToPlayer < 1 && !player.isInvincible) {
            player.health -= 10;
            player.isInvincible = true;
            setTimeout(() => { player.isInvincible = false; }, 1000); // 1 second of invincibility
            if (player.health <= 0) {
                gameOver();
            }
        }

        if (distanceToPlayer < CHASE_DISTANCE) {
            // Chase player
            const direction = player.position.clone().sub(enemy.position).normalize();
            enemy.position.addScaledVector(direction, enemy.speed * deltaTime);
        } else {
            // Patrol
            if (enemy.position.distanceTo(enemy.patrolTarget) < 1) {
                // Find a new valid patrol target
                let targetFound = false;
                while (!targetFound) {
                    const i = Math.floor(Math.random() * level.length);
                    const j = Math.floor(Math.random() * level[i].length);
                    if (level[i][j] === 0 || level[i][j] === 'E' || level[i][j] === 'P' || level[i][j] === 'X') {
                        enemy.patrolTarget.set((j - level[0].length / 2) * TILE_SIZE, 0, (i - level.length / 2) * TILE_SIZE);
                        targetFound = true;
                    }
                }
            }
            const direction = enemy.patrolTarget.clone().sub(enemy.position).normalize();
            enemy.position.addScaledVector(direction, enemy.speed * deltaTime * 0.5); // Slower patrol speed
        }
    });
}

function gameOver() {
    gameIsOver = true;
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div>Game Over</div>';
}

function missionComplete() {
    gameIsOver = true;
    overlay.style.display = 'flex';
    overlay.innerHTML = '<div>Mission Complete</div>';
}

// --- HUD ---
const healthEl = document.getElementById('health');
const inkEl = document.getElementById('ink');
const scoreEl = document.getElementById('score');

function updateHUD() {
    healthEl.innerText = player.health;
    inkEl.innerText = player.ink;
    scoreEl.innerText = player.score;
}

// --- Game Loop ---
const clock = new THREE.Clock();
let gameIsOver = false;
function animate() {
    if (gameIsOver) return;
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    updatePlayer(deltaTime);
    updateProjectiles(deltaTime);
    updateEnemies(deltaTime);
    updateParticles(deltaTime);
    updateHUD();

    // Apply camera sway just before rendering
    const time = Date.now() * 0.0005;
    camera.position.x += Math.sin(time) * 0.01;
    camera.position.y += Math.sin(time * 1.2) * 0.01;

    renderer.render(scene, camera);

    // Reset camera position after rendering to not affect next frame's physics
    camera.position.x -= Math.sin(time) * 0.01;
    camera.position.y -= Math.sin(time * 1.2) * 0.01;
}

// --- Initialization ---

const TILE_SIZE = 5;
const colliders = [];
let exitPosition;

function init() {
    // Scene background and fog
    scene.background = new THREE.Color(0x0a2342);
    scene.fog = new THREE.Fog(0x0a2342, 10, 100);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x00BFFF, 2); // soft blue light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Initial camera position
    camera.position.z = 5;

    // --- Maze ---
    const level = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 'X', 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 'P', 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 'E', 0, 0, 0, 0, 'E', 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    function buildMaze() {
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xff7f50 }); // Coral pink/orange
        const wallGeometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE);

        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                if (level[i][j] === 1) {
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set((j - level[0].length / 2) * TILE_SIZE, TILE_SIZE / 2, (i - level.length / 2) * TILE_SIZE);
                    scene.add(wall);
                    colliders.push(new THREE.Box3().setFromObject(wall));
                } else if (level[i][j] === 'P') {
                    player.position.set((j - level[0].length / 2) * TILE_SIZE, 0.5, (i - level.length / 2) * TILE_SIZE);
                    camera.position.copy(player.position);
                } else if (level[i][j] === 'E') {
                    spawnEnemy((j - level[0].length / 2) * TILE_SIZE, (i - level.length / 2) * TILE_SIZE);
                } else if (level[i][j] === 'X') {
                    exitPosition = new THREE.Vector3((j - level[0].length / 2) * TILE_SIZE, 0, (i - level.length / 2) * TILE_SIZE);
                    const exitGeometry = new THREE.BoxGeometry(TILE_SIZE, 1, TILE_SIZE);
                    const exitMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const exitMesh = new THREE.Mesh(exitGeometry, exitMaterial);
                    exitMesh.position.copy(exitPosition);
                    scene.add(exitMesh);
                }
            }
        }

        // Floor
        const floorGeometry = new THREE.PlaneGeometry(level[0].length * TILE_SIZE, level.length * TILE_SIZE);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xdeb887 }); // Sandy color
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -TILE_SIZE / 2;
        scene.add(floor);
    }
    buildMaze();

    // Start the game loop
    animate();

    // Ink regeneration
    setInterval(() => {
        if (player.ink < 10) {
            player.ink++;
        }
    }, 2000);
}

// --- Start the game ---
init();
