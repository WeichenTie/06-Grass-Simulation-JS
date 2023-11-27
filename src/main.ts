import * as THREE from "three";
import { AmbientLight, Vector3, Color } from "three";
import { buildTerrain } from "./TerrainBuilder";
import { toTrianglesDrawMode } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getHeight, getNormalisedHeight } from "./Helper";

const TERRAIN_W = 5;
const TERRAIN_H = 5;

const width = window.innerWidth,
  height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 3500);
camera.position.y = 0.5;
camera.position.z = 2;
camera.lookAt(new Vector3(0, 0, 0));

const scene = new THREE.Scene();

// Terrain
const terrainGeometry = new THREE.BufferGeometry();
const terrain = buildTerrain(TERRAIN_W, TERRAIN_H, 100, 100);
terrainGeometry.setIndex(terrain.indices);
terrainGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(terrain.vertices, 3)
);
terrainGeometry.computeVertexNormals();
const terrainMaterial = new THREE.MeshLambertMaterial();
terrainMaterial.color = new Color(0x7cca92);
const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrainMesh.rotateX(Math.PI / 2);
const wireframe = new THREE.WireframeGeometry(terrainGeometry);
const line = new THREE.LineSegments(wireframe);
// mesh.add(line);

// Grass

function grassBuilder(sections: number, width: number, height: number) {
  const sectionHeight = height / (sections + 1);
  const v0 = [-width / 2, 0, 0];
  const verts = [];
  const normals = [];
  for (let i = 0; i < sections + 1; i++) {
    verts.push(
      //t1
      v0[0],
      v0[1] + sectionHeight * i,
      v0[2],
      // t2
      v0[0] + width,
      v0[1] + sectionHeight * i,
      v0[2]
    );
    normals.push(0, 0, -1, 0, 0, 1);
  }
  verts.push(
    //t1
    0,
    height,
    v0[2]
  );
  normals.push(0, 0, 1, 0, 0, 1);
  return {
    positions: new Float32Array(verts),
    normals: new Float32Array(normals),
  };
}

const GRASS_LIMIT = 10000;
const grassGeometryBuffer = new THREE.BufferGeometry();
const grassBlade = grassBuilder(5, 0.005, 0.1);
grassGeometryBuffer.setAttribute(
  "position",
  new THREE.BufferAttribute(grassBlade.positions, 3)
);
grassGeometryBuffer.setAttribute(
  "normal",
  new THREE.BufferAttribute(grassBlade.normals, 3)
);

const grassGeometry = toTrianglesDrawMode(
  grassGeometryBuffer,
  THREE.TriangleStripDrawMode
);
grassGeometry.rotateX(-Math.PI / 2);
const grassMaterial = new THREE.MeshLambertMaterial();
grassMaterial.side = THREE.DoubleSide;
const grassMesh = new THREE.InstancedMesh(
  grassGeometry,
  grassMaterial,
  GRASS_LIMIT
);

for (let i = 0; i < GRASS_LIMIT; i++) {
  const x = ((Math.random() * 2 - 1) * TERRAIN_W) / 2;
  const y = ((Math.random() * 2 - 1) * TERRAIN_H) / 2;
  const z = getNormalisedHeight(x, y);
  const position = new Vector3(x, y, z);
  grassMesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(position));
}
terrainMesh.add(grassMesh);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.translateY(50);
scene.add(directionalLight);
const ambient = new AmbientLight(1);
scene.add(ambient);
scene.add(terrainMesh);

// Start Animation
scene.background = new Color(0x6495ed);
function animation(time: number) {
  renderer.render(scene, camera);
  //mesh.translateX(0.05 * Math.sin(0.001 * time));
}
