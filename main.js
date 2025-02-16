import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.137/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.137/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.16/dist/lil-gui.esm.min.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.137/examples/jsm/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create Axes Helper
const axesHelper = new THREE.AxesHelper(1.5);
scene.add(axesHelper);

// Scene lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Create Gimbal System
const createGimbal = (size, color) => {
  const group = new THREE.Group();

  const geometry = new THREE.TorusGeometry(size, 0.05, 16, 100);
  const material = new THREE.MeshLambertMaterial({ color });
  const torus = new THREE.Mesh(geometry, material);
  group.add(torus);

  const pivot1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    material
  );
  pivot1.position.x = size+0.05;
  group.add(pivot1);

  const pivot2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    material
  );
  pivot2.position.x = -size - 0.05;
  group.add(pivot2);

  return group;
};

const gimbalX = createGimbal(1, 0xff0000);
gimbalX.rotation.x = 0;
scene.add(gimbalX);

const gimbalY = createGimbal(0.85, 0x00ff00);
const relX = new THREE.Object3D()
relX.rotation.z = Math.PI / 2;
relX.rotation.y = Math.PI / 2;
gimbalX.add(relX);
relX.add(gimbalY);


const gimbalZ = createGimbal(0.7, 0x0000ff);
const relY = new THREE.Object3D()
relY.rotation.z = Math.PI / 2;
relY.rotation.y = Math.PI / 2;
gimbalY.add(relY);
relY.add(gimbalZ);


const plane = await new GLTFLoader().loadAsync('plane.glb');
plane.scene.rotation.x = Math.PI / 2;
plane.scene.scale.set(0.08, 0.08, -0.08);
plane.scene.position.z = -.1;
plane.scene.position.y = +.1;
gimbalZ.add(plane.scene)

// Just a box...
// const cube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshNormalMaterial());
// gimbalZ.add(cube);


// GUI Controls
const gui = new GUI();
const rotationControls = {Rx: 0, Ry: 0, Rz: 0};
gui.add(rotationControls, 'Rx', -Math.PI/2, Math.PI/2, 0.01).onChange(value => gimbalX.rotation.x = value);
gui.add(rotationControls, 'Ry', -Math.PI/2, Math.PI/2, 0.01).onChange(value => gimbalY.rotation.x = value);
gui.add(rotationControls, 'Rz', -Math.PI/2, Math.PI/2, 0.01).onChange(value => gimbalZ.rotation.x = value);

// // Reset button
// gui.add({
//   reset: () => {
//     gimbalX.rotation.x = 0;
//     gimbalY.rotation.x = 0;
//     gimbalZ.rotation.x = 0;
//   }
// }, 'reset').name('Reset Rotations');

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};
animate();

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});