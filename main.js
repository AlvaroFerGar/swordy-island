import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import Box from "./box.js";
import Pirate from "./pirate.js";
import { isPointInPolygon, createGrid } from "./polyutils.js"
import  aStar  from "./astarisborn.js"
import { createBoxBuilding, createCircularHouse, createCityLight, createBoatBuilding } from "./buildings.js";


// Get the loading screen element
const loadingScreen = document.getElementById('loading-screen');

function loadSVG(url,scene) {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load('assets/swordyisland.svg', function (data) {
      // Extract the paths from the SVG data
      const paths = data.paths;
      
      // Find the first path and extract points (assuming it's a polygon)
      const points = paths[0].toShapes()[0].getPoints();  // Convert path to shapes and get the points
      const scale_x=1/2*-1
      const offset_x=0
      const scale_y=1/2*-1
      const offset_y=-30
      let ground_polygon_vertices = points.map(p => [p.y*scale_x+offset_x, p.x*scale_y+offset_y]);
    
      // Now create the shape from the extracted points
      const shape = new THREE.Shape();
      ground_polygon_vertices.forEach((p, i) => {
        if (i === 0) shape.moveTo(p[0], p[1]);
        else shape.lineTo(p[0], p[1]);
      });
      shape.lineTo(ground_polygon_vertices[0][0], ground_polygon_vertices[0][1]); // Close the shape
    
      const extrudeSettings = { steps: 1, depth: 2, bevelEnabled: false };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({ color: 0x185452 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      ground_polygon_vertices = ground_polygon_vertices.map(p => [p[0], -p[1]])//Chanigng symbol in zs as we have rotated
      mesh.position.y = -2;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      scene.add(mesh);

      resolve(ground_polygon_vertices)
    });
  });
}
async function main()
{




const helpers_shown=false;

///Scene
const scene = new THREE.Scene();

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
createCityLight(scene, x_town, 0.5, z_town,
  0xffa400,
  5,5,helpers_shown);
createBoxBuilding(scene, x_town+1, 0, z_town+2, 1, 1, 1);


//MeatHook
const x_mh=39
const z_mh=63
cities_points.push({x:x_mh,z:z_mh})
createCityLight(scene, x_mh, 0.5, z_mh,
  0xffa400,
  5,5,helpers_shown);
createBoxBuilding(scene, x_mh, 0, z_mh, 1, 1, 1);

//Smirk
const x_cs=-28
const z_cs=78
cities_points.push({x:x_cs,z:z_cs})
createCityLight(scene, x_cs, 0.5, z_cs,
  0xffa400,
  5,5,helpers_shown);
createBoxBuilding(scene, x_cs, 0, z_cs, 1, 1, 1);

//Circus
const x_cir=3
const z_cir=20
cities_points.push({x:x_cir,z:z_cir})
const cir_radius=1
createCircularHouse(scene, x_cir, 0, z_cir, cir_radius, 1, 1, 0xff0000, 0xff0000)
createCircularHouse(scene, x_cir-1, 0, z_cir-1, cir_radius, 1, 1, 0xff0000, 0xff0000)

createCityLight(scene, x_cir+cir_radius, 0.5, z_cir+cir_radius, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir+cir_radius, 0.5, z_cir-cir_radius, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir-cir_radius, 0.5, z_cir+cir_radius, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir-cir_radius, 0.5, z_cir-cir_radius, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir+cir_radius-1, 0.5, z_cir+cir_radius-1, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir+cir_radius-1, 0.5, z_cir-cir_radius-1, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir-cir_radius-1, 0.5, z_cir+cir_radius-1, 0xff0000, 10,10, helpers_shown);
createCityLight(scene, x_cir-cir_radius-1, 0.5, z_cir-cir_radius-1, 0xff0000, 10,10, helpers_shown);


//Shipyard
const x_stan=-29
const z_stan=38
cities_points.push({x:x_stan,z:z_stan})
createCityLight(scene, x_stan, 0.5, z_stan,
  0xff0000,
  500,500,true);

createBoxBuilding(scene, x_stan, 0, z_stan,       1, 1, 1, 0xff0000);

createBoxBuilding(scene, x_stan+1, 0, z_stan-1,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan+1, 0, z_stan+1,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan-1, 0, z_stan-1,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan-1, 0, z_stan,     0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan-1, 0, z_stan+1,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan+0.5, 0, z_stan+1.5,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan+0.5, 0, z_stan-1.5,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan-1, 0, z_stan+2,   0.5, 1, 0.5, 0xff0000);
createBoxBuilding(scene, x_stan-1, 0, z_stan-2,   0.5, 1, 0.5, 0xff0000);

const boats_y=-2*0.8
createBoatBuilding(
  scene, 
  x_stan+4, boats_y, z_stan+4,                   // position
  1.5, 0.7, 3,                   // hull dimensions
  1.5, 3, 0.15,                   // sail dimensions
  0x694629, 0xf0f0f0          // hull and sail colors
);
createBoatBuilding(
  scene, 
  x_stan+6, boats_y, z_stan+4,                   // position
  1.5, 0.7, 3,                   // hull dimensions
  1.5, 3, 0.15,                   // sail dimensions
  0x694629, 0xf0f0f0          // hull and sail colors
);

createBoatBuilding(
  scene, 
  x_stan+4, boats_y-0.1, z_stan+8,                   // position
  1.5, 0.7, 3,                   // hull dimensions
  1.5, 3, 0.15,                   // sail dimensions
  0x694629, 0xf0f0f0          // hull and sail colors
);
createBoatBuilding(
  scene, 
  x_stan+2, boats_y-0.1, z_stan+8,                   // position
  1.5, 0.7, 3,                   // hull dimensions
  1.5, 3, 0.15,                   // sail dimensions
  0x694629, 0xf0f0f0          // hull and sail colors
);



//LightHouse
const x_lh=22
const z_lh=-42
cities_points.push({x:x_lh,z:z_lh})
const lh_height=4
const lh_roofheight=.2
createCityLight(scene, x_lh, 0.5, z_lh, 0xffa400,
  5,5,helpers_shown);
createCircularHouse(scene, x_lh, 0, z_lh, 0.5, lh_height, lh_roofheight, 0xffffff, 0xffffff)

const light_lh = new THREE.SpotLight(0xffffff, 2, 200, Math.PI / 6, 0.2, 1);
light_lh.position.set(x_lh, lh_height+lh_roofheight-2, z_lh-1);
light_lh.target.position.set(x_lh, 0, -200);
light_lh.castShadow = true;
light_lh.shadow.bias = -0.005;
scene.add(light_lh);
scene.add(light_lh.target);

const helper_lh = new THREE.SpotLightHelper(light_lh);
if(helpers_shown)
  scene.add(helper_lh);






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


const loadingPromise = new Promise((resolve) => setTimeout(resolve, 1)); // 3 seconds delay
///Ground
console.log("Cargando SVG...");
const ground_polygon_vertices = await loadSVG('assets/swordyisland.svg',scene);
console.log("Carga completada");
//console.log(ground_polygon_vertices)
let grid = createGrid(ground_polygon_vertices, 1, scene); // Create grid with spacing of 1


  // Wait for both the loading promise and the asset loading to complete
  await loadingPromise;
  // Hide the loading screen once everything is loaded
  loadingScreen.classList.add('hidden');

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

// const shadowground = new THREE.Mesh(
//   new THREE.PlaneGeometry(1000, 1000),
//   new THREE.ShadowMaterial({ opacity: 0.5 })
// );
// shadowground.rotation.x = -Math.PI / 2;
// shadowground.position.y = -2;
// shadowground.receiveShadow = true;
// scene.add(shadowground);




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



//Eje de coordenadas
  scene.add(new Box({
   width: 1,
   height: 1,
   depth: 1,
   color: "#ff0000",
   position: {
     x: 4,
     y: 0,
     z: 0,
   },
  }));

  scene.add(new Box({
    width: 1,
    height: 1,
    depth: 1,
    color: "#0000ff",
    position: {
      x: 0,
      y: 0,
      z: 4,
    },
   }));

   
   scene.add(new Box({
    width: 1,
    height: 1,
    depth: 1,
    color: "#000000",
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
   }));
 

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


function animate() {
  const animationId = requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // movement code
  guyblock.velocity.x = 0;
  guyblock.velocity.z = 0;
  if (keys.a.pressed) guyblock.velocity.x = -0.05;
  else if (keys.d.pressed) guyblock.velocity.x = 0.05;

  if (keys.s.pressed) guyblock.velocity.z = 0.05;
  else if (keys.w.pressed) guyblock.velocity.z = -0.05;
  guyblock.update();


  ocean.update();


  light_lh.target.position.x = x_lh + Math.sin(Date.now() * 0.001) * 50;
  light_lh.target.position.z = -200 + Math.cos(Date.now() * 0.001) * 50;
  light_lh.target.updateMatrixWorld();
  helper_lh.update();

  if(pirate_list.length<5)
  {
    const colorSets = [
      {
          color_legs: '#51b8be', // Negro
          color_body: '#313dd5', // Blanco
          color_face: '#59342a', // Piel clara
          color_hair: '#313dd5'  // Marrón claro
      },
      {
          color_legs: '#aeaea6', // Rojo oscuro
          color_body: '#e30e0e', // Dorado
          color_face: '#be9151', // Piel más clara
          color_hair: '#be9151'  // Gris oscuro
      },
      {
          color_legs: '#183043', // Azul
          color_body: '#eff210', // Verde oscuro
          color_face: '#ebb0a0', // Bronceado
          color_hair: '#ff7e00'  // Marrón oscuro
      }
  ];


    const selectedColors = colorSets[Math.floor(Math.random() * colorSets.length)];
    const piratenpc = new Pirate({
      pirate_id: pirate_id,
      width: 1,
      block_height: 1,
      depth: 1,
      velocity: {
        x: 0,
        y: -0.01,
        z: 0,
      },
      color_hair: selectedColors.color_hair,
      color_face: selectedColors.color_face,
      color_body: selectedColors.color_body,
      color_legs: selectedColors.color_legs
    });
    pirate_id=pirate_id+1;

    let cityA_index = Math.floor(Math.random() * cities_points.length);
    let cityB_index;

    do {
      cityB_index = Math.floor(Math.random() * cities_points.length);
    } while (cityA_index === cityB_index); // Ensure different indices

    //console.log(`City A X: ${cities_points[cityA_index].x} Y: ${cities_points[cityA_index].z}`);
    //console.log(`City B X: ${cities_points[cityB_index].x} Y: ${cities_points[cityB_index].z}`);

    piratenpc.position.set(cities_points[cityA_index].x, 0, cities_points[cityA_index].z);
    let path = aStar( {x: cities_points[cityA_index].x, y: cities_points[cityA_index].z},  {x: cities_points[cityB_index].x, y: cities_points[cityB_index].z}, grid);
    //console.log(path);
    piratenpc.path=path
    piratenpc.hasPath=true
    scene.add(piratenpc);
    pirate_list.push(piratenpc)
    console.log("Creado pirate "+pirate_id-1)
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
