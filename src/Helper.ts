import { makeNoise2D } from "fast-simplex-noise";
import { inverseLerp } from "three/src/math/MathUtils.js";
const noise = makeNoise2D(() => 1);
const heightMapCache: any = {};

let _max = -Infinity;
let _min = Infinity;
export function getHeight(x: number, y: number) {
  const lacunarity = 20;
  const persistence = 0.5;
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

export function getNormalisedHeight(x: number, y: number) {
  return inverseLerp(_min, _max, getHeight(x, y));
}

export function setMax(max: number) {
  _max = max;
}
export function setMin(min: number) {
  _min = min;
}
