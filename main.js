import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Box from "./box.js";
import Pirate from "./pirate.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-10, 50, 0);
camera.lookAt(0, 0, 0); // Look at center


const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// To limit controls
//controls.minDistance = 0;
//controls.maxDistance = 500;
//controls.minPolarAngle = 0; // radians
controls.maxPolarAngle = Math.PI/4; // radians


const cube = new Pirate({
  width: 1,
  block_height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0,
  },
});
cube.castShadow = true;
scene.add(cube);



const points = [
  [22.1868694,17.916717],
  [13.5729015,22.670968],
  [9.9895817,4.78648162],
  [-6.9166367,7.8257470],
  [-2.4902291,21.764490],
  [-9.6826913,22.911038],
  [-23.016948,10.552176],
  [-17.1537282,-4.50551],
  [-19.4212187,-20.7302],
  [18.7523653,-23.33004],
  [23.220816,-7.8234966],
  [19.1298436,4.1429501]
];

const shape = new THREE.Shape();
shape.moveTo(0,0);

for(let i = 0; i < points.length; i++) {
  shape.lineTo(points[i][0], points[i][1]);
}
shape.lineTo(points[0][0], points[0][1]); 

const extrudeSettings = {
  depth: 2,
  bevelEnabled: false
};

const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
const material = new THREE.MeshBasicMaterial({ color: 0x185452 });
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI/2; // Rotate to lay flat on XZ plane
mesh.position.y=-2
scene.add(mesh);





const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 3;
light.position.z = 1;
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));

//camera.position.z = 5;
//console.log(ground.top);
//console.log(cube.bottom);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plane at z = 0

window.addEventListener("click", (event) => {
  // Convert mouse position to NDC (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set raycaster from camera through the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Get intersection with the z=0 plane
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  console.log(`Clicked at: x=${intersection.x}, y=${intersection.y}, z=${intersection.z}`);

  //Debug tool to have feedback of clicks
  //scene.add(new Box({
  //  width: 0.5,
  //  height: 0.5,
  //  depth: 0.5,
  //  color: "#ff0000",
  //  position: {
  //    x: intersection.x,
  //    y: 1,
  //    z: intersection.z,
  //  },
  //}));

});


const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
};

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "KeyS":
      keys.s.pressed = true;
      break;
    case "KeyW":
      keys.w.pressed = true;
      break;
    case "Space":
      cube.velocity.y = 0.08;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
    case "KeyS":
      keys.s.pressed = false;
      break;
    case "KeyW":
      keys.w.pressed = false;
      break;
  }
});

const enemies = [];

let frames = 0;
let spawnRate = 200;
function animate() {
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // movement code
  cube.velocity.x = 0;
  cube.velocity.z = 0;
  if (keys.a.pressed) cube.velocity.x = -0.05;
  else if (keys.d.pressed) cube.velocity.x = 0.05;

  if (keys.s.pressed) cube.velocity.z = 0.05;
  else if (keys.w.pressed) cube.velocity.z = -0.05;
  cube.update();

  frames++;
  // cube.position.y += -0.01
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
}
animate();
