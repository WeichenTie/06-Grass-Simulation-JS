import { GLSL3, ShaderMaterial } from "three";

export function GrassShaderMaterial() {
  const shader = new ShaderMaterial({
    glslVersion: GLSL3,
    uniforms: {
      uTime: { value: 0.0 },
      uNumSegments: { value: 3 },
      uAverageHeight: { value: 0 },
    },
    vertexShader: `
    uniform float uTime;
    uniform int uNumSegments;
    uniform float uAverageHeight;

    mat3 getXRotationMatrix(float theta) {
        return mat3( 1.0, 0.0, 0.0, 
            0.0,cos(theta),sin(theta),
            0.0,-sin(theta),cos(theta));
    }
    
    mat3 getYRotationMatrix(float theta) {
        return mat3( cos(theta),0.0, -sin(theta),
        0.0, 1.0, 0.0,
        sin(theta), 0.0, cos(theta));
    }
    mat3 getZRotationMatrix(float theta) {
        return mat3( cos(theta), sin(theta), 0.0,
       -sin(theta), cos(theta), 0.0,
       0.0        , 0.0       ,1.0 );
    }

    float rand(float n){return fract(sin(n) * 43758.5453123);}
    float rand(vec2 n) { 
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }
    float noise(float p) {
        float fl = floor(p);
    float fc = fract(p);
        return mix(rand(fl), rand(fl + 1.0), fc);
    }
        
    float noise(vec2 n) {
        const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
    }

    out vec4 color;
    void main() {
        int level = gl_VertexID / 2;
        
        vec4 worldPos = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);

        mat3 rotMat = 
        getZRotationMatrix(rand(float(gl_InstanceID))) *
        getXRotationMatrix(noise(vec2(worldPos.x * 0.1  + uTime * 0.001 + 0.0000, worldPos.y * 0.1 + uTime * 0.001)) * 2.0 - 1.0) *
        getYRotationMatrix(noise(vec2(worldPos.x * 0.1  + uTime * 0.001 + 1000.0, worldPos.y * 0.1 + uTime * 0.001 - 5000.0)) * 2.0 - 1.0) *
        getZRotationMatrix(noise(vec2(worldPos.x * 0.1  + uTime * 0.001 + 5000.0, worldPos.y * 0.1 + uTime * 0.001 + 1000.0)) * 2.0 - 1.0);

        vec3 finalPosition = rotMat * vec3(position);

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(finalPosition, 1.0);
        color = mix(vec4(0.,0.8,0.596, 1.0), vec4(0.5,0.8,0.4, 1.0), float(level) / float(3) );
    }
    `,
    fragmentShader: `
    in vec4 color;
    out vec4 FragColor;
    void main() {
        FragColor = vec4(color);
    }
    `,
  });
  return shader;
}
