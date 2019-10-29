let scene;

function drawTriangle(point1, point2, point3) {
    scene.add(getLine(point1.pointPositionVector, point2.pointPositionVector));
    scene.add(getLine(point2.pointPositionVector, point3.pointPositionVector));
    scene.add(getLine(point3.pointPositionVector, point1.pointPositionVector));
}

function main() {
    scene = new THREE.Scene();
    let width = 600;
    let height = 600;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);


    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    //My range for x can be between -3 to 3 and along z it is between 2 to -5
    let points = [];
    for (let i = 0; i < 100; i++) {
        points.push(new Point(getRandomArbitrary(-5, 5), 0, getRandomArbitrary(-5, 5)));
    }

    //Let us create the Super triangle first
    let absoluteMax = 0;
    for (let i = 0; i < points.length; i++) {
        let pointabsx = Math.abs(points[i].x);
        let pointsabz = Math.abs(points[i].z);
        if (pointabsx > absoluteMax) {
            absoluteMax = pointabsx;
        }
        if (pointsabz > absoluteMax) {
            absoluteMax = pointsabz;
        }
    }

    //Let us create the super triangle and add it to the Delaunay Tree
    let point1 = new Point(3 * absoluteMax, 0, 0);
    let point2 = new Point(0, 0, 3 * absoluteMax);
    let point3 = new Point(-3 * absoluteMax, 0, -3 * absoluteMax);
    let pointList = [point1, point2, point3];
    drawTriangle(point1, point2, point3);
    let root = new Node(pointList);
    let tree = new DelaunayTree(root);

    for (let i = 0; i < points.length; i++) {
        scene.add(points[i].pointObject);
    }

    camera.position.x = 0;
    camera.position.z = 7;
    camera.position.y = 7;
    camera.lookAt(new THREE.Vector3(0, -1, -1));

    let animate = function () {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    };

    animate();
}

function getLine(pointA, pointB, color = 0xffffff) {
    let material = new THREE.LineBasicMaterial({color: color, linewidth: 10});
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

class Point {
    constructor(x, y, z, color = 0xffffff) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.pointColor = color;
        this.pointPositionVector = new THREE.Vector3(x, y, z);
        let dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3(x, y, z));
        let dotMaterial = new THREE.PointsMaterial({size: 4, sizeAttenuation: false, color: color});
        this.pointObject = new THREE.Points(dotGeometry, dotMaterial);
    }
}

class Node {
    constructor(triangleVertices) {
        this.vertices = triangleVertices;
        this.incomingNodes = [];
        this.outgoingNodes = [];
        this.isOld = false;
    }
}

class DelaunayTree {
    constructor(rootNode) {
        this.root = rootNode;
    }
}

main();