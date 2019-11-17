/**
 * The following is a javascript implementation of the Doubly Connected Edge List data structure by me: Kunal Shitut
 */
class DCEL {
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

    addVertex(vertex) {
        //Find the face where the vertex is inserted
        let vertexFace = new Face();
        for (let [key, value] of this.faces) {
            if (isPointInsideTriangle(value, vertex)) {
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

        face3.faceName = vertex.vertexName + vertex[2].vertexName + vertices[0].vertexName;
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

    isPointInsideTriangleFace(triangleNodes, point) {
        if (triangleNodes.length !== 3) {
            throw "This method only works for trianglular faces";
        }
        let A = triangleNodes[0];
        let C = triangleNodes[1];
        let B = triangleNodes[2];

        let w1 = (A.x * (C.y - A.y) + (point.y - A.y) * (C.x - A.x) - point.x * (C.y - A.y)) /
            ((B.y - A.y) * (C.x - A.x) - (B.x - A.x) * (C.y - A.y));
        let w2 = (point.y - A.y - w1 * (B.y - A.y)) / (C.y - A.y);
        return w1 >= 0 && w2 >= 0 && (w1 + w2) <= 1;
    }

    flipEdges(oldHalfEdge, newHalfEdge) {
        //Find the twin half edge and the faces of the half edge
        //Now find the vertices of the new Half Edge
        //Check if they are in the same faces as the original half edges
        //Add their edges
        //Remove old edges
        //Split faces
        //Update graph accordingly
    }

}

//TODO: A lot of the data structures are just silly redundant so remove once done
class Vertex {
    constructor(name, x, y) {
        this.vertexName = name;
        this.xCoordinate = 0;
        this.yCoordinate = 0;
        this.leavingHalfEdges = [];
    }
}

class HalfEdge {
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

class Face {
    constructor() {
        this.faceName = null;
        this.edge = null;
    }
}

