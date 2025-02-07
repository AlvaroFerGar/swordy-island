import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import Box from "./box.js";
import Pirate from "./pirate.js";

///Scene
const scene = new THREE.Scene();

///Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-10, 50, 0);
camera.lookAt(0, 0, 0); // Look at center

//Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcional: mejora la calidad de las sombras
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
// To limit controls
//controls.minDistance = 0;
//controls.maxDistance = 500;
//controls.minPolarAngle = 0; // radians


//controls.maxPolarAngle = Math.PI/4; // radians

///Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 20;
light.position.z = camera.position.z-10;
light.castShadow = true;
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.15));


///Pirate
const pirate = new Pirate({
  width: 1,
  block_height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0,
  },
});
pirate.castShadow = true;
scene.add(pirate);
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
      pirate.velocity.y = 0.08;
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



///Ground

const loader = new SVGLoader();
loader.load('assets/swordyisland.svg', function (data) {
  // Extract the paths from the SVG data
  const paths = data.paths;
  
  // Find the first path and extract points (assuming it's a polygon)
  const points = paths[0].toShapes()[0].getPoints();  // Convert path to shapes and get the points
  const scale_x=-1/2
  const offset_x=0
  const scale_y=1/2
  const offset_y=0
  const ground_points = points.map(p => [p.x*scale_x+offset_x, p.y*scale_y+offset_y]);

  // Now create the shape from the extracted points
  const shape = new THREE.Shape();
  ground_points.forEach((p, i) => {
    if (i === 0) shape.moveTo(p[0], p[1]);
    else shape.lineTo(p[0], p[1]);
  });
  shape.lineTo(ground_points[0][0], ground_points[0][1]); // Close the shape

  const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshStandardMaterial({ color: 0x185452 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -2;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  scene.add(mesh);
});






//Ocean code
const createOcean = () => {

  const size = 500; // Tamaño del océano (ancho y largo)
  const subdivisions = 250; // Número de subdivisiones de la geometría (afecta la resolución de las olas)
  const color = 0x0388fc; // Color del océano
  const oceanHeight = -2; // Posición en el eje Y donde se coloca el océano
  const waveHeight = 1.5; // Altura máxima de las olas
  const phaseRange = Math.PI/2; // Rango de variación de la fase inicial de cada ola
  
  // Creamos un plano con el tamaño y subdivisiones especificadas
  const geometry = new THREE.PlaneGeometry(size, size, subdivisions, subdivisions);
  geometry.rotateX(-Math.PI * 0.5);
  
  // Creamos el material con el color especificado
  const material = new THREE.MeshStandardMaterial({ color });

  // Creamos la malla combinando la geometría y el material
  const ocean = new THREE.Mesh(geometry, material);

  // Posicionamos el océano en la altura indicada
  ocean.position.y = oceanHeight;
  
  // Array para almacenar datos de los vértices, permitiendo que se muevan como olas
  const vertData = [];

  // Recorremos cada vértice de la geometría para asignarle propiedades dinámicas
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const tempVector = new THREE.Vector3();
    
    // Extraemos la posición del vértice en la geometría
    tempVector.fromBufferAttribute(geometry.attributes.position, i);
    
    // Guardamos datos para animar este vértice
    vertData.push({
      initH: tempVector.y, // Altura inicial del vértice
      amplitude: THREE.MathUtils.randFloatSpread(waveHeight), // Altura máxima de la ola en este punto
      phase: THREE.MathUtils.randFloat(0, phaseRange) // Fase inicial aleatoria para variar el movimiento
    });
  }

  // Función de actualización que se ejecuta en cada fotograma para animar el océano
  ocean.update = () => {

    const waveSpeed = 2; // Velocidad a la que se mueven las olas

    const time = clock.getElapsedTime() * waveSpeed; // Se multiplica por waveSpeed para ajustar la velocidad
    // Recorremos cada vértice y ajustamos su altura con una función seno
    vertData.forEach((vd, idx) => {
      const y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
      geometry.attributes.position.setY(idx, y);
    });

    // Marcamos la posición de los vértices como actualizada para que se reflejen los cambios
    geometry.attributes.position.needsUpdate = true;

    // Recalculamos las normales de la geometría para mejorar la iluminación del océano
    geometry.computeVertexNormals();
  };

  return ocean; // Devolvemos el objeto "ocean" para que pueda agregarse a la escena
};

let clock = new THREE.Clock();
const ocean = createOcean();
ocean.receiveShadow = true;
scene.add(ocean);


//Ray Casting
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

  //console.log(`Clicked at: x=${intersection.x}, y=${intersection.y}, z=${intersection.z}`);
  console.log(`[${intersection.x}, ${intersection.z}],`);


  //Added clicked position to pirate
  pirate.hasPositionGoal=true;
  pirate.xGoal=intersection.x;
  pirate.zGoal=intersection.z;

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





let frames = 0;
function animate() {
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // movement code
  pirate.velocity.x = 0;
  pirate.velocity.z = 0;
  if (keys.a.pressed) pirate.velocity.x = -0.05;
  else if (keys.d.pressed) pirate.velocity.x = 0.05;

  if (keys.s.pressed) pirate.velocity.z = 0.05;
  else if (keys.w.pressed) pirate.velocity.z = -0.05;
  pirate.update();


  ocean.update();


  frames++;
}
animate();
