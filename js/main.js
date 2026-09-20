import * as THREE from 'three';
import { CONFIG } from './core/config.js';
import { createRenderer, resizeRenderer } from './core/renderer.js';
import { GameLoop } from './core/game.js';
import { PlayerController } from './controllers/playerController.js';
import { CameraController } from './controllers/cameraController.js';
import { PCController } from './controllers/pcController.js';
import { MobileController } from './controllers/mobileController.js';
import { FlashlightSystem } from './systems/flashlightSystem.js';
import { AudioSystem } from './systems/audioSystem.js';
import { DialogueSystem } from './systems/dialogueSystem.js';
import { InteractionSystem } from './systems/interactionSystem.js';
import { StorySystem } from './systems/storySystem.js';
import { buildHouseScene } from './scenes/houseScene.js';
import { hideTitle } from './scenes/titleScene.js';

const canvas = document.querySelector('#game-canvas');
const startButton = document.querySelector('#start-button');
const hud = document.querySelector('#hud');
const flashlightButton = document.querySelector('#flashlight-button');
const flashlightRange = document.querySelector('#flashlight-strength');
const flashlightValue = document.querySelector('#flashlight-value');
const statusMessage = document.querySelector('#status-message');

const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 80);
camera.position.set(0, CONFIG.player.eyeHeight, -4.1);

const player = new PlayerController(camera);
const cameraController = new CameraController(camera);
const audio = new AudioSystem();
const story = new StorySystem();
const dialogue = new DialogueSystem(player);
const interaction = new InteractionSystem(camera, scene);
const flashlight = new FlashlightSystem(camera, scene);

const interact = () => {
  if (dialogue.active) return dialogue.next();
  if (!interaction.interact()) showStatus('調べられるものはない。');
};

const pc = new PCController(canvas, player, cameraController, interact);
const mobile = new MobileController(player, cameraController, interact);

function showStatus(text, duration = 1300) {
  statusMessage.textContent = text;
  statusMessage.classList.add('show');
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => statusMessage.classList.remove('show'), duration);
}

flashlightRange.addEventListener('input', () => {
  const value = Number(flashlightRange.value);
  flashlightValue.textContent = String(value);
  flashlight.setStrength(value);
});

flashlightButton.addEventListener('click', () => {
  const enabled = flashlight.toggle();
  flashlightButton.textContent = `懐中電灯 ${enabled ? 'ON' : 'OFF'}`;
});

window.addEventListener('resize', () => resizeRenderer(renderer, camera));

await buildHouseScene(scene, dialogue, audio, story);

const loop = new GameLoop(
  dt => {
    if (!dialogue.active) {
      pc.update();
      if (matchMedia('(pointer: coarse)').matches) mobile.update();
    } else {
      player.setMove(0,0);
    }
    player.update(dt);
    flashlight.update();
    interaction.update();
  },
  () => renderer.render(scene, camera)
);

startButton.addEventListener('click', () => {
  hideTitle();
  hud.classList.remove('hidden');
  hud.setAttribute('aria-hidden', 'false');
  audio.playBGM('entrance');
  loop.start();
  story.setObjective('玄関から家の中を調べる');
  dialogue.show([
    { speaker: '直人', text: '……何年ぶりだ。', pitch: .9 },
    { speaker: '直人', text: '書類を取ったら、すぐ帰ろう。', pitch: .9 },
  ]);
});
