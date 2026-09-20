export class PCController {
  constructor(canvas, player, cameraController, onInteract) {
    this.canvas = canvas;
    this.player = player;
    this.cameraController = cameraController;
    this.onInteract = onInteract;
    this.keys = new Set();

    window.addEventListener('keydown', e => {
      if (['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight'].includes(e.code)) e.preventDefault();
      this.keys.add(e.code);
      if (e.code === 'KeyE') this.onInteract?.();
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));

    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas && matchMedia('(pointer: fine)').matches) canvas.requestPointerLock?.();
    });

    document.addEventListener('mousemove', e => {
      if (document.pointerLockElement === canvas) this.cameraController.rotate(e.movementX, e.movementY);
    });
  }

  update() {
    const x = (this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0);
    const y = (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0);
    this.player.setMove(x, y);
    this.player.setRunning(this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'));
  }
}
