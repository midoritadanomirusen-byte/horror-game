import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export class PlayerController {
  constructor(camera) {
    this.camera = camera;
    this.velocity = new THREE.Vector3();
    this.move = { x: 0, y: 0 };
    this.running = false;
    this.enabled = true;
    this.colliders = [];
    this.bounds = { minX: -6.65, maxX: 6.65, minZ: -4.65, maxZ: 4.65 };
  }

  setMove(x, y) {
    this.move.x = Math.max(-1, Math.min(1, x));
    this.move.y = Math.max(-1, Math.min(1, y));
  }

  setRunning(value) { this.running = !!value; }

  update(dt) {
    if (!this.enabled) return;
    const speed = this.running ? CONFIG.player.runSpeed : CONFIG.player.walkSpeed;
    const input = new THREE.Vector2(this.move.x, this.move.y);
    if (input.lengthSq() > 1) input.normalize();

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();

    const delta = new THREE.Vector3();
    delta.addScaledVector(forward, input.y * speed * dt);
    delta.addScaledVector(right, input.x * speed * dt);

    const next = this.camera.position.clone().add(delta);
    next.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, next.x));
    next.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, next.z));
    next.y = CONFIG.player.eyeHeight;
    this.camera.position.copy(next);
  }
}
