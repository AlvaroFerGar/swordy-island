import * as THREE from "three";
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import Box from "../utils/box.js";


export function loadSVG(url,scene) {
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

export function createVisualOrigin(scene) {
  //X axis-red
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

  //Z axis-blue
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

  //0- black
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
}