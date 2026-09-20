export class DialogueSystem {
  constructor(playerController) {
    this.playerController = playerController;
    this.box = document.querySelector('#dialogue-box');
    this.speakerEl = document.querySelector('#speaker-name');
    this.textEl = document.querySelector('#dialogue-text');
    this.nextButton = document.querySelector('#dialogue-next');
    this.queue = [];
    this.active = false;
    this.nextButton.addEventListener('click', () => this.next());
  }

  show(lines, { speak = true } = {}) {
    if (!Array.isArray(lines) || !lines.length) return;
    this.queue = lines.map(line => typeof line === 'string' ? { speaker: '', text: line } : line);
    this.active = true;
    this.playerController.enabled = false;
    this.box.classList.remove('hidden');
    this.renderCurrent(speak);
  }

  renderCurrent(speak = true) {
    const line = this.queue[0];
    if (!line) return this.close();
    this.speakerEl.textContent = line.speaker || '';
    this.textEl.textContent = line.text || '';
    if (speak && line.voice !== false) this.speak(line);
  }

  speak(line) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = 'ja-JP';
    utterance.rate = line.rate ?? 0.94;
    utterance.pitch = line.pitch ?? (line.speaker === '美緒' ? 1.35 : 0.95);
    utterance.volume = line.volume ?? 0.8;
    speechSynthesis.speak(utterance);
  }

  next() {
    if (!this.active) return;
    this.queue.shift();
    if (!this.queue.length) this.close();
    else this.renderCurrent(true);
  }

  close() {
    this.active = false;
    this.queue = [];
    this.box.classList.add('hidden');
    this.playerController.enabled = true;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}
