let scene = new THREE.Scene();
let renderWidth = 500;
let renderHeight = 500;
let camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWidth, renderHeight);
document.body.appendChild(renderer.domElement);
let sphere = getSphere(0x00ff00);
let sphere2 = getSphere(0xff0000);
let sphere3 = getSphere(0x0000ff);
let poolTable = getCube(0x226622);

camera.position.z = 5;
sphere.position.set(5, 0, -20);
sphere2.position.set(0, 0, -20);
sphere3.position.set(-5, 0, -20);
poolTable.position.set(0, 0, -21);
scene.add(sphere, sphere2, sphere3, poolTable);

var animate = function () {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();

function getCube(cubeColor) {
    var geometry = new THREE.BoxGeometry(40, 40, 0.5);
    var material = new THREE.MeshBasicMaterial({color: cubeColor});
    return new THREE.Mesh(geometry, material);
}

function getSphere(sphereColor) {
    var geometry = new THREE.SphereGeometry(1, 20, 20);
    var material = new THREE.MeshBasicMaterial({color: sphereColor});
    return new THREE.Mesh(geometry, material);
}