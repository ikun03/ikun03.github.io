//
function degToRad(number) {
    return (number * Math.PI / 180).toPrecision(3);
}

// start here
function drawScene(gl, programInfo, buffers, deltaTime) {
    //Lets create a variable in which to track the current
    //rotation of the square.


    gl.clearColor(0.0, 0.0, 0.0, 1.0);//Clear to black
    gl.clearDepth(1.0); //Clear Everything
    gl.enable(gl.DEPTH_TEST); //Enable Depth Testing
    gl.depthFunc(gl.LEQUAL);  //Near things obscure far things

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fov = degToRad(45);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -10.0]);
    /*mat4.scale(modelViewMatrix, modelViewMatrix, [0.25, 0.25, 0.25]);*/
    mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(45), [0.0, 1.0, 0.0]);

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next
                                  // 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    {
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);

        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);


    // Tell WebGL to use our program when drawing

    gl.useProgram(programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }


}

//
function main() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProg = initShaderProgram(gl, vsSource, fsSource);

    const progInfo = {
        program: shaderProg,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProg, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProg, "aVertexColor"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProg, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProg, "uModelViewMatrix"),
        },
    };

    //Assignment part
    //Let us take the keyframe string and work with it
    var keyframeLines = keyframes.replace("\n", "").split(";");
    var keyframesArray = [];
    for (let i = 0; i < keyframeLines.length; i++) {
        let values = keyframeLines[i].replace("  ", " ").split(" ");
        keyframesArray.push({
            t: values[0],
            x: values[1],
            y: values[2],
            z: values[3],
            xa: values[4],
            ya: values[5],
            za: values[6],
            theta: values[7],
        })
    }

    //Let us calculate the quaternion for each rotation
    //Then we convert it to a Unit quaternion and store it
    //for conversion
    for (let j = 0; j < keyframesArray.length; j++) {
        let keyframeValue = keyframesArray[j];
        let radX = degToRad(keyframeValue.xa * keyframeValue.theta);
        let radY = degToRad(keyframeValue.ya * keyframeValue.theta);
        let radZ = degToRad(keyframeValue.za * keyframeValue.theta);

        let cy = Math.cos(radZ * 0.5).toPrecision(3);
        let sy = Math.sin(radZ * 0.5).toPrecision(3);
        let cp = Math.cos(radY * 0.5).toPrecision(3);
        let sp = Math.cos(radY * 0.5).toPrecision(3);
        let cr = Math.cos(radX * 0.5).toPrecision(3);
        let sr = Math.cos(radX * 0.5).toPrecision(3);

        let quaternion = {
            w: cy * cp * cr + sy * sp * sr,
            x: cy * cp * sr - sy * sp * cr,
            y: sy * cp * sr + cy * sp * cr,
            z: sy * cp * cr - cy * sp * sr,
        };

        let wSq = quaternion.w * quaternion.w;
        let xSq = quaternion.x * quaternion.x;
        let ySq = quaternion.y * quaternion.y;
        let zSq = quaternion.z * quaternion.z;

        let delta = Math.sqrt(wSq + xSq + ySq + zSq);

        keyframesArray[j].unitQuaternion = {
            w: (quaternion.w / delta).toPrecision(3),
            x: (quaternion.x / delta).toPrecision(3),
            y: (quaternion.y / delta).toPrecision(3),
            z: (quaternion.z / delta).toPrecision(3),
        };
    }

    const buffers = initBuffers(gl);
    //We use this for animation
    let then = 0;
    let passedTime = 0;

    function render(now) {
        now *= 0.001; //convert to seconds
        const deltaTime = now - then;
        then = now;

        drawScene(gl, progInfo, buffers, deltaTime);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

window.onload = main;

// Vertex shader program

const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor=aVertexColor;
    }
  `;

const fsSource = `

    varying lowp vec4 vColor;
    
    void main() {
      gl_FragColor = vColor;
    }
  `;

const keyframes = `
0.0  0.0 0.0 0.0 1.0 1.0 -1.0 0.0;
1.0  4.0 0.0 0.0 1.0 1.0 -1.0 30.0;
2.0  8.0 0.0 0.0 1.0 1.0 -1.0 90.0;
3.0  12.0 12.0 12.0 1.0 1.0 -1.0 180.0;
4.0  12.0 18.0 18.0 1.0 1.0 -1.0 270.0;
5.0  18.0 18.0 18.0 0.0 1.0 0.0 90.0;
6.0  18.0 18.0 18.0 0.0 0.0 1.0 90.0;
7.0  25.0 12.0 12.0 1.0 0.0 0.0 0.0;
8.0  25.0 0.0 18.0 1.0 0.0 0.0 0.0;
9.0 25.0 1.0 18.0 1.0 0.0 0.0 0.0;`;

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Now create an array of positions for the square.
    // Front face
    const positions = [-1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ]
    ;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);


    const faceColors = [
        [1.0, 1.0, 1.0, 1.0],    //Front face white
        [1.0, 0.0, 0.0, 1.0],    //Back face: red
        [0.0, 1.0, 0.0, 1.0],    // Top face: green
        [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
        [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    ];
    let colors = [];
    for (let j = 0; j < faceColors.length; j++) {
        const c = faceColors[j];
        colors = colors.concat(c, c, c, c);
    }
    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


    //Once the vertex arrays are generated, we need to build the element array
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indices = [
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // back
        8, 9, 10, 8, 10, 11,   // top
        12, 13, 14, 12, 14, 15,   // bottom
        16, 17, 18, 16, 18, 19,   // right
        20, 21, 22, 20, 22, 23,   // left
    ];

    // Now send the element array to GLs
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
        color: colorBuffer,
        indices: indexBuffer,
    };
}