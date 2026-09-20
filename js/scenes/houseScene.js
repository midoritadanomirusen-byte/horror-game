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

function createFallbackHouse(scene) {
  const group = new THREE.Group();
  group.name = 'FallbackHouse';
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x8e8a7c, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x4f3c2f, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 10), floorMat);
  floor.position.y = 0;
  floor.receiveShadow = true;
  group.add(floor);
  const makeWall = (w,d,x,z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 2.5, d), wallMat);
    m.position.set(x,1.25,z); m.receiveShadow = true; group.add(m);
  };
  makeWall(14,.12,0,-5); makeWall(14,.12,0,5); makeWall(.12,10,-7,0); makeWall(.12,10,7,0);
  makeWall(.12,7,-1,1.5); makeWall(.12,7,1,1.5);
  makeWall(6,.12,-4,1); makeWall(6,.12,4,1);
  scene.add(group);
  return group;
}

export async function buildHouseScene(scene, dialogue, audio, story) {
  scene.background = new THREE.Color(0x040505);
  scene.fog = new THREE.FogExp2(0x060707, 0.035);

  const hemi = new THREE.HemisphereLight(0x626967, 0x1b1714, 0.23);
  scene.add(hemi);

  const dim = new THREE.PointLight(0xffdfb2, 0.6, 7, 2);
  dim.position.set(-3, 2.05, -0.5);
  scene.add(dim);

  let house;
  try {
    house = await loadGLB('./assets/models/house/house_shell_one_story.glb');
    house.name = 'HouseShell';
    applyShadow(house);
    scene.add(house);
  } catch (error) {
    console.warn('house_shell_one_story.glb が見つからないため仮マップを生成します。', error);
    house = createFallbackHouse(scene);
  }

  // 玄関の「古い写真」仮オブジェクト。後で picture_frame.glb に差し替え可。
  const photo = new THREE.Mesh(
    new THREE.BoxGeometry(.25,.035,.34),
    new THREE.MeshStandardMaterial({ color: 0x5d4434, roughness: .9 })
  );
  photo.position.set(-.45, 1.0, -3.85);
  photo.rotation.x = Math.PI / 2;
  photo.userData.interactable = true;
  photo.userData.hint = 'E / 調べる：古い写真';
  photo.userData.onInteract = () => {
    dialogue.show([
      { speaker: '直人', text: '……こんな写真、まだ残ってたのか。', pitch: .9 },
      { speaker: '直人', text: '顔が一人だけ、妙に擦れて見えない。', pitch: .9 },
    ]);
    story.setObjective('家の奥を調べる');
    audio.playBGM('exploration');
  };
  scene.add(photo);

  // おちゃーん
  try {
    const ochaan = await loadGLB('./assets/models/ochaan/ochaan.glb');
    ochaan.position.set(-4.4, .72, -1.1);
    ochaan.scale.setScalar(1.2);
    applyShadow(ochaan);
    ochaan.userData.interactable = true;
    ochaan.userData.hint = 'E / 調べる：妙な置物';
    ochaan.userData.onInteract = () => {
      audio.playBGM('ochaan', { restart: true });
      dialogue.show([
        { speaker: '直人', text: '……なんだこれ。', pitch: .9 },
        { speaker: '直人', text: '昔から、こんなの家にあったか……？', pitch: .9 },
      ], { speak: true });
    };
    scene.add(ochaan);
  } catch (error) {
    console.warn('ochaan.glb が見つからないため緑色の仮オブジェクトを置きます。', error);
    const placeholder = new THREE.Mesh(
      new THREE.SphereGeometry(.22, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x6c8c58, roughness: .75 })
    );
    placeholder.scale.set(1.4,.65,1.0);
    placeholder.position.set(-4.4,.25,-1.1);
    placeholder.userData.interactable = true;
    placeholder.userData.hint = 'E / 調べる：妙な緑色の置物';
    placeholder.userData.onInteract = () => dialogue.show([{ speaker: '直人', text: '……なんだこれ。' }]);
    scene.add(placeholder);
  }

  return house;
}
