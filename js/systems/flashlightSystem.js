import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export class FlashlightSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.enabled = true;
    this.strength = CONFIG.flashlight.defaultStrength;

    this.light = new THREE.SpotLight(0xf1f0df, 1, CONFIG.flashlight.distance, CONFIG.flashlight.angle, CONFIG.flashlight.penumbra, 1.35);
    this.light.castShadow = true;
    this.light.shadow.mapSize.set(1024, 1024);
    this.target = new THREE.Object3D();
    scene.add(this.light, this.target);
    this.updateIntensity();
  }

  setStrength(value) {
    this.strength = Math.max(0, Math.min(100, Number(value) || 0));
    this.updateIntensity();
  }

  toggle() {
    this.enabled = !this.enabled;
    this.updateIntensity();
    return this.enabled;
  }

  updateIntensity() {
    this.light.intensity = this.enabled ? (this.strength / 100) * CONFIG.flashlight.maxIntensity : 0;
  }

  update() {
    this.light.position.copy(this.camera.position);
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.target.position.copy(this.camera.position).add(direction.multiplyScalar(2));
    this.light.target = this.target;
  }
}
