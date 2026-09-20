import { CONFIG } from '../core/config.js';

export const BGM_FILES = {
  title: 'bgm_01_title.mp3',
  entrance: 'bgm_02_entrance.mp3',
  exploration: 'bgm_03_exploration.mp3',
  emptyRoom: 'bgm_04_empty_room.mp3',
  uneasy: 'bgm_05_uneasy.mp3',
  mioPresence: 'bgm_06_mio_presence.mp3',
  ghostNear: 'bgm_07_ghost_near.mp3',
  chase: 'bgm_08_chase.mp3',
  hide: 'bgm_09_hide.mp3',
  safeRoom: 'bgm_10_safe_room.mp3',
  memory: 'bgm_11_memory.mp3',
  fireMemory: 'bgm_12_fire_memory.mp3',
  truth: 'bgm_13_truth.mp3',
  finalRoom: 'bgm_14_final_room.mp3',
  climax: 'bgm_15_climax.mp3',
  badEnd: 'bgm_16_bad_end.mp3',
  normalEnd: 'bgm_17_normal_end.mp3',
  trueEnd: 'bgm_18_true_end.mp3',
  credits: 'bgm_19_credits.mp3',
  ochaan: 'bgm_20_ochaan.mp3',
};

export class AudioSystem {
  constructor() {
    this.current = null;
    this.currentKey = null;
    this.basePath = './assets/audio/bgm/';
  }

  playBGM(key, { loop = true, restart = false } = {}) {
    const filename = BGM_FILES[key];
    if (!filename) return;
    if (this.currentKey === key && this.current && !restart) return;
    this.stopBGM();
    const audio = new Audio(this.basePath + filename);
    audio.loop = loop;
    audio.volume = CONFIG.audio.bgmVolume;
    audio.preload = 'auto';
    audio.play().catch(() => {});
    this.current = audio;
    this.currentKey = key;
  }

  stopBGM() {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
    }
    this.current = null;
    this.currentKey = null;
  }
}
