import * as THREE from 'three';
import { loadGLB } from '../core/loader.js';

function applyShadow(root) {
  root.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

// v3の家は最初からThree.jsと同じY-upで作り直してある。
// ここでは90度回転を一切しない。
export const HOUSE_COLLIDERS = [
  // 外周
  { minX: -7.06, maxX: -0.68, minZ: 4.94, maxZ: 5.06 },
  { minX:  0.68, maxX:  7.06, minZ: 4.94, maxZ: 5.06 },
  { minX: -7.06, maxX:  7.06, minZ: -5.06, maxZ: -4.94 },
  { minX: -7.06, maxX: -6.94, minZ: -5.06, maxZ: 5.06 },
  { minX:  6.94, maxX:  7.06, minZ: -5.06, maxZ: 5.06 },

  // 廊下・西側
  { minX: -1.26, maxX: -1.14, minZ:  3.15, maxZ: 4.80 },
  { minX: -1.26, maxX: -1.14, minZ: -1.10, maxZ: 1.85 },
  { minX: -1.26, maxX: -1.14, minZ: -4.80, maxZ: -2.35 },
  { minX: -7.00, maxX: -3.90, minZ:  0.09, maxZ: 0.21 },
  { minX: -2.55, maxX: -1.20, minZ:  0.09, maxZ: 0.21 },

  // 廊下・東側
  { minX: 1.14, maxX: 1.26, minZ: -4.80, maxZ: -4.10 },
  { minX: 1.14, maxX: 1.26, minZ: -3.00, maxZ: -1.30 },
  { minX: 1.14, maxX: 1.26, minZ: -0.20, maxZ:  0.90 },
  { minX: 1.14, maxX: 1.26, minZ:  2.00, maxZ:  3.10 },
  { minX: 1.14, maxX: 1.26, minZ:  4.15, maxZ:  4.80 },

  // 東側の部屋同士
  { minX: 1.20, maxX: 3.25, minZ:  2.49, maxZ: 2.61 },
  { minX: 4.35, maxX: 7.00, minZ:  2.49, maxZ: 2.61 },
  { minX: 1.20, maxX: 3.25, minZ:  0.29, maxZ: 0.41 },
  { minX: 4.35, maxX: 7.00, minZ:  0.29, maxZ: 0.41 },
  { minX: 1.20, maxX: 3.25, minZ: -1.91, maxZ:-1.79 },
  { minX: 4.35, maxX: 7.00, minZ: -1.91, maxZ:-1.79 },

  // 家具：主要なものだけ当たり判定
  { minX: -4.68, maxX: -3.32, minZ: 1.82, maxZ: 2.68 },
  { minX: -6.42, maxX: -4.08, minZ:-4.14, maxZ:-3.36 },
  { minX:  4.48, maxX:  6.12, minZ: 1.08, maxZ: 2.02 },
  { minX:  4.95, maxX:  6.35, minZ:-1.02, maxZ:-0.48 },
];

export const HOUSE_SPAWN = {
  x: 0,
  z: 4.18,
  yaw: 0,
};

function addFallbackHouse(scene) {
  const group = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x8e887c, roughness: .95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x5b4637, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(14, .08, 10), floorMat);
  floor.position.y = -.04;
  group.add(floor);
  const w = (sx, sz, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sx, 2.5, sz), wallMat);
    m.position.set(x, 1.25, z); group.add(m);
  };
  w(14,.12,0,-5); w(6.3,.12,-3.85,5); w(6.3,.12,3.85,5);
  w(.12,10,-7,0); w(.12,10,7,0);
  scene.add(group); return group;
}

function addPedestal(scene, x, z, width=.62, depth=.28, height=.72) {
  const mat = new THREE.MeshStandardMaterial({ color: 0x493326, roughness: .9 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(width,.06,depth),mat);
  top.position.set(x,height,z); top.castShadow=true; top.receiveShadow=true; scene.add(top);
  for (const dx of [-width*.38,width*.38]) for (const dz of [-depth*.32,depth*.32]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(.045,height,.045),mat);
    leg.position.set(x+dx,height/2,z+dz); leg.castShadow=true; scene.add(leg);
  }
  return height + .03;
}

async function addEntryPhoto(scene, dialogue, audio, story) {
  const topY = addPedestal(scene, -0.86, 3.55, .55, .24, .78);
  let photo;
  try {
    photo = await loadGLB('./assets/models/props/picture_frame.glb');
    photo.scale.setScalar(1.15);
    photo.position.set(-0.86, topY, 3.55);
    photo.rotation.y = Math.PI;
    applyShadow(photo);
  } catch (error) {
    console.warn('picture_frame.glb load failed', error);
    photo = new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.035),new THREE.MeshStandardMaterial({color:0x5d4434}));
    photo.position.set(-.86,topY+.14,3.55);
  }
  photo.name='OldPhoto';
  photo.userData.interactable=true;
  photo.userData.hint='E / 調べる：古い写真';
  photo.userData.onInteract=()=>{
    dialogue.show([
      {speaker:'直人',text:'……こんな写真、まだ残ってたのか。',pitch:.9},
      {speaker:'直人',text:'顔が一人だけ、妙に擦れて見えない。',pitch:.9},
      {speaker:'直人',text:'……誰だったっけ。',pitch:.9},
    ]);
    story.setObjective('廊下の先と部屋を調べる');
    audio.playBGM('exploration');
  };
  scene.add(photo);
}

async function addOchaan(scene, dialogue, audio) {
  // リビングの低い机の上。外には置かない。
  try {
    const ochaan=await loadGLB('./assets/models/ochaan/ochaan.glb');
    ochaan.name='Ochaan';
    ochaan.scale.setScalar(1.05);
    ochaan.position.set(-4.0,.54,2.25);
    ochaan.rotation.y = Math.PI * .15;
    applyShadow(ochaan);
    ochaan.userData.interactable=true;
    ochaan.userData.hint='E / 調べる：妙な緑色の置物';
    ochaan.userData.onInteract=()=>{
      audio.playBGM('ochaan',{restart:true});
      dialogue.show([
        {speaker:'直人',text:'……なんだ、これ。',pitch:.9},
        {speaker:'直人',text:'緑色で……湯呑から出てる？',pitch:.9},
        {speaker:'直人',text:'こんなの、昔ここにあったか……？',pitch:.9},
      ]);
    };
    scene.add(ochaan);
  } catch(error){ console.warn('ochaan.glb load failed',error); }
}

export async function buildHouseScene(scene, dialogue, audio, story) {
  scene.background = new THREE.Color(0x030404);
  scene.fog = new THREE.FogExp2(0x050606,.027);

  scene.add(new THREE.HemisphereLight(0x555b57,0x171311,.28));
  const entry = new THREE.PointLight(0xffd7a5,.55,6.5,2);
  entry.position.set(0,2.05,3.65); scene.add(entry);
  const living = new THREE.PointLight(0xb5bcae,.18,6,2);
  living.position.set(-4,1.7,2.2); scene.add(living);

  let house;
  try {
    house=await loadGLB('./assets/models/house/house_shell_one_story.glb');
    house.name='HouseShell';
    // v3: ここで回転させない。モデル自体がY-up。
    house.position.set(0,0,0);
    house.rotation.set(0,0,0);
    house.scale.set(1,1,1);
    applyShadow(house);
    scene.add(house);
    const b=new THREE.Box3().setFromObject(house);
    console.info('House v3 bounds',b.min,b.max);
  } catch(error){
    console.warn('house_shell_one_story.glb load failed; fallback used',error);
    house=addFallbackHouse(scene);
  }

  await addEntryPhoto(scene,dialogue,audio,story);
  await addOchaan(scene,dialogue,audio);
  return { house, colliders: HOUSE_COLLIDERS, spawn: HOUSE_SPAWN };
}
