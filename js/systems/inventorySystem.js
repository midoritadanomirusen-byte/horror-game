export class InventorySystem {
  constructor() { this.items = new Set(); }
  add(id) { this.items.add(id); }
  has(id) { return this.items.has(id); }
  remove(id) { this.items.delete(id); }
  list() { return [...this.items]; }
}
