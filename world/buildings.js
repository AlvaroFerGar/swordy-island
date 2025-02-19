import * as THREE from "three";


// Base function for creating any mesh building
function createBaseMesh(scene, geometry, x, y, z, colorhex=0xffb61e) {
    const material = new THREE.MeshLambertMaterial({color: colorhex});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    //mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Create a box building
export function createBoxBuilding(scene, x, y, z, width, height, depth, colorhex=0xffb61e) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    return createBaseMesh(scene, geometry, x, y, z, colorhex);
}

// Create a truncated cone building
export function createTruncatedConeBuilding(scene, x, y, z, radiusTop, radiusBottom, height, colorhex=0xffb61e) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
    return createBaseMesh(scene, geometry, x, y, z, colorhex);
}

// Create a regular cone building
export function createConeBuilding(scene, x, y, z, radius, height, colorhex=0xffb61e) {
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    return createBaseMesh(scene, geometry, x, y, z, colorhex);
}

// Create a cylinder building
export function createCylinderBuilding(scene, x, y, z, radius, height, colorhex=0xffb61e) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    return createBaseMesh(scene, geometry, x, y, z, colorhex);
}

// Create a circular house (cylinder with cone roof)
export function createCircularHouse(scene, x, y, z, radius, wallHeight, roofHeight, colorhex=0xffb61e, roofColorhex=0xe65c00) {
    // Create a group to hold both parts
    const house = new THREE.Group();
    
    // Create the cylindrical walls using base function
    const wallGeometry = new THREE.CylinderGeometry(radius, radius, wallHeight, 32);
    const walls = createBaseMesh(scene, wallGeometry, 0, 0, 0, colorhex);
    
    // Create the conical roof using base function
    const roofGeometry = new THREE.ConeGeometry(radius * 1.2, roofHeight, 32);
    const roof = createBaseMesh(scene, roofGeometry, 0, (wallHeight + roofHeight) / 2, 0, roofColorhex);
    
    // Add parts to group
    house.add(walls);
    house.add(roof);
    
    // Position the entire house
    house.position.set(x, y, z);
    scene.add(house);
    
    return house;
}

// Create a boat building (hull + sail)
export function createBoatBuilding(scene, x, y, z, 
    hullWidth = 2, hullHeight = 1, hullDepth = 4, 
    sailWidth = 0.2, sailHeight = 3, sailDepth = 2,
    hullColorhex = 0x8b4513, sailColorhex = 0xffffff) {
    
    // Create a group to hold both parts
    const boat = new THREE.Group();
    
    // Create the hull using BoxGeometry
    const hullGeometry = new THREE.BoxGeometry(hullWidth, hullHeight, hullDepth);
    const hull = createBaseMesh(scene, hullGeometry, 0, 0, 0, hullColorhex);
    
    // Create the sail using BoxGeometry
    const sailGeometry = new THREE.BoxGeometry(sailWidth, sailHeight, sailDepth);
    const sail = createBaseMesh(scene, sailGeometry, 0, (hullHeight + sailHeight) / 2, 0, sailColorhex);
    
    // Add parts to group
    boat.add(hull);
    boat.add(sail);
    
    // Position the entire boat
    boat.position.set(x, y, z);
    scene.add(boat);
    
    return boat;
}

export function createPointLight(scene, x, y, z,colorhex=0xffb61e, intensity=5, distance=5, shownhelper=false) {
    
    const citylight = new THREE.PointLight(colorhex, 5, 5);
    citylight.position.set(x, y, z);
    citylight.castShadow = true;
    if(shownhelper)
    {
        let cityhelper = new THREE.PointLightHelper(citylight, 2);
        citylight.add(cityhelper);
    }
    
    scene.add(citylight);

    return citylight;
  }


  export function createSpotLight(scene, x, y, z,colorhex=0xffb61e, intensity=5, distance=5, shownhelper=false) {
    const citylight = new THREE.SpotLight(colorhex, intensity, distance, Math.PI / 32, 1, 128);
    citylight.position.set(x, y, z);
    citylight.target.position.set(x, 0, z)
    //citylight.castShadow = true;
    if(shownhelper)
    {
        let cityhelper = new THREE.SpotLightHelper(citylight, 2);
        citylight.add(cityhelper);
    }
    
    scene.add(citylight);
    scene.add(citylight.target);

    return citylight;
  }

  export function createStanShipyard(scene, x_stan, z_stan,helpers_shown) {
    //createCityLight(scene, x_stan, 1, z_stan,
    //0xff0000,
    //  500, 500, helpers_shown);

    const spotLights = [];

    // Colores para alternar
    const colors = [0xff0000, 0x0000ff];  // Rojo y azul
    let visible_start=0


    let colorIndex = 0;
    const grid_halfsize=1.25;
    const grid_step=0.75;
    for(let x_offset = -1*grid_halfsize; x_offset <= grid_halfsize; x_offset += grid_step) {
        for(let z_offset = -1*grid_halfsize; z_offset <= grid_halfsize; z_offset += grid_step) {
            // Crear la luz con el color actual
            let light=createSpotLight(
                scene,
                x_stan + x_offset,
                6,
                z_stan + z_offset,
                colors[colorIndex],
                2,
                0
            );

            //light.visible=visible_start<1;
            //visible_start+=1;
            //if(visible_start>1)
            //  visible_start=0;
            
            // Guardar la luz en el array
            spotLights.push(light);
            
            // Alternar entre 0 y 1 para cambiar entre rojo y azul
            colorIndex = (colorIndex + 1) % 2;
            console.log("color: "+colorIndex)
        }
        // Cambiar el color inicial de cada fila para crear un patrón de tablero
        colorIndex = (colorIndex + 1) % 2;
    }


    
    createBoxBuilding(scene, x_stan, 0, z_stan, 1, 1, 1,                0xff0000);
  
    createBoxBuilding(scene, x_stan + 1, 0, z_stan - 1, 0.5, 1, 0.5,    0xbe0000);
    createBoxBuilding(scene, x_stan + 1, 0, z_stan + 1, 0.5, 1, 0.5,    0xbe0000);
    createBoxBuilding(scene, x_stan - 1, 0, z_stan - 1, 0.5, 1, 0.5,    0xbe0000);
    createBoxBuilding(scene, x_stan - 1, 0, z_stan, 0.5, 1, 0.5,        0xbe0000);
    createBoxBuilding(scene, x_stan - 1, 0, z_stan + 1, 0.5, 1, 0.5,    0xbe0000);
    createBoxBuilding(scene, x_stan + 0.5, 0, z_stan + 1.5, 0.5, 1, 0.5,0xbe0000);
    createBoxBuilding(scene, x_stan + 0.5, 0, z_stan - 1.5, 0.5, 1, 0.5,0xbe0000);
    createBoxBuilding(scene, x_stan - 1, 0, z_stan + 2, 0.5, 1, 0.5,    0xbe0000);
    createBoxBuilding(scene, x_stan - 1, 0, z_stan - 2, 0.5, 1, 0.5,    0xbe0000);
  
    const boats_y = -2 * 0.8;
    createBoatBuilding(
      scene,
      x_stan + 4, boats_y, z_stan + 4, // position
      1.5, 0.7, 3, // hull dimensions
      1.5, 3, 0.15, // sail dimensions
      0x694629, 0xf0f0f0 // hull and sail colors
    );
    createBoatBuilding(
      scene,
      x_stan + 6, boats_y, z_stan + 4, // position
      1.5, 0.7, 3, // hull dimensions
      1.5, 3, 0.15, // sail dimensions
      0x694629, 0xf0f0f0 // hull and sail colors
    );
  
    createBoatBuilding(
      scene,
      x_stan + 4, boats_y - 0.1, z_stan + 8, // position
      1.5, 0.7, 3, // hull dimensions
      1.5, 3, 0.15, // sail dimensions
      0x694629, 0xf0f0f0 // hull and sail colors
    );
    createBoatBuilding(
      scene,
      x_stan + 2, boats_y - 0.1, z_stan + 8, // position
      1.5, 0.7, 3, // hull dimensions
      1.5, 3, 0.15, // sail dimensions
      0x694629, 0xf0f0f0
    );

    return spotLights;
  }
  
  export function createCircus(scene, x_cir, z_cir, helpers_shown) {
    const cir_radius = 1;
    createCircularHouse(scene, x_cir, 0, z_cir, cir_radius, 1, 1, 0xff0000, 0xff0000);
    createCircularHouse(scene, x_cir - 1, 0, z_cir - 1, cir_radius, 1, 1, 0xff0000, 0xff0000);
  
    const y_lights=0.5;
    createPointLight(scene, x_cir + cir_radius, y_lights, z_cir + cir_radius, 0xff0000, 20, 10, helpers_shown);
    createPointLight(scene, x_cir + cir_radius, y_lights, z_cir - cir_radius, 0xff0000, 20, 10, helpers_shown);
    createPointLight(scene, x_cir - cir_radius, y_lights, z_cir + cir_radius, 0xff0000, 20, 10, helpers_shown);
    createPointLight(scene, x_cir - cir_radius, y_lights, z_cir - cir_radius, 0xff0000, 20, 10, helpers_shown);
  }
  
  export  function createCptSmirk(scene, x_cs, z_cs, helpers_shown) {
    createPointLight(scene, x_cs, 0.5, z_cs,
      0xffa400,
      5, 5, helpers_shown);
    createBoxBuilding(scene, x_cs, 0, z_cs, 1, 1, 1);
  }
  
  export function createMeathook(scene, x_mh, z_mh, helpers_shown) {
    createPointLight(scene, x_mh, 0.5, z_mh,
      0xffa400,
      5, 5, helpers_shown);
    createBoxBuilding(scene, x_mh, 0, z_mh, 1, 1, 1);
  }
  
  export function createTown(scene, x_town, z_town, helpers_shown) {
    createPointLight(scene, x_town, 0.5, z_town,
    0xffa400,
    2, 0, helpers_shown);
    createPointLight(scene, x_town-2, 0.5, z_town,
    0xffa400,
    2, 0, helpers_shown);
    createPointLight(scene, x_town-2, 0.5, z_town-2,
    0xffa400,
    2, 0, helpers_shown);
  

    createBoxBuilding(scene,  x_town + 1, 0, z_town + 2, .2, .2, .2, 0xff8c00);
    let firecamplight=createPointLight(scene,   x_town + 1, 2, z_town + 2,
      0xff1900,
      50, 0.2, helpers_shown);


    createBoxBuilding(scene, x_town -1.2, 0, z_town -.2 , 1, 1, 1,0xffb61e);
    createBoxBuilding(scene, x_town -0.5, 0, z_town     , 1, 1, 1,0xffb61e);
    createBoxBuilding(scene, x_town -2, 0, z_town -.3   , 1, 1, 1,0xffb61e);
    createBoxBuilding(scene, x_town -3, 0, z_town -1    , 1, 1, 1,0xffb61e);
    createBoxBuilding(scene, x_town -1.5, 0, z_town -1  , 0.5, 4, 0.5,0xffb61e);
    createBoxBuilding(scene, x_town -1, 0, z_town -2    , 1, 1, 1,0xffb61e);

    return firecamplight;
  }
  

  export function createLightHouse(scene, x_lh, z_lh, helpers_shown) {
    const lh_height = 4;
    const lh_roofheight = .2;
    createPointLight(scene, x_lh, 0.5, z_lh, 0xffa400,
      5, 5, helpers_shown);
    createCircularHouse(scene, x_lh, 0, z_lh, 0.5, lh_height, lh_roofheight, 0xffffff, 0xffffff);
  
    const light_lh = new THREE.SpotLight(0xffffff, 2, 200, Math.PI / 6, 0.2, 1);
    light_lh.position.set(x_lh, lh_height + lh_roofheight - 2, z_lh - 1);
    light_lh.target.position.set(x_lh, 0, -200);
    light_lh.castShadow = true;
    light_lh.shadow.bias = -0.005;
    scene.add(light_lh);
    scene.add(light_lh.target);
  
    const helper_lh = new THREE.SpotLightHelper(light_lh);
    if (helpers_shown)
      scene.add(helper_lh);

    light_lh.update = (clock) =>
    {
        light_lh.target.position.x = x_lh + Math.sin(Date.now() * 0.001) * 50;
        light_lh.target.position.z = -200 + Math.cos(Date.now() * 0.001) * 50;
        light_lh.target.updateMatrixWorld();
    }

    return { light_lh, helper_lh };
  }