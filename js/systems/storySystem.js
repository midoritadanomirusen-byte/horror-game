export class StorySystem {
  constructor() {
    this.chapter = 'chapter_01_arrival';
    this.objectiveEl = document.querySelector('#objective-text');
  }
  setChapter(id) { this.chapter = id; }
  setObjective(text) { this.objectiveEl.textContent = text; }
}
