export class ChaseSystem {
  constructor(audioSystem) {
    this.audio = audioSystem;
    this.active = false;
  }
  start() {
    if (this.active) return;
    this.active = true;
    this.audio.playBGM('chase');
  }
  stop() {
    if (!this.active) return;
    this.active = false;
    this.audio.playBGM('exploration');
  }
  update() {}
}
