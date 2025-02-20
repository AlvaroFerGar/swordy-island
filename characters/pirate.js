import * as THREE from "three";
import aStar from "../utils/astarisborn.js";

export class Pirate extends THREE.Group {
  constructor({
    pirate_id = 0,
    width = 1,
    block_height = 1, // Total height will be divided among the boxes
    depth = 1,
    position = {
      x: 0,
      y: 0,
      z: 0,
    },
    velocity = {
      x: 0,
      y: 0,
      z: 0,
    },
    zAcceleration = false,
    color_legs = "#000000",
    color_body = "#FFFFFF",
    color_face = "#ebb0a0",
    color_hair = "#a5892e",
  }) {
    super();

    this.pirate_id = pirate_id;

    this.color_hair = color_hair;
    this.color_face = color_face;
    this.color_body = color_body;
    this.color_legs = color_legs;

    // Create three boxes with different colors
    const pirateHeight = block_height * 3;
    const hairHeight = block_height * 0.1;

    // Bottom box (legs) - Brown
    this.bottomBox = new THREE.Mesh(
      new THREE.BoxGeometry(width, block_height, depth),
      new THREE.MeshStandardMaterial({ color: color_legs })
    );
    this.bottomBox.castShadow = true;
    this.bottomBox.receiveShadow = true;

    // Middle box (body) - Blue
    this.middleBox = new THREE.Mesh(
      new THREE.BoxGeometry(width, block_height, depth),
      new THREE.MeshStandardMaterial({ color: color_body })
    );
    this.middleBox.castShadow = true;
    this.middleBox.receiveShadow = true;

    // Top box (head) - Beige
    this.topBox = new THREE.Mesh(
      new THREE.BoxGeometry(width, block_height, depth),
      new THREE.MeshStandardMaterial({ color: color_face })
    );
    this.topBox.castShadow = true;
    this.topBox.receiveShadow = true;

    this.hairBox = new THREE.Mesh(
      new THREE.BoxGeometry(width, hairHeight, depth),
      new THREE.MeshStandardMaterial({ color: color_hair })
    );
    this.hairBox.castShadow = true;
    this.hairBox.receiveShadow = true;

    // Position the boxes relative to each other
    this.bottomBox.position.y = block_height / 2;
    this.middleBox.position.y = this.bottomBox.position.y + block_height;
    this.topBox.position.y = this.middleBox.position.y + block_height;
    this.hairBox.position.y =
      this.topBox.position.y + block_height * 0.5 + hairHeight * 0.5;

    // Add boxes to the group
    this.add(this.bottomBox);
    this.add(this.middleBox);
    this.add(this.topBox);
    this.add(this.hairBox);

    // Set the group's position
    this.position.set(position.x, position.y, position.z);

    // Store dimensions and properties
    this.width = width;
    this.height = block_height;
    this.depth = depth;
    this.pirateHeight = pirateHeight;

    // Physics properties
    this.velocity = velocity;
    this.gravity = -0.002;
    this.zAcceleration = zAcceleration;

    //
    this.hasPositionGoal = false;
    this.xGoal = 0;
    this.zGoal = 0;

    this.hasPath = false;
    this.path = [];

    // Initialize sides (based on bottom box position)
    this.updateSides();
  }

  updateSides() {
    // Calculate sides based on the bottom box's position
    this.right = this.position.x + this.width / 2;
    this.left = this.position.x - this.width / 2;
    this.bottom = this.position.y - this.block_height / 2;
    this.top = this.position.y + this.height - this.pirateHeight / 2;
    this.front = this.position.z + this.depth / 2;
    this.back = this.position.z - this.depth / 2;
  }

  update() {
    this.updateSides();
    if (this.zAcceleration) this.velocity.z += 0.0003;
    this.position.x += this.velocity.x;
    this.position.z += this.velocity.z;
    //this.applyGravity(ground);

    this.pathPlanning();
  }
  pathPlanning() {
    const movement_increment = 0.25;

    // Si hay un camino y no hemos llegado al final
    if (this.path && this.path.length > 0) {
      // Obtener el siguiente punto del camino
      const nextPoint = this.path[0];

      // Actualizar el objetivo actual
      this.xGoal = nextPoint.x;
      this.zGoal = nextPoint.y; // Nota: Asegúrate de que el camino use {x, y} o {x, z}

      // Verificar si el pirata ha alcanzado el punto actual
      const reached_x =
        Math.abs(this.position.x - this.xGoal) < movement_increment * 0.5;
      const reached_z =
        Math.abs(this.position.z - this.zGoal) < movement_increment * 0.5;

      if (reached_x && reached_z) {
        // Si el pirata ha alcanzado el punto, avanzar al siguiente punto del camino
        this.path.shift(); // Eliminar el punto actual del camino
        if (this.path.length === 0) {
          // Si no hay más puntos, detener el movimiento
          this.hasPath = false;
          console.log(
            "¡El pirata #" + this.pirate_id + " ha llegado a su destino!"
          );
        }
      } else {
        // Mover el pirata hacia el punto actual
        this.position.x += reached_x
          ? 0
          : Math.sign(this.xGoal - this.position.x) * movement_increment;
        this.position.z += reached_z
          ? 0
          : Math.sign(this.zGoal - this.position.z) * movement_increment;
      }
    } else {
      // Si no hay camino, detener el movimiento
      this.hasPath = false;
      //console.log("No hay camino o el camino ha terminado.");
    }
  }
}

export function createRandomNPC(pirate_id, cities_points, grid) {
  const colorSets = [
    {
      color_hair: "#313dd5",//blue
      color_face: "#59342a",
      color_body: "#313dd5",
      color_legs: "#51b8be",
    },
    {
      color_hair: "#e3270e",//red
      color_face: "#be9151",
      color_body: "#e30e0e",
      color_legs: "#aeaea6",
    },
    {
      color_hair: "#ecedab",//yellow
      color_face: "#ebb0a0",
      color_body: "#eff210",
      color_legs: "#183043",
    },
  ];

  const selectedColors =
    colorSets[Math.floor(Math.random() * colorSets.length)];
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
    color_legs: selectedColors.color_legs,
  });

  let cityA_index = Math.floor(Math.random() * cities_points.length);
  let cityB_index;

  do {
    cityB_index = Math.floor(Math.random() * cities_points.length);
  } while (cityA_index === cityB_index); // Ensure different indices

  //console.log(`City A X: ${cities_points[cityA_index].x} Y: ${cities_points[cityA_index].z}`);
  //console.log(`City B X: ${cities_points[cityB_index].x} Y: ${cities_points[cityB_index].z}`);
  piratenpc.position.set(
    cities_points[cityA_index].x,
    0,
    cities_points[cityA_index].z
  );
  let path = aStar(
    { x: cities_points[cityA_index].x, y: cities_points[cityA_index].z },
    { x: cities_points[cityB_index].x, y: cities_points[cityB_index].z },
    grid
  );
  //console.log(path);
  piratenpc.path = path;
  piratenpc.hasPath = true;
  return piratenpc;
}
