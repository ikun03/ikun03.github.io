function main() {
    const scene = new THREE.Scene();
    let width = 600;
    let height = 600;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);


    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    const line = drawLine(new THREE.Vector3(-3, 0, 1), new THREE.Vector3(3, 0, 1), 0x00ff00);
    //My range for x can be between -3 to 3 and along z it is between 2 to -5
    let points = [];
    for (let i = 0; i < 100; i++) {
        points.push(drawPoint(new THREE.Vector3(getRandomArbitrary(-3, 3), 0, getRandomArbitrary(2, -5)), 0xff00ff));
    }
    scene.add(line);
    for (let i = 0; i < points.length; i++) {
        scene.add(points[i]);
    }

    camera.position.z = 4;
    camera.position.y = 4;
    camera.lookAt(new THREE.Vector3(0, -1, -1));

    let animate = function () {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    };

    animate();
}

function drawLine(pointA, pointB, color = 0xffffff) {
    let material = new THREE.LineBasicMaterial({color: color});
    let geometry = new THREE.Geometry();
    geometry.vertices.push(pointA);
    geometry.vertices.push(pointB);
    return new THREE.Line(geometry, material);
}

function drawPoint(pointVector, color = 0xffffff, size = 4) {
    let dotGeometry = new THREE.Geometry();
    dotGeometry.vertices.push(pointVector);
    let dotMaterial = new THREE.PointsMaterial({size: size, sizeAttenuation: false, color: color});
    return new THREE.Points(dotGeometry, dotMaterial);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

main();