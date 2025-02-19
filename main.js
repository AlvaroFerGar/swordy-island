import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {Pirate, createRandomNPC} from "./characters/pirate.js";
import { isPointInPolygon, createGrid } from "./utils/polyutils.js"
import { createOcean } from "./world/ocean.js";
import { loadSVG, createVisualOrigin } from "./world/land.js";
import  aStar  from "./utils/astarisborn.js"
import * as cities from "./world/buildings.js";
import { createGuyblockText } from "./text/text.js"


// Get the loading screen element
const loadingScreen = document.getElementById('loading-screen');

async function main()
{

const helpers_shown=false;

///Scene
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
/*loader.load('assets/background.png', function(texture) {
    scene.background = texture;
}, undefined, function(error) {
    console.error('Error al cargar la textura', error);
});*/
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
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-40, 80, 0);
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
light.position.y = 4;
light.position.x = camera.position.x-200;
light.position.z = camera.position.z-200;
light.castShadow = true;
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
const z_town=-17
cities_points.push({x:x_town,z:z_town})
cities.createTown(scene, x_town, z_town, helpers_shown);

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
const guyblocklight = new THREE.PointLight("#ffffff", 5, 5);
guyblocklight.position.set(guyblock.position.x, 3, guyblock.position.z);
guyblock.add(guyblocklight)//Light to make clear is the main character

//Added sprite
createGuyblockText(guyblock);




const loadingPromise = new Promise((resolve) => setTimeout(resolve, 1)); // 3 seconds delay
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

// Wait for both the loading promise and the asset loading to complete
await loadingPromise;
// Hide the loading screen once everything is loaded
loadingScreen.classList.add('hidden');


//Clock
let clock = new THREE.Clock();

//Ocean
const {ocean, staticOcean} = createOcean();
scene.add(staticOcean)
scene.add(ocean);


//Eje de coordenadas
createVisualOrigin(scene);
 

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





let frames = 0;
let pirate_list=[]
let pirate_id=1;
let elapsed_stan_time=0;

function animate() {
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  guyblock.update();

  ocean.update(clock);


  light_lh.update()
  helper_lh.update();


  const delta = clock.getDelta(); // Get the time since the last frame
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

  if(pirate_list.length<5)
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

    // 2. Liberar memoria de materiales y geometría
    if (npc.geometry) pirate.geometry.dispose();
    if (npc.material) {
        if (Array.isArray(npc.material)) {
          npc.material.forEach(mat => mat.dispose());
        } else {
          npc.material.dispose();
        }
    }

    // 3. Eliminarlo de la lista pirate_list
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






