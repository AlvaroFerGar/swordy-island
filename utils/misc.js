export function sigmoid(distance, minDistance = 2, maxDistance = 6, defaultIntensity = 1.0) {
    if (distance < minDistance) {
      return 0.0;
    } else if (distance > maxDistance) {
      return defaultIntensity;
    } else {
      // Ajuste sigmoide entre 0 y defaultIntensity
      const x = (distance - minDistance) / (maxDistance - minDistance);
      return defaultIntensity / (1 + Math.exp(-10 * (x - 0.5)));
    }
    }