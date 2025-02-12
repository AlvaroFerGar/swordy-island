import * as THREE from "three";


export default class Pirate extends THREE.Group {
    constructor({
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
      color_legs = '#000000',
      color_body = '#FFFFFF',
      color_face = '#ebb0a0',
      color_hair = '#a5892e'
    }) {
      super();
  
      // Create three boxes with different colors
      const pirateHeight = block_height * 3;
      const hairHeight = block_height*0.1;

      // Bottom box (legs) - Brown
      this.bottomBox = new THREE.Mesh(
        new THREE.BoxGeometry(width, block_height, depth),
        new THREE.MeshStandardMaterial({ color: color_legs })
      );
this.bottomBox.castShadow=true
      this.bottomBox.receiveShadow=true
      
      // Middle box (body) - Blue
      this.middleBox = new THREE.Mesh(
        new THREE.BoxGeometry(width, block_height, depth),
        new THREE.MeshStandardMaterial({ color: color_body })
      );
this.middleBox.castShadow=true
      this.middleBox.receiveShadow=true
      
      // Top box (head) - Beige
      this.topBox = new THREE.Mesh(
        new THREE.BoxGeometry(width, block_height, depth),
        new THREE.MeshStandardMaterial({ color:  color_face})
      );
this.topBox.castShadow=true
      this.topBox.receiveShadow=true
  
      this.hairBox = new THREE.Mesh(
        new THREE.BoxGeometry(width, hairHeight, depth),
        new THREE.MeshStandardMaterial({ color: color_hair })
      );
this.hairBox.castShadow=true
      this.hairBox.receiveShadow=true

      // Position the boxes relative to each other
      this.bottomBox.position.y = block_height/2;
      this.middleBox.position.y = this.bottomBox.position.y+block_height;
      this.topBox.position.y = this.middleBox.position.y+block_height;
      this.hairBox.position.y = this.topBox.position.y +block_height*0.5+hairHeight*0.5;
  
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
      this.hasPositionGoal=false;
      this.xGoal=0
      this.zGoal=0
  
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
  
    pathPlanning()
    {
      const movement_increment=0.5

      const reached_x=Math.abs(this.position.x-this.xGoal)<movement_increment*3
      const reached_z=Math.abs(this.position.z-this.zGoal)<movement_increment*3
      if (this.hasPositionGoal)
        {
          console.log("tengo un objetivo");
          this.position.x += (reached_x)?0:Math.sign(this.xGoal - this.position.x) * movement_increment;
          this.position.z += (reached_z)?0:Math.sign(this.zGoal - this.position.z) * movement_increment;
        }
      if( reached_x && reached_z)
          this.hasPositionGoal=false;
    }
  }
  
  // Keep the boxCollision function unchanged
  function boxCollision({ box1, box2 }) {
    const xCollision = box1.right >= box2.left && box1.left <= box2.right;
    const yCollision =
      box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom;
    const zCollision = box1.front >= box2.back && box1.back <= box2.front;
    return xCollision && yCollision && zCollision;
  }