import {Vertex, HalfEdge, Face, DCEL} from "./classes/dcel.js";

let scene;

function drawTriangle(point1, point2, point3) {
    scene.add(getLine(point1.pointPositionVector, point2.pointPositionVector));
    scene.add(getLine(point2.pointPositionVector, point3.pointPositionVector));
    scene.add(getLine(point3.pointPositionVector, point1.pointPositionVector));
}

function initializeDCEL(point1, point2, point3) {
    let vertex1 = new Vertex("A", point1.x, point1.y, point1.z);
    let vertex2 = new Vertex("B", point2.x, point2.y, point2.z);
    let vertex3 = new Vertex("C", point3.x, point3.y, point3.z);

    let halfedge1 = new HalfEdge();
    let halfedge2 = new HalfEdge();
    let halfedge3 = new HalfEdge();

    halfedge1.edgeName = "AB";
    halfedge1.originVertex = vertex1;
    halfedge1.targetVertex = vertex2;
    halfedge1.nextHalfEdge = halfedge2;
    halfedge1.previousHalfEdge = halfedge3;

    halfedge2.edgeName = "BC";
    halfedge2.originVertex = vertex2;
    halfedge2.targetVertex = vertex3;
    halfedge2.nextHalfEdge = halfedge3;
    halfedge2.previousHalfEdge = halfedge1;

    halfedge3.edgeName = "CA";
    halfedge3.originVertex = vertex3;
    halfedge3.targetVertex = vertex1;
    halfedge3.nextHalfEdge = halfedge1;
    halfedge3.previousHalfEdge = halfedge2;

    let face = new Face();
    face.faceName = "ABC";
    face.edge = halfedge1;

    halfedge1.leftSideFace = face;
    halfedge2.leftSideFace = face;
    halfedge3.leftSideFace = face;

    vertex1.leavingHalfEdges.push(halfedge1);
    vertex2.leavingHalfEdges.push(halfedge2);
    vertex3.leavingHalfEdges.push(halfedge3);

    return new DCEL([vertex1, vertex2, vertex3], [halfedge1, halfedge2, halfedge3], [face]);
}

function getVertex(point, pointCounter) {
    return new Vertex("P" + pointCounter, point.x, point.y, point.z);
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
        points.push(new Point(getRandomArbitrary(-100, 100), 0, getRandomArbitrary(-100, 100)));
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
    //drawTriangle(point1, point2, point3);

    // We have created the Delaunay tree here and initialized it with
    // the root node
    // let root = new Node(pointList);
    // let tree = new DelaunayTree(root);
    // addPointToTree(tree, points.pop());

    // Add the points to the scene
    for (let i = 0; i < points.length; i++) {
        scene.add(points[i].pointObject);
    }

    // We add the points to the triangulation one by one
    let dcel = initializeDCEL(point1, point2, point3);
    let pointCounter = 0;

    camera.position.x = 0;
    camera.position.z = 100;
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(0, -1, -1));

    let then = 0;
    let time = 0;

    function animate(now) {

        now *= 0.001;  // make it seconds

        const delta = now - then;
        then = now;
        time += delta;

        if (time > 1 && points.length !== 0) {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
            for (let i = 0; i < points.length; i++) {
                scene.add(points[i].pointObject);
            }

            dcel.addVertex(getVertex(points.pop(), pointCounter++));
            for (let [key, value] of dcel.faces) {
                let vertexA = value.edge.originVertex;
                let vertexB = value.edge.targetVertex;
                let vertexC = value.edge.nextHalfEdge.targetVertex;

                drawTriangle(new Point(vertexA.x, vertexA.y, vertexA.z),
                    new Point(vertexB.x, vertexB.y, vertexB.z),
                    new Point(vertexC.x, vertexC.y, vertexC.z));

            }
            time = 0;
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
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
        this.nodeLevel = -1;
    }
}

class DelaunayTree {
    constructor(rootNode) {
        this.root = rootNode;
        this.root.nodeLevel = 0;
    }
}

function isPointInsideTriangle(triangleNode, point) {
    let A = triangleNode.vertices[0];
    let B = triangleNode.vertices[1];
    let C = triangleNode.vertices[2];

    let w1 = (A.x * (C.y - A.y) + (point.y - A.y) * (C.x - A.x) - point.x * (C.y - A.y)) /
        ((B.y - A.y) * (C.x - A.x) - (B.x - A.x) * (C.y - A.y));
    let w2 = (point.y - A.y - w1 * (B.y - A.y)) / (C.y - A.y);
    return w1 >= 0 && w2 >= 0 && (w1 + w2) <= 1;

}

function addPointToTree(tree, point) {
    let isPointAdded = false;
    let nodes = [tree.root];
    while (!isPointAdded) {
        let triangleNode = nodes.pop();
        if (isPointInsideTriangle(triangleNode, point)) {
            if (!triangleNode.isOld) {
                isPointAdded = true;
            } else {
                nodes = triangleNode.incomingNodes;
            }
        }
    }
}


main();