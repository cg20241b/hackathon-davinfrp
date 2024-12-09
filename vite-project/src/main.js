import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// Create 3D scene and set background to Black
const scene = new THREE.Scene();
scene.background = new THREE.Color('#000000');

const nameLastCharacter = 'N'; 
const studentIdLastDigit = 7;  

// Create 3D text meshes for the character (left) and the number (right)
const fontLoader = new FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    // Alphabet character 
    const letterGeometry = new TextGeometry(nameLastCharacter, {
        font: font,
        size: 2,
        height: 0.2,
    });
    const letterMesh = new THREE.Mesh(letterGeometry, LetterShader);
    letterMesh.position.set(-4, 0, 0);  // Position on the left side
    scene.add(letterMesh);

    // Digit 
    const numberGeometry = new TextGeometry(studentIdLastDigit.toString(), {
        font: font,
        size: 2,
        height: 0.2,
    });
    const numberMesh = new THREE.Mesh(numberGeometry, NumberShader);
    numberMesh.position.set(4, 0, 0);  // Position on the right side
    scene.add(numberMesh);
});
