const keyframes = `
0.0 -58.0 0.0 0.0 1.0 1.0 -1.0 0.0;
1.0  -58.0 0.0 0.0 1.0 1.0 -1.0 30.0;
2.0  8.0 0.0 0.0 1.0 1.0 -1.0 90.0;
3.0  12.0 12.0 12.0 1.0 1.0 -1.0 180.0;
4.0  -58.0 18.0 18.0 1.0 1.0 -1.0 270.0;
5.0  -25.0 18.0 18.0 0.0 1.0 0.0 90.0;
6.0  25.0 18.0 18.0 0.0 0.0 1.0 90.0;
7.0  30.0 12.0 12.0 1.0 0.0 0.0 0.0;
8.0  0.0 0.0 18.0 1.0 0.0 0.0 0.0;
9.0 10.0 1.0 18.0 1.0 0.0 0.0 0.0;`;

function degToRad(number) {
    return number * Math.PI / 180;
}

let keyFrame = 0;
let rotationKeyFrame = 0;
let rotTimer = 0;
let p_1, p_2;
let P_at_u_x, P_at_u_y, P_at_u_z;
let velocity;

//shaders from:
// https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_custom_attributes_particles.html
let vertexShader = "attribute float size;\n" +
    "\t\t\tvarying vec3 vColor;\n" +
    "\t\t\tvoid main() {\n" +
    "\t\t\t\tvColor = color;\n" +
    "\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
    "\t\t\t\tgl_PointSize = size * ( 300.0 / -mvPosition.z );\n" +
    "\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n" +
    "\t\t\t}\n";

let fragmentShader = "\tuniform sampler2D pointTexture;\n" +
    "\t\t\tvarying vec3 vColor;\n" +
    "\t\t\tvoid main() {\n" +
    "\t\t\t\tgl_FragColor = vec4( vColor, 1.0 );\n" +
    "\t\t\t\tgl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );\n" +
    "\t\t\t}";

function toRotnMatrix(quat1) {
    let m = new THREE.Matrix4();
    m.set(
        1 - (2 * quat1._y * quat1._y) - (2 * quat1._z * quat1._z),
        (2 * quat1._x * quat1._y) - (2 * quat1._w * quat1._z),
        (2 * quat1._x * quat1._z) + (2 * quat1._w * quat1._y),
        0,

        (2 * quat1._x * quat1._y) + (2 * quat1._w * quat1._z),
        1 - (2 * quat1._x * quat1._x) - (2 * quat1._z * quat1._z),
        (2 * quat1._y * quat1._z) - (2 * quat1._w * quat1._x),
        0,

        (2 * quat1._x * quat1._z) - (2 * quat1._w * quat1._y),
        (2 * quat1._y * quat1._z) + (2 * quat1._w * quat1._x),
        1 - (2 * quat1._x * quat1._x) - (2 * quat1._y * quat1._y),
        0,

        0, 0, 0, 1
    );
    return m;
}

function lerp(p_2, p_1, u) {
    let P_at_u_x = (p_2.x - p_1.x) * u + p_1.x;
    let P_at_u_y = (p_2.y - p_1.y) * u + p_1.y;
    let P_at_u_z = ((p_2.z) - (p_1.z)) * u + (p_1.z);
    //return {P_at_u_x, P_at_u_y, P_at_u_z};
    return {x: P_at_u_x, y: P_at_u_y, z: P_at_u_z};
}

function drawScene(object, deltaTime, passedTime, keyframesArray) {
    let u = parseFloat("" + (passedTime - keyFrame)).toPrecision(2);
    if (u >= 1) {
        keyFrame += 1;
        u = parseFloat("" + (passedTime - keyFrame)).toPrecision(2);
        console.log(passedTime)
    }

    if (keyFrame < 8) {
        p_1 = keyframesArray[keyFrame];
        p_2 = keyframesArray[keyFrame + 1];
        velocity = new THREE.Vector3(p_2.x / 5, p_2.y / 5, p_2.z / 5);
        velocity.sub(new THREE.Vector3(p_1.x / 5, p_1.y / 5, p_1.z / 5));
        let lerp1 = lerp(p_2, p_1, u);
        P_at_u_x = lerp1.x;
        P_at_u_y = lerp1.y;
        P_at_u_z = lerp1.z;
        P_at_u_y = ((10 * P_at_u_y) / 50);
        P_at_u_x = ((10 * P_at_u_x) / 50);
        P_at_u_z = ((10 * P_at_u_z) / 50);
    }

    rotTimer += deltaTime;
    if (rotTimer >= 1 && rotationKeyFrame < 8) {
        rotationKeyFrame += 1;
        rotTimer = deltaTime;
    }
    let rot_quat_1 = keyframesArray[rotationKeyFrame];
    let rot_quat_2 = keyframesArray[rotationKeyFrame + 1];
    let quat1 = rot_quat_1.quaternion.normalize();
    let quat2 = rot_quat_2.quaternion.normalize();
    let quat3 = new THREE.Quaternion();
    THREE.Quaternion.slerp(quat1, quat2, quat3, rotTimer);
    let rotMat = toRotnMatrix(quat3.normalize());

    //object.setRotationFromMatrix(rotMat);
    object.position.set(P_at_u_x, P_at_u_y, P_at_u_z);
    //object.rotation.setFromRotationMatrix(rotMat)

}

function makeParticles(particles, cometVelocity, cometPosition, generationRate) {
    for (let i = 0; i < generationRate; i++) {
        let b = 204 + Math.floor(Math.random() * 51);
        let g = 100 + Math.floor(Math.random() * 112);
        let r = 0;
        let color = new THREE.Color("rgb(" + r + "," + g + "," + b + ")");


        //velocity
        let velocity = cometVelocity.clone();
        velocity.negate();
        //let us apply along x
        let axis = new THREE.Vector3(1, 0, 0);
        let angle = degToRad(Math.random() * 25);
        velocity.applyAxisAngle(axis, angle);

        //let us apply along y
        axis = new THREE.Vector3(0, 1, 0);
        angle = degToRad(Math.random() * 25);
        velocity.applyAxisAngle(axis, angle);

        //let us apply along z
        axis = new THREE.Vector3(0, 0, 1);
        angle = degToRad(Math.random() * 25);
        velocity.applyAxisAngle(axis, angle);


        //mass
        let mass = Math.random() * 5;

        let size = mass * 0.1;

        let lifetime = Math.random();

        //position
        let x = cometPosition.x - 1 + (Math.random() * 2);
        let y = cometPosition.y - 1 + (Math.random() * 2);
        let z = cometPosition.z - 1 + (Math.random() * 2);

        particles.push(new Particle(x, y, z, velocity, size, color, lifetime, mass));
    }
}

function addParticles(particles, scene) {
    let uniforms = {
        pointTexture: {value: new THREE.TextureLoader().load("textures/spark1.png")}
    };

    let shaderMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });

    var radius = 5;
    let geometry = new THREE.BufferGeometry();
    var positions = [];
    var colors = [];
    var sizes = [];
    for (var i = 0; i < particles.length; i++) {
        positions.push(particles[i].x);
        positions.push(particles[i].y);
        positions.push(particles[i].z);
        let color = particles[i].color;
        colors.push(color.r, color.g, color.b);
        sizes.push(particles[i].size)
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    let particleSystem = new THREE.Points(geometry, shaderMat);

    scene.add(particleSystem);
}

function updateParticles(delta, particles) {
    for (let i = 0; i < particles.length; i++) {
        particles[i].x = particles[i].x + (particles[i].velocity.x * delta);
        particles[i].y = particles[i].y + (particles[i].velocity.y * delta);
        particles[i].z = particles[i].z + (particles[i].velocity.z * delta);
        particles[i].timeElapsed(delta);
    }

    for (let i = 0; i < particles.length; i++) {
        if (particles[i].lifetime <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function main() {
    let width = 800;
    let height = 800;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 500);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    var light = new THREE.PointLight(0xffffff);

    light.position.set(0, 0, 5).normalize();
    scene.add(light);

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshPhongMaterial({color: 0x0000ff});
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    var keyframeLines = keyframes.replace("\n", "").split(";");
    var keyframesArray = [];
    for (let i = 0; i < 10; i++) {
        let values = keyframeLines[i].replace("  ", " ").split(" ");
        keyframesArray.push({
            t: values[0],
            x: parseFloat(values[1]),
            y: parseFloat(values[2]),
            z: (parseFloat(values[3]) - 40),
            xa: parseFloat(values[4]),
            ya: parseFloat(values[5]),
            za: parseFloat(values[6]),
            theta: parseFloat(values[7]),
        });
    }

    for (let j = 0; j < 10; j++) {
        let keyframeValue = keyframesArray[j];
        let quaternion = new THREE.Quaternion();
        let axis = new THREE.Vector3(keyframeValue.xa, keyframeValue.ya, keyframeValue.za).normalize();
        let angle = degToRad(keyframeValue.theta);
        quaternion.setFromAxisAngle(
            axis,
            angle);
        keyframesArray[j].quaternion = quaternion;
    }

    /*//https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/spark1.png
    let uniforms = {
        pointTexture: {value: new THREE.TextureLoader().load("textures/spark1.png")}
    };

    let shaderMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true
    });

    var radius = 5;
    geometry = new THREE.BufferGeometry();
    var positions = [];
    var colors = [];
    var sizes = [];
    var color = new THREE.Color();
    for (var i = 0; i < 100; i++) {
        positions.push((Math.random() * 2 - 1) * radius);
        positions.push((Math.random() * 2 - 1) * radius);
        positions.push((Math.random() * 2 - 1) * radius);
        color.setHSL(i / 100, 1.0, 0.5);
        colors.push(color.r, color.g, color.b);
        sizes.push(0.5);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    let particleSystem = new THREE.Points(geometry, shaderMat);

    scene.add(particleSystem);*/


    camera.position.z = 5;
    camera.lookAt(0, 0, 0);

    let then = 0;
    let passedTime = 0;
    let particles = [];
    let generationRate = 25;
    let deleteTime = 0.05;
    let deleteCounter = 0;

    function animate(now) {
        if (deleteCounter > deleteTime) {
            for (let i = 0; i < scene.children.length; i++) {
                if (scene.children[i].type === "Points") {
                    scene.remove(scene.children[i]);
                    deleteCounter = 0;
                }
            }
        }

        now *= 0.001; //convert to seconds
        const deltaTime = now - then;
        deleteCounter += deltaTime;
        passedTime += deltaTime;
        then = now;
        scene.add(cube);
        drawScene(cube, deltaTime, passedTime, keyframesArray);
        updateParticles(deltaTime, particles);
        makeParticles(particles, velocity, cube.position, generationRate);
        addParticles(particles, scene);
        requestAnimationFrame(animate);

        renderer.render(scene, camera);

    }

    requestAnimationFrame(animate);

}

class Particle {

    constructor(x, y, z, velocityVector, size, color, lifetime, mass) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.velocity = velocityVector;
        this.size = size;
        this.color = color;
        this.lifetime = lifetime;
        this.mass = mass;
    }

    timeElapsed(delta) {
        this.lifetime -= delta;
    }
}

main();