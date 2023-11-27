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
import { getHeight } from "./Helper";

export function buildTerrain(
  width: number,
  height: number,
  xSegments: number,
  ySegments: number
) {
  const vertices = [];
  const indices = [];

  const xSegmentLength = width / xSegments;
  const ySegmentLength = height / ySegments;

  let maxHeight = -Infinity;
  let minHeight = Infinity;
  // Get all coords
  for (let y = 0; y < ySegments; y++) {
    for (let x = 0; x < xSegments; x++) {
      const xCoord = x * xSegmentLength - width / 2;
      const yCoord = y * ySegmentLength - height / 2;
      const hCoord = getHeight(xCoord, yCoord);
      vertices.push(xCoord, yCoord, hCoord);
      maxHeight = Math.max(maxHeight, hCoord);
      minHeight = Math.min(minHeight, hCoord);
    }
  }
  // Normalise heights
  for (let i = 0; i < ySegments * xSegments; i++) {
    vertices[i * 3 + 2] = inverseLerp(
      minHeight,
      maxHeight,
      vertices[i * 3 + 2]
    );
  }

  for (let y = 0; y < ySegments - 1; y++) {
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
