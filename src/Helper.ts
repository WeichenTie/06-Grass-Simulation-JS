import { makeNoise2D } from "fast-simplex-noise";
const noise = makeNoise2D();
const heightMapCache: any = {};

export function getHeight(x: number, y: number) {
  const lacunarity = 1;
  const persistence = 0.75;
  const scale = 3;
  const xCache = heightMapCache[x];
  if (xCache) {
    const yCache = xCache[y];
    if (yCache) {
      return yCache[y];
    }
  }
  let height = 0;
  for (let i = 0; i < 8; i++) {
    height +=
      persistence ** i *
      (noise(x / (lacunarity ** i * scale), y / (lacunarity ** i * scale)) * 2 -
        1);
  }

  return height;
}
