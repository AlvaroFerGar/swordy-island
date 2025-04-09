import * as THREE from "three";
import * as cities from './buildings.js';
import { createTextSprite } from '../text/text.js';

export class CityManager {
  constructor(scene) {
    this.scene = scene;
    this.cityPoints = [];
    this.cityTextSprites = new Map();
    this.textHeight = 2; // Height of text above city point
    
    // City references
    this.firecamplight = null;
    this.spotlights = null;
    this.light_lh = null;
    this.helper_lh = null;
  }
  
  async initialize() {
    await this.createAllCities();
    await this.createAllCityLabels();
    return this.cityPoints;
  }
  
  async createAllCities() {
    // Town
    const x_town = -19;
    const z_town = -18;
    this.cityPoints.push({x: x_town, z: z_town, label: "Town"});
    this.firecamplight = cities.createTown(this.scene, x_town, z_town, false);
    
    // MeatHook
    const x_mh = 39;
    const z_mh = 63;
    this.cityPoints.push({x: x_mh, z: z_mh, label: "MeatHook's House"});
    cities.createMeathook(this.scene, x_mh, z_mh, false);
    
    // Smirk
    const x_cs = -28;
    const z_cs = 78;
    this.cityPoints.push({x: x_cs, z: z_cs, label: "Cpt. Square's House"});
    cities.createCptSmirk(this.scene, x_cs, z_cs, false);
    
    // Circus
    const x_cir = 3;
    const z_cir = 20;
    this.cityPoints.push({x: x_cir, z: z_cir, label: "Circus"});
    cities.createCircus(this.scene, x_cir, z_cir, false);
    
    // Shipyard
    const x_stan = -29;
    const z_stan = 38;
    this.cityPoints.push({x: x_stan, z: z_stan, label: "Stan"});
    this.spotlights = cities.createStanShipyard(this.scene, x_stan, z_stan, false);
    this.elapsed_stan_time = 0;
    
    // LightHouse
    const x_lh = 22;
    const z_lh = -42;
    this.cityPoints.push({x: x_lh, z: z_lh, label: "LightHouse"});
    const lightHouseObjects = cities.createLightHouse(this.scene, x_lh, z_lh, false);
    this.light_lh = lightHouseObjects.light_lh;
    this.helper_lh = lightHouseObjects.helper_lh;
  }
  
  async createAllCityLabels() {
    const createPromises = this.cityPoints.map(city => {
      return createTextSprite(city.label, "./assets/lucasarts-scumm-solid.otf").then(textSprite => {
        textSprite.visible = false; // Hide initially
        textSprite.position.x = city.x;
        textSprite.position.y = this.textHeight;
        textSprite.position.z = city.z;
        this.scene.add(textSprite);
        this.cityTextSprites.set(city.label, textSprite);
      });
    });
    
    return Promise.all(createPromises);
  }
  
  updateCityLabels(mouseIntersection) {
    // Hide all texts first
    this.cityTextSprites.forEach(textSprite => {
      textSprite.visible = false;
    });
    
    const proximityThreshold = 10; // Distance in 3D world units
    
    let closestCity = null;
    let closestDistance = Infinity;
    
    this.cityPoints.forEach(city => {
      const distance = (city.x - mouseIntersection.x) ** 2 + (city.z - mouseIntersection.z) ** 2;
      if (distance < proximityThreshold && distance < closestDistance) {
        closestCity = city;
        closestDistance = distance;
      }
    });
    
    // Show text for the closest city
    if (closestCity) {
      const textSprite = this.cityTextSprites.get(closestCity.label);
      if (textSprite) {
        textSprite.visible = true;
      }
    }
  }
  
  getClosestCityToPoint(point) {
    let minDistance = Infinity;
    let closestCity = null;
    
    for (const city of this.cityPoints) {
      let dx = point.x - city.x;
      let dz = point.z - city.z;
      let dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDistance) {
        minDistance = dist;
        closestCity = city;
      }
    }
    
    return { city: closestCity, distance: minDistance };
  }
  
  isPointNearCity(point, threshold = 5) {
    const { distance } = this.getClosestCityToPoint(point);
    return distance < threshold;
  }
  
  updateStanLights(deltaTime) {
    if (!this.spotlights) return;
    
    // Randomly toggle spotlights
    this.spotlights.sort(() => Math.random() - 0.5);
    let visibility = this.spotlights[0].visible;
    this.spotlights.forEach(light => {
      visibility = !visibility;
      light.visible = visibility;
    });
  }
  
  updateFirecamp(time) {
    if (!this.firecamplight) return;
    
    const fireSpeed = 0.25;
    const intensityVariation = 5;
    const baseIntensity = 5;
    this.firecamplight.intensity = baseIntensity + Math.abs(Math.sin(time * fireSpeed * 1.5) * intensityVariation);
  }
  
  updateLighthouse() {
    if (!this.light_lh || !this.helper_lh) return;
    
    this.light_lh.update();
    this.helper_lh.update();
  }
  
  update(deltaTime, elapsedTime, mouseIntersection) {
    // Update firecamp lighting
    this.updateFirecamp(elapsedTime);
    
    // Update lighthouse
    this.updateLighthouse();
    
    // Update Stan's shipyard lights
    this.elapsed_stan_time += deltaTime;
    if (this.elapsed_stan_time >= 0.5) {
      this.updateStanLights();
      this.elapsed_stan_time = 0;
    }
    
    // Update city labels if mouse position provided
    if (mouseIntersection) {
      this.updateCityLabels(mouseIntersection);
    }
  }
}