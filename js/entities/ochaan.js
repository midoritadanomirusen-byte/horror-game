export class OchaanEntity {
  constructor(object3D) {
    this.object3D = object3D;
    this.found = false;
  }
  markFound() { this.found = true; }
}
