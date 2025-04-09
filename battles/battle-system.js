// battle-system.js
import * as THREE from "three";

export class BattleSystem {
    constructor(scene, camera, controls, player, grid) {
      this.scene = scene;
      this.camera = camera;
      this.controls = controls;
      this.player = player;
      this.grid = grid;
      
      // Battle state
      this.inBattle = false;
      this.collisionatedPirate = null;
      
      // Camera animation properties
      this.zoomingToCollision = false;
      this.zoomStartTime = 0;
      this.zoomDuration = 1.5; // duration in seconds
      this.originalCameraPosition = new THREE.Vector3();
      this.targetCameraPosition = new THREE.Vector3();
      this.originalControlsTarget = new THREE.Vector3();
      this.collisionPoint = new THREE.Vector3();
      this.targetPiratePoint = new THREE.Vector3();
      this.targetPlayerPoint = new THREE.Vector3();
      this.originalPiratePosition = new THREE.Vector3();
      this.originalPlayerPosition = new THREE.Vector3();
    }
    
    checkCollisions(pirates, playerNearCity) {
      if (this.inBattle)
        return false;
        
      if(this.playerNearCity)
        return false;
      
      for (const pirate of pirates) {
        const distanceSquared = (pirate.position.x - this.player.position.x) ** 2 + 
                               (pirate.position.z - this.player.position.z) ** 2;
                               
        if (distanceSquared < 8) {
          console.log("Collision between player and pirate #" + pirate.pirate_id);
          this.startBattle(pirate);
          return true;
        }
      }
      
      return false;
    }
    
    startBattle(pirate) {
      this.inBattle = true;
      this.collisionatedPirate = pirate;
      this.startCollisionZoom(pirate.position, this.player.position);
      this.controls.enabled=false;
      
      // Here you can add battle initialization logic
      // For example, disabling player movement, showing UI, etc.
    }
    
    endBattle() {
      this.inBattle = false;
      this.collisionatedPirate = null;
      this.zoomingToCollision = false;
      
      // Reset camera and controls
      this.camera.position.copy(this.originalCameraPosition);
      this.controls.target.copy(this.originalControlsTarget);
      this.controls.enabled = true;
      
      // Reset character positions
      // Add any additional cleanup here
    }
    
    startCollisionZoom(piratePos, playerPos) {
      // Save original positions
      this.originalCameraPosition.copy(this.camera.position);
      this.originalControlsTarget.copy(this.controls.target);
      this.originalPiratePosition.copy(piratePos);
      this.originalPlayerPosition.copy(playerPos);
      
      // Set target positions
      this.targetPiratePoint.copy(piratePos);
      this.targetPlayerPoint.copy(playerPos);
      
      // Determine which coordinate (x or z) is closer
      const xDistance = Math.abs(piratePos.x - playerPos.x);
      const zDistance = Math.abs(piratePos.z - playerPos.z);
      const separation = 2.5;
      
      let zCamera = 0;
      let xCamera = 0;
      let zOffset = 0;
      let xOffset = 0;
      
      if (xDistance <= zDistance) {
        // X is the closer coordinate, equalize it
        const avgX = (piratePos.x + playerPos.x) / 2;
        this.targetPiratePoint.x = avgX;
        this.targetPlayerPoint.x = avgX;
        xCamera = avgX;
        xOffset = -10;
        
        // Z is further, set separation
        const centerZ = (piratePos.z + playerPos.z) / 2;
        const direction = piratePos.z < playerPos.z ? -1 : 1;
        this.targetPiratePoint.z = centerZ + (direction * separation);
        this.targetPlayerPoint.z = centerZ - (direction * separation);
        zCamera = centerZ;
      } else {
        // Z is the closer coordinate, equalize it
        const avgZ = (piratePos.z + playerPos.z) / 2;
        this.targetPiratePoint.z = avgZ;
        this.targetPlayerPoint.z = avgZ;
        zCamera = avgZ;
        zOffset = -10;
        
        // X is further, set separation
        const centerX = (piratePos.x + playerPos.x) / 2;
        const direction = piratePos.x < playerPos.x ? -1 : 1;
        this.targetPiratePoint.x = centerX + (direction * separation);
        this.targetPlayerPoint.x = centerX - (direction * separation);
        xCamera = centerX;
      }
      
      // Calculate collision point with target positions
      this.collisionPoint.set(
        xCamera,
        0, // Slightly elevated for better visualization
        zCamera
      );
      
      // Calculate new camera position (diagonal view from above)
      const offset = new THREE.Vector3(xOffset, 2.5, zOffset);
      this.targetCameraPosition.copy(this.collisionPoint).add(offset);
      
      // Start animation
      this.zoomStartTime = Date.now();
      this.zoomingToCollision = true;
      
      // Temporarily disable orbit controls
      this.controls.enabled = false;
    }
    
    update() {
      if (!this.zoomingToCollision) return;
      
      const elapsed = (Date.now() - this.zoomStartTime) / 1000;
      const progress = Math.min(elapsed / this.zoomDuration, 1);
      
      // Easing function for smooth movement (ease-in-out)
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      // Interpolate camera position
      this.camera.position.lerpVectors(
        this.originalCameraPosition, 
        this.targetCameraPosition, 
        easeProgress
      );
      
      // Interpolate controls target
      this.controls.target.lerpVectors(
        this.originalControlsTarget, 
        this.collisionPoint, 
        easeProgress
      );
      
      // Move characters to their battle positions
      this.player.position.lerpVectors(
        this.originalPlayerPosition,
        this.targetPlayerPoint,
        easeProgress
      );
      
      this.collisionatedPirate.position.lerpVectors(
        this.originalPiratePosition,
        this.targetPiratePoint,
        easeProgress
      );
      
      // Update the camera
      this.camera.lookAt(this.collisionPoint);
      
      // End animation when complete
      if (progress >= 1) {
        this.zoomingToCollision = false;
        // Here you can trigger the actual battle mechanics
      }
    }
  }