/**
 * The following is a javascript implementation of the Doubly Connected Edge List data structure by me: Kunal Shitut
 */
class DCEL {
    constructor() {
        this.vertices = new Map();
        this.faces = new Map();
        this.halfedges = new Map();
    }
}

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
        this.originVertex = null;
        this.leftSideFace = null;
        this.twin = null;
    }
}

class Face {
    constructor() {
        this.edge = null;

    }
}

