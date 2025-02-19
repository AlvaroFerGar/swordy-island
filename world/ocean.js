import * as THREE from "three";


//Ocean code
export const createOcean = () => {

  const size = 500; // Tamaño del océano (ancho y largo)
  const subdivisions = 250; // Número de subdivisiones de la geometría (afecta la resolución de las olas)
  const color = 0x0388fc; // Color del océano
  const oceanHeight = -2; // Posición en el eje Y donde se coloca el océano
  const waveHeight = 1.5; // Altura máxima de las olas
  const phaseRange = Math.PI/2; // Rango de variación de la fase inicial de cada ola
  const radius=250;

  // Creamos un plano con el tamaño y subdivisiones especificadas
  const geometry = new THREE.PlaneGeometry(size, size, subdivisions, subdivisions);
  geometry.rotateX(-Math.PI * 0.5);
  
  // Creamos el material con el color especificado
  const material = new THREE.MeshStandardMaterial({ color });

// Creamos la malla combinando la geometría y el material
  const ocean = new THREE.Mesh(geometry, material);

  // Posicionamos el océano en la altura indicada
  ocean.position.y = oceanHeight;

  ocean.receiveShadow = true;


  // Array para almacenar datos de los vértices, permitiendo que se muevan como olas
  const vertData = [];

  // Recorremos cada vértice de la geometría para asignarle propiedades dinámicas
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const tempVector = new THREE.Vector3();
    
    // Extraemos la posición del vértice en la geometría
    tempVector.fromBufferAttribute(geometry.attributes.position, i);
    
    // Calculamos la distancia desde el centro
    const distance = Math.sqrt(tempVector.x * tempVector.x + tempVector.z * tempVector.z);
    
    // Ocultamos los vértices fuera del radio
    if (distance > radius) {
      geometry.attributes.position.setY(i, -9999);
    }

    // Guardamos datos para animar este vértice
    vertData.push({
      initH: tempVector.y, // Altura inicial del vértice
      amplitude: THREE.MathUtils.randFloatSpread(waveHeight), // Altura máxima de la ola en este punto
      phase: THREE.MathUtils.randFloat(0, phaseRange) // Fase inicial aleatoria para variar el movimiento
    });
  }

  // Función de actualización que se ejecuta en cada fotograma para animar el océano
  ocean.update = (clock) => {

    const waveSpeed = 2; // Velocidad a la que se mueven las olas

    const time = clock.getElapsedTime() * waveSpeed; // Se multiplica por waveSpeed para ajustar la velocidad
    // Recorremos cada vértice y ajustamos su altura con una función seno
    vertData.forEach((vd, idx) => {
        if (geometry.attributes.position.getY(idx) < -99)
            return;
      const y = vd.initH + Math.sin(time + vd.phase) * vd.amplitude;
      geometry.attributes.position.setY(idx, y);
    });

    // Marcamos la posición de los vértices como actualizada para que se reflejen los cambios
    geometry.attributes.position.needsUpdate = true;

    // Recalculamos las normales de la geometría para mejorar la iluminación del océano
    geometry.computeVertexNormals();
  };


    // Creamos un plano estático de 2000x2000
    const staticGeometry = new THREE.CircleGeometry(radius*1.1);
    staticGeometry.rotateX(-Math.PI * 0.5);
    const staticOcean = new THREE.Mesh(staticGeometry, material);
    staticOcean.position.y = oceanHeight-waveHeight;
    staticOcean.receiveShadow = true;

  return {ocean, staticOcean};
};