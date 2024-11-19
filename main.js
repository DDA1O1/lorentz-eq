import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Basic setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 15, 15); // Adjusted camera position to see all axes
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Create axes lines
const createAxis = (points, color) => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    return new THREE.Line(geometry, material);
};

// X-axis (red)
const xAxis = createAxis([
    new THREE.Vector3(-10, 0, 0),
    new THREE.Vector3(10, 0, 0)
], 0xff0000);
scene.add(xAxis);

// Y-axis (green)
const yAxis = createAxis([
    new THREE.Vector3(0, -10, 0),
    new THREE.Vector3(0, 10, 0)
], 0x00ff00);
scene.add(yAxis);

// Z-axis (blue)
const zAxis = createAxis([
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(0, 0, 10)
], 0x0000ff);
scene.add(zAxis);

// Create arrow heads for all axes
const createArrow = (color) => {
    const geometry = new THREE.ConeGeometry(0.2, 0.5, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    return new THREE.Mesh(geometry, material);
};

// X-axis arrows (red)
const xArrowPos = createArrow(0xff0000);
xArrowPos.position.x = 10;
xArrowPos.rotation.z = -Math.PI / 2;
scene.add(xArrowPos);

const xArrowNeg = createArrow(0xff0000);
xArrowNeg.position.x = -10;
xArrowNeg.rotation.z = Math.PI / 2;
scene.add(xArrowNeg);

// Y-axis arrows (green)
const yArrowPos = createArrow(0x00ff00);
yArrowPos.position.y = 10;
scene.add(yArrowPos);

const yArrowNeg = createArrow(0x00ff00);
yArrowNeg.position.y = -10;
yArrowNeg.rotation.x = Math.PI;
scene.add(yArrowNeg);

// Z-axis arrows (blue)
const zArrowPos = createArrow(0x0000ff);
zArrowPos.position.z = 10;
zArrowPos.rotation.x = Math.PI / 2;
scene.add(zArrowPos);

const zArrowNeg = createArrow(0x0000ff);
zArrowNeg.position.z = -10;
zArrowNeg.rotation.x = -Math.PI / 2;
scene.add(zArrowNeg);

// Add Lorenz attractor with modified parameters
const points = [];
let x = 0.1;
let y = 0;
let z = 0;

// Lorenz parameters
const sigma = 10;
const rho = 28;
const beta = 8/3;
const dt = 0.005;

// Create line geometry for the attractor with modified material
const attractorMaterial = new THREE.LineBasicMaterial({ 
    color: 0xffffff,
    linewidth: 2  // Make line thicker (note: might not work in all browsers)
});
let attractorGeometry = new THREE.BufferGeometry();
const attractorLine = new THREE.Line(attractorGeometry, attractorMaterial);
scene.add(attractorLine);

// Add tick marks and numbers
const fontLoader = new FontLoader();
fontLoader.load('./fonts/helvetiker_regular.typeface.json', function(font) {
    const createTicks = (axis, color) => {
        for(let i = -10; i <= 10; i++) {
            if(i === 0) continue;
            
            let tickGeometry, number, position;
            const tickSize = 0.2;
            const tickMaterial = new THREE.LineBasicMaterial({ color });
            
            switch(axis) {
                case 'x':
                    tickGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(i, -tickSize, 0),
                        new THREE.Vector3(i, tickSize, 0)
                    ]);
                    position = new THREE.Vector3(i - 0.1, -0.5, 0);
                    break;
                case 'y':
                    tickGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(-tickSize, i, 0),
                        new THREE.Vector3(tickSize, i, 0)
                    ]);
                    position = new THREE.Vector3(-0.5, i - 0.1, 0);
                    break;
                case 'z':
                    tickGeometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(0, -tickSize, i),
                        new THREE.Vector3(0, tickSize, i)
                    ]);
                    position = new THREE.Vector3(0, -0.5, i - 0.1);
                    break;
            }
            
            const tick = new THREE.Line(tickGeometry, tickMaterial);
            scene.add(tick);
            
            // Add number
            const textGeometry = new TextGeometry(Math.abs(i).toString(), {
                font: font,
                size: 0.3,
                height: 0.01
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color });
            number = new THREE.Mesh(textGeometry, textMaterial);
            number.position.copy(position);
            scene.add(number);
        }
        
        // Add axis label
        const labelGeometry = new TextGeometry(axis, {
            font: font,
            size: 0.4,
            height: 0.01
        });
        const labelMaterial = new THREE.MeshBasicMaterial({ color });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        
        switch(axis) {
            case 'x':
                label.position.set(10.5, 0, 0);
                break;
            case 'y':
                label.position.set(0, 10.5, 0);
                break;
            case 'z':
                label.position.set(0, 0, 10.5);
                break;
        }
        scene.add(label);
    };
    
    // Create ticks and numbers for all axes
    createTicks('x', 0xff0000);
    createTicks('y', 0x00ff00);
    createTicks('z', 0x0000ff);
});

// Modified animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Calculate next point of Lorenz attractor
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    
    x += dx;
    y += dy;
    z += dz;
    
    // Debug log every 100 frames
    if (points.length % 100 === 0) {
        console.log('Current position:', { x, y, z });
        console.log('Number of points:', points.length);
    }
    
    points.push(new THREE.Vector3(x, y, z).multiplyScalar(0.3));
    
    if (points.length > 5000) {
        points.shift();
    }
    
    // Dispose of old geometry and create new one
    attractorGeometry.dispose();
    attractorGeometry = new THREE.BufferGeometry().setFromPoints(points);
    attractorLine.geometry = attractorGeometry;
    
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
