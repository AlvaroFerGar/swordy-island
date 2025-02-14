import * as THREE from "three";


// Base function for creating any mesh building
function createBaseMesh(scene, geometry, x, y, z, colorhex=0xffb61e) {
    const material = new THREE.MeshLambertMaterial({color: colorhex});
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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

export function createCityLight(scene, x, y, z,colorhex=0xffb61e, intensity=5, distance=5, shownhelper=false) {
    
    console.log("luz:"+colorhex)
    const citylight = new THREE.PointLight(colorhex, 5, 5);
    citylight.position.set(x, y, z);
    citylight.castShadow = true;
    if(shownhelper)
    {
        let cityhelper = new THREE.PointLightHelper(citylight, 2);
        citylight.add(cityhelper);
    }
    
    scene.add(citylight);

  }