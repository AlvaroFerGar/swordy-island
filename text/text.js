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


export async function createTextSprite(text, fontpath) {
  await loadCustomFont(fontpath);

  // Crear canvas para el texto
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const fontSize = 256; // Tamaño base de la fuente
  context.font = `${fontSize}px CustomFont`;
  context.fillStyle = '#ffffff'; // Color del texto
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  const textWidth = context.measureText(text).width;
  const padding = 50; // Espacio adicional alrededor del texto

  canvas.width = textWidth + padding * 2; // Ancho del canvas
  canvas.height = fontSize + padding * 2; // Alto del canvas

  context.font = `${fontSize}px CustomFont`;
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });

  // Crear el sprite
  const sprite = new THREE.Sprite(spriteMaterial);

  const scaleFactor = 1/100; // Factor de escala para ajustar el tamaño en la escena
  sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);

  return sprite;
}

export async function createGuyblockText(pirate) {
  let textSprite = await createTextSprite("Guyblock","./assets/lucasarts-scumm-solid.otf");


  textSprite.name ="sprite"
  pirate.add(textSprite);
  textSprite.position.set(0, pirate.pirateHeight*2, 0);

  return textSprite;
}