export class SaveSystem {
  // Prototype: セーブ仕様だけ先に分離。GitHub Pages版では後でlocalStorage対応を追加する。
  exportState(state) { return JSON.stringify(state, null, 2); }
}
