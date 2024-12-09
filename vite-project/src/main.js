import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Create 3D scene with black background
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000');

// Set up perspective camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create WebGL renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Font loader
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Custom shader for letters with dynamic lighting
    const LetterShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: new THREE.Vector3(0, 0, 10) },
            diffuseColor: { value: new THREE.Color(0.5373, 0.8118, 0.9412) }, // Baby Blue for 'N'
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            ambientIntensity: { value: 0.5 }
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
            uniform vec3 diffuseColor;
            uniform vec3 specularColor;
            uniform float ambientIntensity;

            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                vec3 lightDir = normalize(lightPosition - vPosition);
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 ambient = ambientIntensity * diffuseColor;
                vec3 diffuse = diff * diffuseColor;

                gl_FragColor = vec4(ambient + diffuse, 1.0);
            }
        `
    });

    // Custom shader for numbers with red color
    const NumberShader = new THREE.ShaderMaterial({
        uniforms: {
            lightPosition: { value: new THREE.Vector3(0, 0, 10) },
            diffuseColor: { value: new THREE.Color(1.0, 0.0, 0.0) }, // Red for '7'
            specularColor: { value: new THREE.Color(1.0, 1.0, 1.0) },
            ambientIntensity: { value: 0.5 }
        },
        vertexShader: LetterShader.vertexShader,
        fragmentShader: LetterShader.fragmentShader
    });

    // Create 'N' geometry and mesh
    const letterGeometry = new TextGeometry('N', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-4, 0, 0);
    scene.add(letterMesh);

    // Create '7' geometry and mesh
    const numberGeometry = new TextGeometry('7', {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(2, 0, 0);
    scene.add(numberMesh);
});

// Set camera position
camera.position.z = 5;

// Animation loop
function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();