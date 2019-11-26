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
    }

    isPointInsideTriangleFace(face, point) {

        let A = face.edge.originVertex;
        let C = face.edge.targetVertex;
        let B = face.edge.nextHalfEdge.targetVertex;

        let denominator = (B.z - A.z) * (C.x - A.x) - (B.x - A.x) * (C.z - A.z);
        let w1 = (A.x * (C.z - A.z) + (point.z - A.z) * (C.x - A.x) - point.x * (C.z - A.z)) /
            denominator;
        let w2 = (point.z - A.z - w1 * (B.z - A.z)) / (C.z - A.z);
        return w1 >= 0 && w2 >= 0 && (w1 + w2) <= 1;
    }

    addVertex(vertex) {
        //Find the face where the vertex is inserted
        let vertexFace = new Face();
        for (let [key, value] of this.faces) {
            if (this.isPointInsideTriangleFace(value, vertex)) {
                vertexFace = value;
                break;
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

        face1.faceName = vertex.vertexName + vertices[0].vertexName + vertices[1].vertexName;
        face1.edge = halfEdge2;

        face2.faceName = vertex.vertexName + vertices[1].vertexName + vertices[2].vertexName;
        face2.edge = halfEdge4;

        face3.faceName = vertex.vertexName + vertices[2].vertexName + vertices[0].vertexName;
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

        this.vertices.set(vertex.vertexName, vertex);

        this.faces.delete(vertexFace.faceName);
        this.faces.set(face1.faceName, face1);
        this.faces.set(face2.faceName, face2);
        this.faces.set(face3.faceName, face3);

        this.halfedges.set(halfEdge1.edgeName, halfEdge1);
        this.halfedges.set(halfEdge2.edgeName, halfEdge2);
        this.halfedges.set(halfEdge3.edgeName, halfEdge3);
        this.halfedges.set(halfEdge4.edgeName, halfEdge4);
        this.halfedges.set(halfEdge5.edgeName, halfEdge5);
        this.halfedges.set(halfEdge6.edgeName, halfEdge6);

    }

    flipEdges(oldFace, flipPoint) {
        //Get the edge of the face whose twin's, next edge's target is the flip point.
        let oldEdge = oldFace.edge;
        let oldTwin;
        while (true) {
            if (oldEdge.twin == null) {
                break;
            }
            oldTwin = oldEdge.twin;
            let flipVert = oldTwin.nextHalfEdge.targetVertex;
            if (flipVert.x === flipPoint.x && flipVert.z === flipPoint.z) {
                break;
            }
            oldEdge = oldEdge.nextHalfEdge;
        }

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

        face1.faceName = oldEndVert.vertexName + newStartVert.vertexName + newEndVert.vertexName;
        face1.edge = oldEdge.nextHalfEdge;

        face2.faceName = oldStartVert.vertexName + newEndVert.vertexName + newStartVert.vertexName;
        face2.edge = oldTwin.nextHalfEdge;

        halfEdge1.leftSideFace = face1;
        halfEdge2.leftSideFace = face2;


        //Now for each edge that points to the old half edges, it's next edge is the edge from the older second triangle
        //For each edge that points to the points of the new edges it's next edge is now the new edge
        oldEdge.nextHalfEdge.previousHalfEdge = oldTwin.previousHalfEdge;
        oldEdge.nextHalfEdge.nextHalfEdge = halfEdge1;
        oldEdge.nextHalfEdge.leftSideFace = face1;

        oldEdge.nextHalfEdge.nextHalfEdge.previousHalfEdge = halfEdge2;
        oldEdge.nextHalfEdge.nextHalfEdge.nextHalfEdge = oldTwin.nextHalfEdge;
        oldEdge.nextHalfEdge.nextHalfEdge.leftSideFace = face2;


        oldTwin.nextHalfEdge.previousHalfEdge = oldEdge.previousHalfEdge;
        oldTwin.nextHalfEdge.nextHalfEdge = halfEdge2;
        oldTwin.nextHalfEdge.leftSideFace = face2;

        oldTwin.nextHalfEdge.nextHalfEdge.previousHalfEdge = halfEdge1;
        oldTwin.nextHalfEdge.nextHalfEdge.nextHalfEdge = oldEdge.nextHalfEdge;
        oldTwin.nextHalfEdge.nextHalfEdge.leftSideFace = face1;

        //For each old Vertex just delete the old edges
        for (let i = 0; i < oldStartVert.leavingHalfEdges.length; i++) {
            let edge = oldStartVert.leavingHalfEdges[i];
            if (edge.edgeName === oldEdge.edgeName) {
                oldStartVert.leavingHalfEdges.splice(i, 1);
            }
        }

        for (let i = 0; i < oldEndVert.leavingHalfEdges.length; i++) {
            let edge = oldEndVert.leavingHalfEdges[i];
            if (edge.edgeName === oldTwin.edgeName) {
                oldEndVert.leavingHalfEdges.splice(i, 1);
            }
        }
        //For the new vertices just add the new edges
        newStartVert.leavingHalfEdges.push(halfEdge1);
        newEndVert.leavingHalfEdges.push(halfEdge2);

        //Delete the old edges and the old face and add the new edges and the faces
        this.halfedges.delete(oldEdge.edgeName);
        this.halfedges.delete(oldTwin.edgeName);

        this.halfedges.set(halfEdge1.edgeName, halfEdge1);
        this.halfedges.set(halfEdge2.edgeName, halfEdge2);

        this.faces.delete(oldFace.faceName);
        this.faces.set(face1.faceName, face1);
        this.faces.set(face2.faceName, face2);


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
    }
}

