import { CONFIG } from '../core/config.js';

export class MobileController {
  constructor(player, cameraController, onInteract) {
    this.player = player;
    this.cameraController = cameraController;
    this.onInteract = onInteract;
    this.joystickZone = document.querySelector('#joystick-zone');
    this.knob = document.querySelector('#joystick-knob');
    this.lookZone = document.querySelector('#look-zone');
    this.runButton = document.querySelector('#run-button');
    this.interactButton = document.querySelector('#interact-button');
    this.joyPointer = null;
    this.lookPointer = null;
    this.lookLast = null;
    this.move = {x:0,y:0};
    this.bind();
  }

  bind() {
    this.joystickZone.addEventListener('pointerdown', e => {
      this.joyPointer = e.pointerId;
      this.joystickZone.setPointerCapture?.(e.pointerId);
      this.updateJoystick(e);
    });
    this.joystickZone.addEventListener('pointermove', e => {
      if (e.pointerId === this.joyPointer) this.updateJoystick(e);
    });
    const endJoy = e => {
      if (e.pointerId !== this.joyPointer) return;
      this.joyPointer = null;
      this.move = {x:0,y:0};
      this.knob.style.transform = 'translate(0px, 0px)';
    };
    this.joystickZone.addEventListener('pointerup', endJoy);
    this.joystickZone.addEventListener('pointercancel', endJoy);

    this.lookZone.addEventListener('pointerdown', e => {
      this.lookPointer = e.pointerId;
      this.lookLast = {x:e.clientX, y:e.clientY};
      this.lookZone.setPointerCapture?.(e.pointerId);
    });
    this.lookZone.addEventListener('pointermove', e => {
      if (e.pointerId !== this.lookPointer || !this.lookLast) return;
      const dx = e.clientX - this.lookLast.x;
      const dy = e.clientY - this.lookLast.y;
      this.lookLast = {x:e.clientX, y:e.clientY};
      this.cameraController.rotate(dx, dy, CONFIG.player.touchSensitivity);
    });
    const endLook = e => {
      if (e.pointerId === this.lookPointer) {
        this.lookPointer = null;
        this.lookLast = null;
      }
    };
    this.lookZone.addEventListener('pointerup', endLook);
    this.lookZone.addEventListener('pointercancel', endLook);

    this.runButton.addEventListener('pointerdown', () => this.player.setRunning(true));
    this.runButton.addEventListener('pointerup', () => this.player.setRunning(false));
    this.runButton.addEventListener('pointercancel', () => this.player.setRunning(false));
    this.interactButton.addEventListener('click', () => this.onInteract?.());
  }

  updateJoystick(e) {
    const rect = this.joystickZone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = 46;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.move.x = dx / max;
    this.move.y = -dy / max;
  }

  update() {
    this.player.setMove(this.move.x, this.move.y);
  }
}
