/**
 * The following is a javascript implementation of the Doubly Connected Edge List data structure by me: Kunal Shitut
 */
class DCEL {
    constructor() {
        this.vertices = new Map();
        this.faces = new Map();
        this.halfedges = new Map();
    }

    addVertex(vertex) {
        //Find the face where the vertex is inserted
        //Create and add the new halfedges to the list
        //Then split the faces
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
        this.leavingHalfEdge = [];
    }
}

class HalfEdge {
    constructor() {
        this.edgeName = [];
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
        this.faceName = [];
        this.edge = null;
    }
}

