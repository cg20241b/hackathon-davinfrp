import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Initialize the 3D scene with a black background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Hexadecimal for black

// Configure the WebGL renderer and attach it to the HTML document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up a perspective camera with a field of view of 75 degrees
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Define ambient lighting intensity
const additionalAmbientIntensity = 0.2;
const nrpAmbientIntensity = 0.137;
const ambientLightLevel = additionalAmbientIntensity + nrpAmbientIntensity;

// Create a central cube with custom shader material
const cubeSize = 1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const cubeShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 } // Uniform to track time for dynamic effects
  },
  vertexShader: `
      // Vertex Shader: Transforms each vertex to its correct screen position
      void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: `
      uniform float time; // Time uniform to create dynamic brightness

      void main() {
          // Base white color
          vec3 baseColor = vec3(1.0, 1.0, 1.0);
          // Calculate brightness oscillating with time
          float brightness = max(0.7 + sin(time * 1.0) * 0.3, 1.0);
          // Enhance brightness to create a glowing effect
          brightness = pow(brightness, 5.0);
          // Set the final color with adjusted brightness
          gl_FragColor = vec4(baseColor * brightness, brightness);
      }
  `,
  transparent: true
});

// Add the cube to the scene
const centralCube = new THREE.Mesh(cubeGeometry, cubeShaderMaterial);
scene.add(centralCube);

// Create a point light source positioned with the cube
const dynamicLight = new THREE.PointLight(0xffffff, 20, 40);
dynamicLight.castShadow = true;
scene.add(dynamicLight);

// Load font for text geometries
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    // Define shaders for alphabet and number text
    const alphabetShader = new THREE.ShaderMaterial({
      uniforms: {
          lightPosition: { value: centralCube.position }, // Cube as the light source
          lightIntensity: { value: 2.0 }, // Intensity of the light
          ambientIntensity: { value: ambientLightLevel }, // Ambient light level
          diffuseColor: { value: new THREE.Color(0.5373, 0.8118, 0.9412) }, // Baby blue diffuse color
          specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) }, // White specular highlight
          shininess: { value: 70.0 } // Shininess for a plastic-like specular effect
      },
      vertexShader: `
          // Vertex Shader: Computes surface normals and position
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
              // Transform and normalize the vertex normal
              vNormal = normalize(normalMatrix * normal);
              // Calculate the vertex position in camera space
              vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
              // Project the position to screen space
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `,
      fragmentShader: `
          uniform vec3 lightPosition; // Position of the light source
          uniform float lightIntensity; // Light source intensity
          uniform float ambientIntensity; // Ambient light intensity
          uniform vec3 diffuseColor; // Base color for diffuse lighting
          uniform vec3 specularColor; // Specular highlight color
          uniform float shininess; // Controls the sharpness of the specular highlight

          varying vec3 vNormal; // Interpolated normal vector
          varying vec3 vPosition; // Interpolated position vector

          void main() {
              // Direction from the vertex to the light source
              vec3 lightDirection = normalize(lightPosition - vPosition);
              // Distance from the vertex to the light source
              float dist = length(lightPosition - vPosition);
              // Attenuation factor based on distance
              float attenuation = lightIntensity / (1.0 + 0.1 * dist * dist);

              // Ambient lighting contribution
              vec3 ambient = ambientIntensity * diffuseColor;
              // Diffuse lighting contribution based on the angle of incidence
              float diff = max(dot(vNormal, lightDirection), 0.0);
              vec3 diffuse = diff * diffuseColor * attenuation;

              // Specular lighting contribution based on the viewer's angle
              vec3 viewDirection = normalize(-vPosition);
              vec3 reflectionDirection = reflect(-lightDirection, vNormal);
              float specular = pow(max(dot(viewDirection, reflectionDirection), 0.0), shininess);
              vec3 specularComponent = specular * specularColor * attenuation;

              // Final color combining all components
              gl_FragColor = vec4(ambient + diffuse + specularComponent, 1.0);
          }
      `
  });

  const digitShader = new THREE.ShaderMaterial({
      // Reuse uniforms from the alphabet shader
      uniforms: {
          lightIntensity: { value: 3.0 }, // Higher intensity for metallic shine
          diffuseColor: { value: new THREE.Color(1.0, 0.0, 0.0) }, // Red color
          specularColor: { value: new THREE.Color(1.0, 0.5, 0.5) }, // Softer specular highlights
          shininess: { value: 200.0 } // Sharper metallic specular effect
      },
      vertexShader: alphabetShader.vertexShader,
      fragmentShader: alphabetShader.fragmentShader
  });

    const letterGeometry = new TextGeometry('N', { font, size: 2, height: 0.2 });
    const letterMesh = new THREE.Mesh(letterGeometry, alphabetShader);
    letterMesh.position.set(-4, -0.5, 0);
    scene.add(letterMesh);

    const digitGeometry = new TextGeometry('7', { font, size: 2, height: 0.2 });
    const digitMesh = new THREE.Mesh(digitGeometry, digitShader);
    digitMesh.position.set(2.5, -0.5, 0);
    scene.add(digitMesh);
});

// Camera controls and animation
camera.position.z = 7;
window.addEventListener('keydown', (event) => {
  const moveStep = 0.1; // Define the step size for cube movement

  switch (event.key) {
      case 'W': // Move the cube upward
      case 'w': // Handle lowercase 'w'
          centralCube.position.y += moveStep;
          break;

      case 'S': // Move the cube downward
      case 's': // Handle lowercase 's'
          centralCube.position.y -= moveStep;
          break;
  }
});

// Add event listener for camera movement
window.addEventListener('keydown', (event) => {
  const moveStep = 0.2; // Define the step size for camera movement

  switch (event.key) {
      case 'A': // Move the camera left
      case 'a': // Handle lowercase 'a'
          camera.position.x -= moveStep;
          break;

      case 'D': // Move the camera right
      case 'd': // Handle lowercase 'd'
          camera.position.x += moveStep;
          break;
  }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(time) {
    centralCube.material.uniforms.time.value = time * 0.001;
    dynamicLight.position.copy(centralCube.position);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
