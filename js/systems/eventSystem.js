export class EventSystem {
  constructor() { this.flags = new Set(); }
  set(flag) { this.flags.add(flag); }
  has(flag) { return this.flags.has(flag); }
  clear(flag) { this.flags.delete(flag); }
}
