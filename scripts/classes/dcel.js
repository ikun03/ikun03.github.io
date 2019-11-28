/**
 * The following is a javascript implementation of the Doubly Connected Edge List data structure by me: Kunal Shitut
 */
export class DCEL {
    constructor(initialVertices, initialHalfEdges, initialFaces) {
        this.vertices = new Map();
        this.faces = new Map();
        this.halfedges = new Map();
        for (let i = 0; i < initialVertices.length; i++) {
            this.vertices.set(initialVertices[i].vertexName, initialVertices[i]);
        }

        for (let i = 0; i < initialHalfEdges.length; i++) {
            this.halfedges.set(initialHalfEdges[i].edgeName, initialHalfEdges[i]);
        }
        for (let i = 0; i < initialFaces.length; i++) {
            this.faces.set(initialFaces[i].faceName, initialFaces[i]);
        }

        this.superFace = initialFaces[0];
    }

    isPointInsideTriangleFace(face, point) {
        let faceList = face.faceName.split(",");
        let A = this.vertices.get(faceList[0]);
        let C = this.vertices.get(faceList[1]);
        let B = this.vertices.get(faceList[2]);

        let denominator = (B.z - A.z) * (C.x - A.x) - (B.x - A.x) * (C.z - A.z);
        let w1 = (A.x * (C.z - A.z) + (point.z - A.z) * (C.x - A.x) - point.x * (C.z - A.z)) /
            denominator;
        let w2 = (point.z - A.z - w1 * (B.z - A.z)) / (C.z - A.z);
        return w1 > 0 && w2 > 0 && (w1 + w2) < 1;
    }

    addVertex(vertex) {
        //Find the face where the vertex is inserted
        let vertexFace = this.superFace;
        // for (let [key, value] of this.faces) {
        //     if (this.isPointInsideTriangleFace(value, vertex)) {
        //         vertexFace = value;
        //         break;
        //     }
        // }
        while (vertexFace.isFaceOld) {
            let children = vertexFace.childFaces;
            let isChild = false;
            for (let i = 0; i < children.length; i++) {
                if (this.isPointInsideTriangleFace(children[i], vertex)) {
                    vertexFace = children[i];
                    isChild = true;
                    break;
                }
            }
            if (!isChild) {
                return;
            }
        }
        //Create and add the new halfedges to the list
        let edges = [vertexFace.edge, vertexFace.edge.nextHalfEdge, vertexFace.edge.previousHalfEdge];
        let vertices = [vertexFace.edge.originVertex, vertexFace.edge.targetVertex, vertexFace.edge.nextHalfEdge.targetVertex];

        let halfEdge1 = new HalfEdge();
        let halfEdge2 = new HalfEdge();
        let halfEdge3 = new HalfEdge();
        let halfEdge4 = new HalfEdge();
        let halfEdge5 = new HalfEdge();
        let halfEdge6 = new HalfEdge();

        halfEdge1.edgeName = vertices[0].vertexName + vertex.vertexName;
        halfEdge1.originVertex = vertices[0];
        halfEdge1.targetVertex = vertex;
        //halfEdge1.leftSideFace = null;
        halfEdge1.twin = halfEdge2;
        halfEdge1.nextHalfEdge = halfEdge6;
        halfEdge1.previousHalfEdge = edges[2];

        halfEdge2.edgeName = vertex.vertexName + vertices[0].vertexName;
        halfEdge2.originVertex = vertex;
        halfEdge2.targetVertex = vertices[0];
        //halfEdge2.leftSideFace = null;
        halfEdge2.twin = halfEdge1;
        halfEdge2.nextHalfEdge = edges[0];
        halfEdge2.previousHalfEdge = halfEdge3;

        halfEdge3.edgeName = vertices[1].vertexName + vertex.vertexName;
        halfEdge3.originVertex = vertices[1];
        halfEdge3.targetVertex = vertex;
        //halfEdge3.leftSideFace = null;
        halfEdge3.twin = halfEdge4;
        halfEdge3.nextHalfEdge = halfEdge2;
        halfEdge3.previousHalfEdge = edges[1];

        halfEdge4.edgeName = vertex.vertexName + vertices[1].vertexName;
        halfEdge4.originVertex = vertex;
        halfEdge4.targetVertex = vertices[1];
        //halfEdge4.leftSideFace = null;
        halfEdge4.twin = halfEdge3;
        halfEdge4.nextHalfEdge = edges[1];
        halfEdge4.previousHalfEdge = halfEdge5;

        halfEdge5.edgeName = vertices[2].vertexName + vertex.vertexName;
        halfEdge5.originVertex = vertices[2];
        halfEdge5.targetVertex = vertex;
        //halfEdge5.leftSideFace = null;
        halfEdge5.twin = halfEdge6;
        halfEdge5.nextHalfEdge = halfEdge4;
        halfEdge5.previousHalfEdge = edges[1];

        halfEdge6.edgeName = vertex.vertexName + vertices[2].vertexName;
        halfEdge6.originVertex = vertex;
        halfEdge6.targetVertex = vertices[2];
        //halfEdge6.leftSideFace = null;
        halfEdge6.twin = halfEdge5;
        halfEdge6.nextHalfEdge = edges[2];
        halfEdge6.previousHalfEdge = halfEdge1;


        //Then split the faces
        let face1 = new Face();
        let face2 = new Face();
        let face3 = new Face();

        //Add the new edges as leaving edges to the vertices
        vertices[0].leavingHalfEdges.push(halfEdge1);
        vertices[1].leavingHalfEdges.push(halfEdge3);
        vertices[2].leavingHalfEdges.push(halfEdge5);
        vertex.leavingHalfEdges = [halfEdge2, halfEdge4, halfEdge6];

        face1.faceName = vertex.vertexName + "," + vertices[0].vertexName + "," + vertices[1].vertexName;
        face1.edge = halfEdge2;

        face2.faceName = vertex.vertexName + "," + vertices[1].vertexName + "," + vertices[2].vertexName;
        face2.edge = halfEdge4;

        face3.faceName = vertex.vertexName + "," + vertices[2].vertexName + "," + vertices[0].vertexName;
        face3.edge = halfEdge6;

        halfEdge2.leftSideFace = face1;
        edges[0].leftSideFace = face1;
        halfEdge3.leftSideFace = face1;

        halfEdge4.leftSideFace = face2;
        edges[1].leftSideFace = face2;
        halfEdge5.leftSideFace = face2;

        halfEdge6.leftSideFace = face3;
        edges[2].leftSideFace = face3;
        halfEdge1.leftSideFace = face3;

        edges[0].previousHalfEdge = halfEdge2;
        edges[0].nextHalfEdge = halfEdge3;

        edges[1].previousHalfEdge = halfEdge4;
        edges[1].nextHalfEdge = halfEdge5;

        edges[2].previousHalfEdge = halfEdge6;
        edges[2].nextHalfEdge = halfEdge1;

        this.vertices.set(vertex.vertexName, vertex);

        //Don't delete the face instead mark it as old and then assign the
        //vertex to its correct child.
        //this.faces.delete(vertexFace.faceName);
        vertexFace.isFaceOld = true;
        vertexFace.childFaces.push(face1, face2, face3);

        this.faces.set(face1.faceName, face1);
        this.faces.set(face2.faceName, face2);
        this.faces.set(face3.faceName, face3);

        this.halfedges.set(halfEdge1.edgeName, halfEdge1);
        this.halfedges.set(halfEdge2.edgeName, halfEdge2);
        this.halfedges.set(halfEdge3.edgeName, halfEdge3);
        this.halfedges.set(halfEdge4.edgeName, halfEdge4);
        this.halfedges.set(halfEdge5.edgeName, halfEdge5);
        this.halfedges.set(halfEdge6.edgeName, halfEdge6);

        //Once the vertex has been added and the new faces have been formed
        //We must verify that each new face is valid
        this.verifyEdges(edges);

    }

    flipEdges(oldFaceObject, flipPoint) {
        //Get the edge of the face whose twin's, next edge's target is the flip point.
        let oldEdge = this.halfedges.get(oldFaceObject.edge.edgeName);
        if (oldEdge == null) {
            console.log("This edge was null which is strange!");
            return;
        }
        let oldFace = oldEdge.leftSideFace;
        let oldTwin;
        let counter = 0;
        while (counter < 4) {
            if (oldEdge.twin == null) {
                return;
            }
            oldTwin = oldEdge.twin;
            let flipVert = oldTwin.nextHalfEdge.targetVertex;
            if (flipVert.x === flipPoint.x && flipVert.z === flipPoint.z) {
                break;
            }
            oldEdge = oldEdge.nextHalfEdge;
            counter++;
        }
        if (counter === 4) {
            console.log("Counter reached 4. Something is wrong");
            return;
        }

        let twinOldFace = oldTwin.leftSideFace;

        //We get the new and the old vertex objects
        let newStartVert = this.vertices.get(oldEdge.nextHalfEdge.targetVertex.vertexName);
        let newEndVert = this.vertices.get(flipPoint.vertexName);
        let oldStartVert = this.vertices.get(oldEdge.originVertex.vertexName);
        let oldEndVert = this.vertices.get(oldEdge.targetVertex.vertexName);

        //Create the new halfedge objects and set their pointers to the correct half edges
        let halfEdge1 = new HalfEdge();
        let halfEdge2 = new HalfEdge();

        halfEdge1.edgeName = newStartVert.vertexName + newEndVert.vertexName;
        halfEdge1.originVertex = newStartVert;
        halfEdge1.targetVertex = newEndVert;
        halfEdge1.twin = halfEdge2;
        halfEdge1.nextHalfEdge = oldTwin.nextHalfEdge.nextHalfEdge;
        halfEdge1.previousHalfEdge = oldEdge.nextHalfEdge;

        halfEdge2.edgeName = newEndVert.vertexName + newStartVert.vertexName;
        halfEdge2.originVertex = newEndVert;
        halfEdge2.targetVertex = newStartVert;
        halfEdge2.twin = halfEdge1;
        halfEdge2.nextHalfEdge = oldEdge.nextHalfEdge.nextHalfEdge;
        halfEdge2.previousHalfEdge = oldTwin.nextHalfEdge;

        //Create two new face objects and initialize them as needed
        let face1 = new Face();
        let face2 = new Face();

        face1.faceName = oldEndVert.vertexName + "," + newStartVert.vertexName + "," + newEndVert.vertexName;
        face1.edge = oldEdge.nextHalfEdge;

        face2.faceName = oldStartVert.vertexName + "," + newEndVert.vertexName + "," + newStartVert.vertexName;
        face2.edge = oldTwin.nextHalfEdge;

        halfEdge1.leftSideFace = face1;
        halfEdge2.leftSideFace = face2;


        //Now for each edge that points to the old half edges, it's next edge is the edge from the older second triangle
        //For each edge that points to the points of the new edges it's next edge is now the new edge
        let edge1 = oldEdge.nextHalfEdge;
        let edge2 = oldEdge.nextHalfEdge.nextHalfEdge;
        let edge3 = oldTwin.nextHalfEdge;
        let edge4 = oldTwin.nextHalfEdge.nextHalfEdge;

        edge1.previousHalfEdge = oldTwin.previousHalfEdge;
        edge1.nextHalfEdge = halfEdge1;
        edge1.leftSideFace = face1;


        edge2.previousHalfEdge = halfEdge2;
        edge2.nextHalfEdge = oldTwin.nextHalfEdge;
        edge2.leftSideFace = face2;

        edge3.previousHalfEdge = oldEdge.previousHalfEdge;
        edge3.nextHalfEdge = halfEdge2;
        edge3.leftSideFace = face2;

        edge4.previousHalfEdge = halfEdge1;
        edge4.nextHalfEdge = oldEdge.nextHalfEdge;
        edge4.leftSideFace = face1;

        //For each old Vertex just delete the old edges
        for (let i = 0; i < oldStartVert.leavingHalfEdges.length; i++) {
            let edge = oldStartVert.leavingHalfEdges[i];
            if (edge.edgeName === oldEdge.edgeName) {
                oldStartVert.leavingHalfEdges.splice(i, 1);
                break;
            }
        }

        for (let i = 0; i < oldEndVert.leavingHalfEdges.length; i++) {
            let edge = oldEndVert.leavingHalfEdges[i];
            if (edge.edgeName === oldTwin.edgeName) {
                oldEndVert.leavingHalfEdges.splice(i, 1);
                break;
            }
        }
        //For the new vertices just add the new edges
        newStartVert.leavingHalfEdges.push(halfEdge1);
        newEndVert.leavingHalfEdges.push(halfEdge2);

        //Add the new edges and the faces to Datastucture maps
        this.halfedges.set(halfEdge1.edgeName, halfEdge1);
        this.halfedges.set(halfEdge2.edgeName, halfEdge2);
        this.faces.set(face1.faceName, face1);
        this.faces.set(face2.faceName, face2);

        //Delete the old halfedges
        this.halfedges.delete(oldEdge.edgeName);
        this.halfedges.delete(oldTwin.edgeName);

        //But don't delete the old faces, instead mark them as old and assign
        //the point to one of their children
        //this.faces.delete(oldFace.faceName);
        //this.faces.delete(twinOldFace.faceName);
        oldFace.isFaceOld = true;
        twinOldFace.isFaceOld = true;
        oldFace.childFaces.push(face1, face2);
        twinOldFace.childFaces.push(face1, face2);

        //Once we flip edges and create new faces, we must ensure that they are valid faces
        this.verifyEdges([edge1, edge2, edge3, edge4]);

    }

    verifyEdges(oldEdgesList) {
        for (let i = 0; i < oldEdgesList.length; i++) {
            let edge = this.halfedges.get(oldEdgesList[i].edgeName);
            if (edge == null || edge.twin == null) {
                continue;
            }
            let pointA = edge.nextHalfEdge.targetVertex;
            let pointB = edge.originVertex;
            let pointC = edge.targetVertex;
            let pointD = edge.twin.nextHalfEdge.targetVertex;

            let m = new THREE.Matrix4();
            m.set(pointA.x, pointA.z, Math.pow(pointA.x, 2) + Math.pow(pointA.z, 2), 1,
                pointB.x, pointB.z, Math.pow(pointB.x, 2) + Math.pow(pointB.z, 2), 1,
                pointC.x, pointC.z, Math.pow(pointC.x, 2) + Math.pow(pointC.z, 2), 1,
                pointD.x, pointD.z, Math.pow(pointD.x, 2) + Math.pow(pointD.z, 2), 1);
            let det = m.determinant();
            if (det > 0) {
                this.flipEdges(edge.leftSideFace, pointD);
            }
        }
    }
}

//TODO: A lot of the data structures are just silly redundant so remove once done
export class Vertex {
    constructor(name, x, y, z) {
        this.vertexName = name;
        this.x = x;
        this.y = y;
        this.z = z;
        this.leavingHalfEdges = [];
    }
}

export class HalfEdge {
    constructor() {
        this.edgeName = null;
        this.originVertex = null;
        this.targetVertex = null;
        this.leftSideFace = null;
        this.twin = null;
        this.nextHalfEdge = null;
        this.previousHalfEdge = null;
    }
}

export class Face {
    constructor() {
        this.faceName = null;
        this.edge = null;
        this.isFaceOld = false;
        this.childFaces = [];
    }
}

