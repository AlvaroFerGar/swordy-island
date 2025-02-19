import * as THREE from "three";

const loadCustomFont = async (fontPath) => {
  const customFont = new FontFace('CustomFont', `url(${fontPath})`);
  try {
      await customFont.load();
      document.fonts.add(customFont);
      console.log("loaded font")
      return true;
  } catch (error) {
      console.error('Error loading font:', error);
      return false;
  }
};

const createTextSprite =async (text,fontpath) => {

  await loadCustomFont(fontpath);

  // Create canvas for text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 2048;  // Increased canvas size
  canvas.height = 1024;
  
  // Clear the canvas with a background (for debugging)
  //context.fillStyle = 'rgba(0, 0, 0, 0.5)';
  //context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Set text properties
  context.font = '256px CustomFont';  // Increased font size
  context.fillStyle = '#ffffff';     // Bright white
  context.textAlign = 'center';
  context.textBaseline = 'middle';   // Better vertical centering
  
  // Add text to canvas
  context.fillText(text, canvas.width/2, canvas.height/2);
  // Create sprite texture
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,    // Enable transparency
      depthTest: false,     // Make sure text renders on top
      depthWrite: false     // Make sure text renders on top
  });
  
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(24, 12, 6);  // Increased scale
  
  return sprite;
};

export async function createGuyblockText(pirate) {
  const textSprite = await createTextSprite("Guyblock","./assets/lucasarts-scumm-solid.otf");

  // Añadir esto después de crear el sprite para ver sus dimensiones

  pirate.add(textSprite);
  textSprite.position.set(0, pirate.pirateHeight*2, 0);
}