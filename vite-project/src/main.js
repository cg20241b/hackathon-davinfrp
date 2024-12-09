import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Create 3D scene and set background to Black
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000');

// Set up the WebGL renderer to render the scene and append it to the HTML document
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up the camera for perspective with a specific aspect ratio and view distance
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Variables for setting ambient light intensity
const ambientIntensity = 0.200 + 0.137;  // Ambient light intensity

// Create geometry and material for cube, using custom shaders for visual effects
const cubeSize = 1;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

const cubeMaterial = new THREE.ShaderMaterial({
  uniforms: {
      time: { value: 0.0 } // Time to change effects dynamically
  },
  vertexShader: `
      void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Shader for object position
      }
  `,
  fragmentShader: `
      uniform float time;
      void main() {
          vec3 color = vec3(1.0, 1.0, 1.0); // Pure white color
          float intensity = max(0.7 + sin(time * 1.0) * 0.3, 1.0); // Only show maximum intensity
          intensity = pow(intensity, 4.0); // Smooth out the glow
          gl_FragColor = vec4(color * intensity, intensity);  // Final color with glow
      }
  `,
  transparent: true
});

// Add the cube to the scene
const centralCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(centralCube);

// Add a point light with strong light effects and shadows
const pointLight = new THREE.PointLight(0xffffff, 20, 40);  // Create a light point with color, intensity, and distance
pointLight.castShadow = true; // Enable shadow from the point light
scene.add(pointLight);

// Font loader
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Shader for letters with dynamic lighting and specular plastic (medium shininess)
    const LetterShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: centralCube.position },
            lightIntensity: { value: 2.0 },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color(0.5373, 0.8118, 0.9412) }, // Baby blue color for the letter
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 70.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float lightIntensity;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;
    
            varying vec3 vNormal;
            varying vec3 vPosition;
    
            void main() {
                // Calculate lighting based on light position and intensity
                vec3 lightDir = normalize(lightPosition - vPosition);
                float distance = length(lightPosition - vPosition);
                float attenuation = lightIntensity / (1.0 + 0.1 * distance * distance);
    
                // Ambient component
                vec3 ambient = ambientIntensity * diffuseColor;
    
                // Diffuse component (using normal vector and light direction)
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor * attenuation;
    
                // Specular component (using reflection vector and view direction)
                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor * attenuation;
    
                gl_FragColor = vec4(ambient + diffuse + specular, 1.0); // Final color
            }
        `
    });    

    // Shader for numbers with brighter lighting and specular metal (high shininess and medium intensity)
    const NumberShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: centralCube.position },
            lightIntensity: { value: 3.0 },
            ambientIntensity: { value: ambientIntensity },
            diffuseColor: { value: new THREE.Color(1.0, 0.0, 0.0) }, // Red color for the number
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            shininess: { value: 200.0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);  // Shader for number position
            }
        `,
        fragmentShader: `
            uniform vec3 lightPosition;
            uniform float lightIntensity;
            uniform float ambientIntensity;
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float shininess;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                // calculate the lighting for the number
                vec3 lightDir = normalize(lightPosition - vPosition);
                float distance = length(lightPosition - vPosition);
                float attenuation = lightIntensity / (1.0 + 0.1 * distance * distance);

                vec3 ambient = ambientIntensity * diffuseColor;
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse = diff * diffuseColor * attenuation;

                vec3 viewDir = normalize(-vPosition);
                vec3 reflectDir = reflect(-lightDir, vNormal);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
                vec3 specular = spec * specularColor * attenuation;

                gl_FragColor = vec4(ambient + diffuse + specular, 1.0);  // Final color
            }
        `
    });

    // Create geometry and mesh for the letter "N" with letter shader
    const letterGeometry = new TextGeometry('N', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-4, -0.5, 0);
    scene.add(letterMesh);

    // Create geometry and mesh for the number "7" with number shader
    const numberGeometry = new TextGeometry('7', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(2.5, -0.5, 0); 
    scene.add(numberMesh);
});

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


// Set camera position on the z-axis
camera.position.z = 7;

// Animation function to render the scene continuously
function animate(time) {    
    // Update cube shader time uniform
    if (centralCube.material.uniforms) {
        centralCube.material.uniforms.time.value = time * 0.001;
    }

    pointLight.position.copy(centralCube.position);
    
    renderer.render(scene, camera);  // Render scene with camera
    requestAnimationFrame(animate);  // Call animate function repeatedly
}
animate();

// Event listener to resize renderer and camera when display is resized
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();  // Update camera projection
    renderer.setSize(window.innerWidth, window.innerHeight);  // Set renderer size based on display
});