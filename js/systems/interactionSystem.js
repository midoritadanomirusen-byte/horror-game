import * as THREE from 'three';
import { CONFIG } from '../core/config.js';

export class InteractionSystem {
  constructor(camera, scene) {
    this.camera = camera;
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = CONFIG.interaction.distance;
    this.current = null;
    this.hint = document.querySelector('#interaction-hint');
  }

  update() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    this.current = null;
    for (const hit of hits) {
      let obj = hit.object;
      while (obj && !obj.userData?.interactable) obj = obj.parent;
      if (obj?.userData?.interactable) {
        this.current = obj;
        break;
      }
    }
    this.hint.textContent = this.current ? (this.current.userData.hint || '調べる') : '';
  }

  interact() {
    if (!this.current) return false;
    this.current.userData.onInteract?.(this.current);
    return true;
  }
}
