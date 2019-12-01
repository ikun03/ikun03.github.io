import {Vertex, HalfEdge, Face, DCEL} from "./classes/dcel.js";

let scene;
// Initial state
let scrollPos = 0;
var keyMap = new Map();

/**
 * Draw the triangle frame
 * @param point1
 * @param point2
 * @param point3
 */
function drawTriangleWireframe(point1, point2, point3) {
    scene.add(getLine(point1.pointPositionVector, point2.pointPositionVector));
    scene.add(getLine(point2.pointPositionVector, point3.pointPositionVector));
    scene.add(getLine(point3.pointPositionVector, point1.pointPositionVector));
}

/**
 *Initialize the DCEL data structure
 * @param point1
 * @param point2
 * @param point3
 * @returns {DCEL}
 */
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
    face.faceName = "A,B,C";
    face.edge = halfedge1;

    halfedge1.leftSideFace = face;
    halfedge2.leftSideFace = face;
    halfedge3.leftSideFace = face;

    vertex1.leavingHalfEdges.push(halfedge1);
    vertex2.leavingHalfEdges.push(halfedge2);
    vertex3.leavingHalfEdges.push(halfedge3);

    return new DCEL([vertex1, vertex2, vertex3], [halfedge1, halfedge2, halfedge3], [face]);
}

/**
 * Get the vertex object from the point and the point number
 * @param point
 * @param pointNumber
 * @returns {Vertex}
 */
function getVertex(point, pointNumber) {
    return new Vertex("P" + pointNumber, point.x, point.y, point.z);
}

/**
 * Add text as a geometry to the scene
 * @param text
 * @param camera
 * @param position
 * @param scene
 */
function getTextGeometry(text, camera, position, scene) {
    let textGeo;
    let textObject;
    let loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        textGeo = new THREE.TextGeometry(text, {
            font: font,
            size: 80,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        });
        let color = new THREE.Color();
        color.setRGB(255, 250, 250);
        let textMaterial = new THREE.MeshBasicMaterial({color: color});
        textObject = new THREE.Mesh(textGeo, textMaterial);
        textObject.position.set(position.x, position.y, position.z);
        textObject.scale.set(0.04, 0.04, 0.04);
        textObject.lookAt(camera.position);
        scene.add(textObject);
    });
}

/**
 * Convert degree to radian
 * @param number
 * @returns {number}
 */
function degToRad(number) {
    return number * Math.PI / 180;
}

/**
 * The class is a Gaussian which we use to create the mountains or valleys
 */
class Gaussian {
    //TODO: Standardize this
    constructor(mountain, height, sigmaX, sigmaZ, centerX, centerZ, xMax, zMax) {
        this.M = mountain;
        this.h = height;
        this.sigX = sigmaX;
        this.sigZ = sigmaZ;
        this.centX = centerX / xMax;
        this.xCoord = centerX;
        this.zCoord = centerZ;
        this.xMax = xMax;
        this.zMax = zMax;
        this.centZ = centerZ / zMax;
        this.height = height;
    }

    /**
     * Get the height of x and z
     * @param x
     * @param z
     * @returns {number}
     */
    getHeight(x, z) {
        x = x / this.xMax;
        z = z / this.zMax;
        let power = Math.pow(-1, this.M);
        let xDiff = Math.pow(x - this.centX, 2);
        let zDiff = Math.pow(z - this.centZ, 2);
        let val = (-((this.sigX * xDiff) + (this.sigZ * zDiff)));
        let number = power * Math.exp(val);
        return number * -this.height;
    }

    static getRandomGaussian(mountain, hMax, xMax, zMax, centerX, centerZ) {
        if (mountain === 1) {
            return new Gaussian(mountain, getRandomArbitrary(hMax / 2, hMax), getRandomArbitrary(8, 12), getRandomArbitrary(8, 12), centerX, centerZ, xMax, zMax);
        } else {
            return new Gaussian(mountain, getRandomArbitrary(hMax / 2, hMax), getRandomArbitrary(5, 8), getRandomArbitrary(5, 8), centerX, centerZ, xMax, zMax);
        }
    }
}

function handleCameraKeyPress(camera) {
    /*document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case "ArrowDown":
            case "S":
            case "s":
                camera.translateZ(5);
                //camera.position.set(camera.position.x, camera.position.y, camera.position.z + 2);
                break;
            case "ArrowUp":
            case "W":
            case "w":
                camera.translateZ(-5);
                //camera.position.set(camera.position.x, camera.position.y, camera.position.z - 2);
                break;
            case "ArrowLeft":
            case "A":
            case "a":
                camera.rotateY(degToRad(5));
                //camera.position.set(camera.position.x - 2, camera.position.y, camera.position.z);
                break;
            case "ArrowRight":
            case "D":
            case "d":
                camera.rotateY(degToRad(-5));
                //camera.position.set(camera.position.x + 2, camera.position.y, camera.position.z);
                break;
            case "Q":
            case "q":
                camera.rotateZ(degToRad(5));
                break;
            case "E":
            case "e":
                camera.rotateZ(degToRad(-5));
                break;

        }
    });*/

    document.addEventListener('keydown', function (event) {
        keyMap.set(event.key, true);
    });

    document.addEventListener('keyup', function (event) {
        keyMap.set(event.key, false);
    });

    // adding scroll event
    /*document.addEventListener('wheel', function (event) {
        if (event.deltaY > 0) {
            /!*let vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            vector.normalize();
            let yDiff = camera.position.y;
            vector.multiplyScalar(yDiff / 2);
            vector.add(camera.position);
            camera.position.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
            camera.lookAt(vector);*!/
            camera.rotateX(degToRad(1));
        } else {
            /!*let vector = new THREE.Vector3(0, 0, -1);
            vector.applyQuaternion(camera.quaternion);
            vector.normalize();
            let yDiff = camera.position.y;
            vector.multiplyScalar(yDiff / 2);
            vector.add(camera.position);
            camera.position.set(camera.position.x, camera.position.y + 0.5, camera.position.z);
            camera.lookAt(vector);*!/
            camera.rotateX(degToRad(-1));
        }
        return false;
    }, false);*/
}


function handleCameraControl(camera) {
    for (let [key, value] of keyMap) {
        if (value) {
            switch (key) {
                case "S":
                case "s":
                    camera.translateZ(2);
                    //camera.position.set(camera.position.x, camera.position.y, camera.position.z + 2);
                    break;
                case "W":
                case "w":
                    camera.translateZ(-2);
                    //camera.position.set(camera.position.x, camera.position.y, camera.position.z - 2);
                    break;
                case "ArrowLeft":
                case "A":
                case "a":
                    camera.rotateY(degToRad(2));
                    //camera.position.set(camera.position.x - 2, camera.position.y, camera.position.z);
                    break;
                case "ArrowRight":
                case "D":
                case "d":
                    camera.rotateY(degToRad(-2));
                    //camera.position.set(camera.position.x + 2, camera.position.y, camera.position.z);
                    break;
                case "Q":
                case "q":
                    camera.rotateZ(degToRad(2));
                    break;
                case "E":
                case "e":
                    camera.rotateZ(degToRad(-2));
                    break;
                case "ArrowDown":
                    camera.rotateX(degToRad(-2));
                    break;
                case "ArrowUp":
                    camera.rotateX(degToRad(2));
                    break;
            }
        }
    }
}

function drawTriangleFaces(dcel, scene, heightColorTable, hmax, baseVal) {
    for (let [key, value] of dcel.faces) {
        if (!value.isFaceOld) {
            if (value.faceName.includes("A") || value.faceName.includes("B") || value.faceName.includes("C")) {
                continue;
            }
            let faceList = value.faceName.split(",");
            let A = dcel.vertices.get(faceList[0]);
            let C = dcel.vertices.get(faceList[1]);
            let B = dcel.vertices.get(faceList[2]);
            let Avector = new THREE.Vector3(A.x, A.y, A.z);
            let Bvector = new THREE.Vector3(B.x, B.y, B.z);
            let Cvector = new THREE.Vector3(C.x, C.y, C.z);
            let minY = Math.min(A.y, B.y, C.y) + baseVal;
            let color;
            color = heightColorTable[Math.floor((minY / hmax) * 10)];
            scene.add(drawTriangle(Avector, Bvector, Cvector, color));
        }
    }
}

function drawTriangle(point1, point2, point3, color) {
    var geometry = new THREE.Geometry();
    geometry.vertices = [point1, point2, point3];
    geometry.faces = [new THREE.Face3(0, 1, 2)];
    let material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
    return new THREE.Mesh(geometry, material);
}

function getDistance(xCoord, zCoord, x, z) {
    return Math.sqrt(Math.pow(x - xCoord, 2) + Math.pow(z - zCoord, 2));
}

function applyGaussianToPoints(dcel, gaussianPoints) {
    for (let [key, value] of dcel.vertices) {
        let minDistGaussian = 0;
        let minDist = 20000;
        for (let i = 0; i < gaussianPoints.length; i++) {
            let distance = getDistance(gaussianPoints[i].xCoord, gaussianPoints[i].zCoord, value.x, value.z);
            if (distance < minDist) {
                minDist = distance;
                minDistGaussian = i;
            }
        }
        dcel.vertices.get(key).y = gaussianPoints[minDistGaussian].getHeight(value.x, value.z);
    }
}

function drawMountainsOrValleys(dcel, noOfMountains, noOfValleys, hMax, vMin, xMax, zMax, mountainPoints, valleyPoints) {
    let gaussianPoints = [];
    for (let i = 0; i < noOfMountains; i++) {
        gaussianPoints.push(Gaussian.getRandomGaussian(1, hMax, xMax, zMax, mountainPoints[i].x, mountainPoints[i].z));
    }
    for (let i = 0; i < noOfValleys; i++) {
        gaussianPoints.push(Gaussian.getRandomGaussian(0, vMin, xMax, zMax, valleyPoints[i].x, valleyPoints[i].z));
    }
    applyGaussianToPoints(dcel, gaussianPoints);
}

function main() {
    scene = new THREE.Scene();
    let width = 1000;
    let height = 1000;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);
    renderer.setSize(width, height);
    renderer.domElement.style.visibility = "hidden";
    let xMax = 600;
    let zMax = 600;
    let pointCount;
    let maxMountainHeight;
    let noOfMountains;
    let noOfValleys;
    let minValleyDepth;

    let heightColorTable = [
            //seaweed color
            new THREE.Color(0x006600),
            //grass green
            new THREE.Color(0x4C9900),
            //lighter grass green
            new THREE.Color(0x4C9900),
            //dirt green color
            new THREE.Color(0x608963),
            //darker dirt brown
            new THREE.Color(0x5D432C),
            //beaver brown
            new THREE.Color(0x78675D),
            //Almond color
            new THREE.Color(0xEFDECD),
            //Dark gray
            new THREE.Color(0xA5A5A5),
            //Smoke white
            new THREE.Color(0xF5F5F5),
            //White
            new THREE.Color(0xF9F9F9),
        ]
    ;


    //My range for x can be between -3 to 3 and along z it is between 2 to -5
    let points = [];
    let pointCounter;
    let pointNames = [];
    let counter = 0;
    let isFinalFaceDrawn = false;
    let dcel;
    let notPressed = false;

    document.getElementById("generateBtn").addEventListener("click", function () {
        xMax = parseInt(document.getElementById("xMax").value);
        zMax = parseInt(document.getElementById("zMax").value);
        noOfMountains = parseInt(document.getElementById("mountains").value);
        maxMountainHeight = parseInt(document.getElementById("maxHeight").value);
        pointCount = parseInt(document.getElementById("pointCt").value);
        noOfValleys = parseInt(document.getElementById("valleys").value);
        minValleyDepth = parseInt(document.getElementById("minDepth").value);
        renderer.domElement.style.visibility = "visible";

        for (let i = 0; i < pointCount; i++) {
            points.push(new Point(getRandomArbitrary(0, xMax), 0, getRandomArbitrary(0, zMax)));
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

        // Add the points to the scene
        for (let i = 0; i < points.length; i++) {
            scene.add(points[i].pointObject);
        }
        dcel = initializeDCEL(point1, point2, point3);
        pointCounter = pointCount;
        notPressed = true;
        // We add the points to the triangulation one by one


        camera.position.x = 0;
        camera.position.z = 0;
        camera.position.y = 100;
        camera.lookAt(150, 0, 0);
        handleCameraKeyPress(camera);

        let mountainPoints = [];
        for (let i = 0; i < noOfMountains; i++) {
            mountainPoints.push(points[parseInt("" + getRandomArbitrary(0, points.length))]);
        }

        let valleyPoints = [];
        for (let i = 0; i < noOfValleys; i++) {
            let point;
            do {
                point = points[parseInt("" + getRandomArbitrary(0, points.length))];
            } while (point in mountainPoints);
            valleyPoints.push(point);
        }

        let then = 0;
        let time = 0;

        function animate(now) {

            now *= 0.001;  // make it seconds

            const delta = now - then;
            then = now;
            time += delta;

            if (time > 0.05 && counter < points.length) {
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }
                for (let i = counter; i < points.length; i++) {
                    scene.add(points[i].pointObject);
                    //getTextGeometry(pointNames[i], camera, points[i].pointPositionVector, scene);
                }

                let vertex = getVertex(points[counter], pointCounter++);
                pointNames.push(vertex.vertexName);
                dcel.addVertex(vertex);
                counter++;
                for (let [key, value] of dcel.faces) {
                    if (value.isFaceOld) {
                        continue;
                    }
                    let vertexA = value.edge.originVertex;
                    let vertexB = value.edge.targetVertex;
                    let vertexC = value.edge.nextHalfEdge.targetVertex;

                    drawTriangleWireframe(new Point(vertexA.x, vertexA.y, vertexA.z),
                        new Point(vertexB.x, vertexB.y, vertexB.z),
                        new Point(vertexC.x, vertexC.y, vertexC.z));

                }
                time = 0;
            }
            if (counter === points.length && !isFinalFaceDrawn) {
                isFinalFaceDrawn = true;
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }
                drawMountainsOrValleys(dcel, noOfMountains, noOfValleys, maxMountainHeight, minValleyDepth, xMax, zMax, mountainPoints, valleyPoints);
                drawTriangleFaces(dcel, scene, heightColorTable, maxMountainHeight + minValleyDepth, minValleyDepth);

            }

            handleCameraControl(camera);
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }

        requestAnimationFrame(animate)
    });


}

function getLine(pointA, pointB, color = 0xffffff) {
    let material = new THREE.LineBasicMaterial({color: color, linewidth: 10});
    let geometry = new THREE.Geometry();
    geometry.vertices.push(pointA);
    geometry.vertices.push(pointB);
    return new THREE.Line(geometry, material);
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


main();