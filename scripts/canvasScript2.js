let scene = new THREE.Scene();
let renderWidth = 500;
let renderHeight = 500;
let camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(renderWidth, renderHeight);
document.body.appendChild(renderer.domElement);

//Geometries here

//Texture loading here
//texture credits to robinwood.com and https://www.toptal.com/designers/subtlepatterns/pool-table/
let cueTexture = new THREE.TextureLoader().load('../images/BallCue.jpg');
let blueBallTexture = new THREE.TextureLoader().load('../images/Ball10.jpg');
let redBallTexture = new THREE.TextureLoader().load('../images/Ball11.jpg');
let greenBallTexture = new THREE.TextureLoader().load('../images/Ball14.jpg');
let billiardsTableTexture = new THREE.TextureLoader().load('../images/pool_table.png');

let blueBall = getSphere(blueBallTexture);
let redBall = getSphere(redBallTexture);
let greenBall = getSphere(greenBallTexture);
let poolTable = getCube(billiardsTableTexture);
let cueBall = getSphere(cueTexture);

camera.position.z = 5;
blueBall.position.set(5, 10, -20);
redBall.position.set(0, 15, -20);
greenBall.position.set(-5, 10, -20);
poolTable.position.set(0, 0, -21);
cueBall.position.set(0, 0, -20);
scene.add(blueBall, redBall, greenBall, poolTable, cueBall);

var animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();

function getCube(texture) {
    var geometry = new THREE.BoxGeometry(40, 40, 0.5);
    var material = new THREE.MeshBasicMaterial({map: texture});
    return new THREE.Mesh(geometry, material);
}

function getSphere(texture) {
    var geometry = new THREE.SphereGeometry(1, 20, 20);
    var material = new THREE.MeshBasicMaterial({map: texture});
    return new THREE.Mesh(geometry, material);
}