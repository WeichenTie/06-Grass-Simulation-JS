import * as THREE from "three";
import {
  AmbientLight,
  Euler,
  Object3D,
  PointLight,
  Vector3,
  Color,
  Triangle,
} from "three";
import { inverseLerp } from "three/src/math/MathUtils.js";
import { getHeight, setMax, setMin } from "./Helper";

export function buildTerrain(
  width: number,
  height: number,
  xSegments: number,
  zSegments: number
) {
  const vertices = [];
  const indices = [];

  const xSegmentLength = width / xSegments;
  const zSegmentLength = height / zSegments;

  let maxHeight = -Infinity;
  let minHeight = Infinity;
  // Get all coords
  for (let z = 0; z < zSegments; z++) {
    for (let x = 0; x < xSegments; x++) {
      const xCoord = x * xSegmentLength - width / 2;
      const zCoord = z * zSegmentLength - height / 2;
      const hCoord = getHeight(xCoord, zCoord);
      vertices.push(xCoord, hCoord, zCoord);
      maxHeight = Math.max(maxHeight, hCoord);
      minHeight = Math.min(minHeight, hCoord);
    }
  }
  setMin(minHeight);
  setMax(maxHeight);
  // Normalise heights
  for (let i = 0; i < zSegments * xSegments; i++) {
    vertices[i * 3 + 1] = inverseLerp(
      minHeight,
      maxHeight,
      vertices[i * 3 + 1]
    );
  }

  for (let y = 0; y < zSegments - 1; y++) {
    for (let x = 0; x < xSegments - 1; x++) {
      // Calculate indices
      const tl = x + y * xSegments;
      const tr = x + y * xSegments + 1;
      const bl = x + (y + 1) * xSegments;
      const br = x + (y + 1) * xSegments + 1;
      indices.push(tl, bl, br, br, tr, tl);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: indices,
  };
}
