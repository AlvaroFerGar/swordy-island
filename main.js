import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {Pirate, createRandomNPC} from "./characters/pirate.js";
import { isPointInPolygon, createGrid } from "./utils/polyutils.js"
import { createOcean } from "./world/ocean.js";
import { loadSVG, createVisualOrigin } from "./world/land.js";
import  aStar  from "./utils/astarisborn.js"
import * as cities from "./world/buildings.js";
import { createGuyblockText } from "./text/text.js"
import { sigmoid } from "./utils/misc.js";

// Get the loading screen element
const loadingScreen = document.getElementById('loading-screen');

async function main()
{

const helpers_shown=false;

///Scene
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
const geometry = new THREE.SphereGeometry(500, 60, 40);
// Flip the geometry inside out
geometry.scale(-1, 1, 1);

const material = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('assets/background.png')
});

const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);


///Camera
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  powerPreference: "high-performance", // Prioritize performance
});

//const gl = renderer.getContext();
//console.log('Supported WebGL Extensions:', gl.getSupportedExtensions())

  renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcional: mejora la calidad de las sombras
renderer.autoClear = true;
renderer.sortObjects = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
// To limit controls
controls.minDistance = 80;
controls.maxDistance = 200;
controls.maxPolarAngle = Math.PI/4; // radians
controls.enableDamping=true;
controls.enablePan=false;

const loadControlsFromFile = (controls, filePath) => {
  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error("Error al cargar el archivo");
      }
      return response.text();
    })
    .then(stateJSON => {
      const { target0, position0, zoom0 } = JSON.parse(stateJSON);
      controls.target0.copy(target0);
      controls.position0.copy(position0);
      controls.zoom0 = zoom0;
      controls.reset();
    })
    .catch(error => {
      console.error("Error:", error);
    });
};
loadControlsFromFile(controls, "./assets/orbitControls.json");


//Music
async function loadBackgroundMusic() {
  return new Promise((resolve, reject) => {
      const listener = new THREE.AudioListener();
      camera.add(listener);

      const backgroundSound = new THREE.Audio(listener);
      const audioLoader = new THREE.AudioLoader();

      audioLoader.load(
          './assets/Monplaisir - Soundtrack.mp3',
          function(buffer) {
              console.log("Music loaded successfully!");
              backgroundSound.setBuffer(buffer);
              backgroundSound.setLoop(true);
              backgroundSound.setVolume(0.5);
              resolve(backgroundSound); // Resolvemos la promesa con el audio cargado
          },
          undefined, // Progreso (opcional)
          function(error) {
              console.error("Error loading music:", error);
              reject(error); // Rechazamos la promesa si hay un error
          }
      );
  });
}

const backgroundSound = await loadBackgroundMusic(); // Espera a que la música se cargue
///Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.y = 4;
light.position.x = camera.position.x-200;
light.position.z = camera.position.z-200;
light.castShadow = true;
//light.shadow.mapSize.width = 256;  // Reduced from default 512x512
//light.shadow.mapSize.height = 256;
//light.shadow.camera.left = -30;
//light.shadow.camera.right = 30;
//light.shadow.camera.top = 30;
//light.shadow.camera.bottom = -30;
//light.shadow.camera.near = 0.5;
//light.shadow.camera.far = 50;
//light.shadow.camera.updateProjectionMatrix();
light.shadow.bias = -0.005;  // Adjust as needed
scene.add(light);
let helper = new THREE.DirectionalLightHelper(light, 5);
if(helpers_shown)
  light.add(helper)
scene.add(new THREE.AmbientLight(0xffffff, 0.3));


//Cities
const cities_points=[];

//Town
const x_town=-19
const z_town=-18
cities_points.push({x:x_town,z:z_town})
let firecamplight=cities.createTown(scene, x_town, z_town, helpers_shown);

//MeatHook
const x_mh=39
const z_mh=63
cities_points.push({x:x_mh,z:z_mh})
cities.createMeathook(scene, x_mh, z_mh, helpers_shown);

//Smirk
const x_cs=-28
const z_cs=78
cities_points.push({x:x_cs,z:z_cs})
cities.createCptSmirk(scene, x_cs, z_cs, helpers_shown);

//Circus
const x_cir=3
const z_cir=20
cities_points.push({x:x_cir,z:z_cir})
cities.createCircus(scene, x_cir, z_cir, helpers_shown);

//Shipyard
const x_stan=-29
const z_stan=38
cities_points.push({x:x_stan,z:z_stan})
let spotlights=cities.createStanShipyard(scene, x_stan, z_stan, helpers_shown);

//LightHouse
const x_lh=22
const z_lh=-42
cities_points.push({x:x_lh,z:z_lh})
const { light_lh, helper_lh } = cities.createLightHouse(scene, x_lh, z_lh, helpers_shown);



//Ocean
const {ocean, staticOcean} = createOcean();
scene.add(staticOcean)
scene.add(ocean);


///Pirate
const guyblock = new Pirate({
  id:0,
  width: 1,
  block_height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0,
  },
});
scene.add(guyblock);
const guyblocklight_intensity=5;
const guyblocklight = new THREE.PointLight("#ffffff", guyblocklight_intensity, 5);
guyblocklight.position.set(guyblock.position.x, 3, guyblock.position.z);
guyblock.add(guyblocklight)//Light to make clear is the main character

//Added sprite
createGuyblockText(guyblock);




///Ground
console.log("Cargando SVG...");
const ground_polygon_vertices = await loadSVG('assets/swordyisland.svg',scene);
console.log("Carga completada");
//console.log(ground_polygon_vertices)
let grid = createGrid(ground_polygon_vertices, 1, scene); // Create grid with spacing of 1
//grid.forEach(point => {
//  scene.add(new Box({
//    width: 0.3,
//    height: 0.3,
//    depth: 0.3,
//    color: "#ffffff",
//    position: {
//      x: point.x,
//      y: 10,
//      z: point.y,
//    },
//   }));
//});



//Clock
let clock = new THREE.Clock();




//Eje de coordenadas
//createVisualOrigin(scene);

guyblock.position.set(firecamplight.position.x,0,firecamplight.position.z)

//Ray Casting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Plane at z = 0

window.addEventListener("click", (event) => {

  if (!backgroundSound.isPlaying) {
    backgroundSound.play();
    console.log("Background music started!");
}

  // Convert mouse position to NDC (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set raycaster from camera through the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Get intersection with the z=0 plane
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  console.log(`Clicked at: x=${intersection.x}, y=${intersection.y}, z=${intersection.z}`);
  //console.log(`[${intersection.x}, ${intersection.z}],`);

  //console.log(ground_polygon_vertices)
  if(isPointInPolygon(intersection,ground_polygon_vertices))
  {
    //Added clicked position to pirate
    //pirate.hasPositionGoal=true;
    //pirate.xGoal=intersection.x;
    //pirate.zGoal=intersection.z;


    console.log("*")
    // Redondear posiciones al entero más cercano
    let startX = Math.round(guyblock.position.x);
    let startZ = Math.round(guyblock.position.z);
    let endX = Math.round(intersection.x);
    let endZ = Math.round(intersection.z);

    //let path = aStar([startX, startZ], [endX, endZ], grid);
   //console.log(endX+"  "+endZ)
    let path = aStar( {x: startX, y: startZ},  {x: endX, y: endZ}, grid);

    //console.log(path);

    guyblock.path=path
    guyblock.hasPath=true
  }
  //Debug tool to have feedback of clicks
  // scene.add(new Box({
  //   width: 0.5,
  //   height: 0.5,
  //   depth: 0.5,
  //   color: "#ff0000",
  //   position: {
  //     x: intersection.x,
  //     y: 1,
  //     z: intersection.z,
  //   },
  // }));

});

/** Utilidad para guardar el estado del Orbit Control */
/**
const saveControlsToFile = (controls) => {
  controls.saveState();
  const { target0, position0, zoom0 } = controls;
  const state = { target0, position0, zoom0 };
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'orbitControls.json';
  a.click();
  URL.revokeObjectURL(url);
};

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    saveControlsToFile(controls);
    console.log('Estado de los controles guardado en un archivo JSON.');
  }
});
*/

let frames = 0;
let pirate_list=[]
let pirate_id=1;
let elapsed_stan_time=0;

function animate() {
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  //controls.update();

  const delta = clock.getDelta(); // Get the time since the last frame

  if(clock.getElapsedTime()>3)
    {
      loadingScreen.classList.add('hidden');
      controls.enabled=true;
    }

  //Debug logs to configure the inital camera position
  //console.log("Camera pos: " + camera.position.x+" "+camera.position.y+" "+camera.position.z+" ");
  //console.log("Camera rot: new THREE.Euler("+camera.rotation.x+", "+camera.rotation.y+", "+camera.rotation.z+","+camera.rotation.order+");");
  


  //Guyblock
  guyblock.update();
  let minDistance = Infinity;
  let closestCity = null;
  for (const city of cities_points)
  {
    let dx=guyblock.position.x-city.x
    let dz=guyblock.position.z-city.z
    let dist=Math.sqrt(dx * dx + dz * dz);
    if (dist < minDistance) {
    minDistance = dist;
    closestCity = city;
    }
  }
  const intensity = sigmoid(minDistance,5,10, guyblocklight_intensity);
  guyblocklight.intensity = intensity;


  //Ocean
  ocean.update(clock);

  //Firelight
  light_lh.update()
  helper_lh.update();


  //Stan
  elapsed_stan_time += delta; // Accumulate elapsed time

  if(elapsed_stan_time>=0.5)
  {
  spotlights.sort(() => Math.random() - 0.5);
  let visibility=spotlights[0].visible;
  spotlights.forEach(light => {
    visibility=!visibility;
    light.visible=visibility
  });
  elapsed_stan_time=0;
  }

  //Firecamp
  const fireSpeed = 0.25; // Velocidad a la que se mueven las "llamas"
  const intensityVariation = 5; // Variación de la intensidad de la luz
  const baseIntensity = 5; // Intensidad base de la luz
  const time = clock.getElapsedTime() * fireSpeed;  
  firecamplight.intensity = baseIntensity + Math.abs(Math.sin(time * 1.5) * intensityVariation);

  //Pirates
  if(pirate_list.length<3)
  {
    let piratenpc= createRandomNPC(pirate_id, cities_points, grid);
    scene.add(piratenpc);
    pirate_list.push(piratenpc)
    console.log("Creado pirate "+pirate_id)
    pirate_id = pirate_id + 1;
  }

  for(let npc of pirate_list)
  {
    npc.update();


    if ((npc.position.x - guyblock.position.x) ** 2 + (npc.position.z - guyblock.position.z) ** 2 < 4)
    {
      console.log("Colisión entre Guyblock y pirata #"+npc.pirate_id)
    }

    if(npc.hasPath===true)
      continue

    scene.remove(npc);

    if (npc.geometry) pirate.geometry.dispose();
    if (npc.material) {
        if (Array.isArray(npc.material)) {
          npc.material.forEach(mat => mat.dispose());
        } else {
          npc.material.dispose();
        }
    }
    let index = pirate_list.indexOf(npc);
    if (index !== -1) {
        pirate_list.splice(index, 1);
    }

    console.log("Pirate #"+npc.pirate_id+" removed!");

  }



  frames++;
}
animate();


}


main();






