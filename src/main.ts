import * as THREE from "three";
import { AmbientLight, Vector3, Color } from "three";
import { buildTerrain } from "./TerrainBuilder";
import { toTrianglesDrawMode } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { getHeight, getNormalisedHeight } from "./Helper";
import { GrassShaderMaterial } from "./GrassShaderMaterial";

const TERRAIN_W = 20;
const TERRAIN_H = 20;

const width = window.innerWidth,
  height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 3500);
camera.position.set(10, 2, 10);
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
// terrainMesh.rotateX(Math.PI / 2);
const wireframe = new THREE.WireframeGeometry(terrainGeometry);
const line = new THREE.LineSegments(wireframe);
// mesh.add(line);

// Grass

function grassBuilder(sections: number, width: number, height: number) {
  const sectionHeight = height / (sections + 1);
  const v0 = [-width / 2, 0, 0];
  const verts = [];
  const normals = [];
  const indices = [];
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
    normals.push(0, 0, 1, 0, 0, 1);
  }
  verts.push(
    //t1
    0,
    height,
    v0[2]
  );
  for (let i = 0; i < sections * 2 - 1; i++) {
    indices.push(i, i + 1, i + 2);
    indices.push(i + 1, i + 3, i + 2);
  }
  indices.push(sections * 2, sections * 2 + 1, sections * 2 + 2);

  normals.push(0, 0, 1, 0, 0, 1);
  return {
    positions: new Float32Array(verts),
    normals: new Float32Array(normals),
    indices,
  };
}

const GRASS_LIMIT = 100000;
const grassGeometry = new THREE.BufferGeometry();
const grassBlade = grassBuilder(5, 0.05, 0.5);

grassGeometry.setIndex(grassBlade.indices);
grassGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(grassBlade.positions, 3)
);
grassGeometry.setAttribute(
  "normal",
  new THREE.BufferAttribute(grassBlade.normals, 3)
);

grassGeometry.computeVertexNormals();
const grassMaterial = GrassShaderMaterial();
grassMaterial.side = THREE.DoubleSide;
const grassMesh = new THREE.InstancedMesh(
  grassGeometry,
  grassMaterial,
  GRASS_LIMIT
);

var seed = 1;
function random() {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

for (let i = 0; i < GRASS_LIMIT; i++) {
  const x = ((random() * 2 - 1) * TERRAIN_W) / 2;
  const z = ((random() * 2 - 1) * TERRAIN_H) / 2;
  const y = getNormalisedHeight(x, z);
  const position = new Vector3(x, y, z);
  grassMesh.setMatrixAt(i, new THREE.Matrix4().makeTranslation(position));
}
terrainMesh.add(grassMesh);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.translateY(50);
directionalLight.translateX(10);
directionalLight.translateZ(10);
scene.add(directionalLight);
const ambient = new AmbientLight(0xffffff, 1);
scene.add(ambient);
scene.add(terrainMesh);

// Start Animation
scene.background = new Color(0x6495ed);
function animation(time: number) {
  renderer.render(scene, camera);
  // terrainMesh.rotateZ(0.001);
  grassMaterial.uniforms.uTime.value = time;
  grassMaterial.uniforms.uCameraDirection.value = new Float32Array(
    camera.getWorldDirection(new Vector3()).toArray()
  );
  //mesh.translateX(0.05 * Math.sin(0.001 * time));
}
