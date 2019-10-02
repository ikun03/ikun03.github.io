//
function degToRad(number) {
    return number * Math.PI / 180;
}

let keyFrame = 0;

function toRotnMatrix(quat1) {
    return mat4.fromValues(
        1 - (2 * quat1._y * quat1._y) - (2 * quat1._z * quat1._z),
        (2 * quat1._x * quat1._y) - (2 * quat1._w * quat1._z),
        (2 * quat1._x * quat1._z) + (2 * quat1._w * quat1._y),
        0,

        (2 * quat1._x * quat1._y) + (2 * quat1._w * quat1._z),
        1 - (2 * quat1._x * quat1._x) - (2 * quat1._z * quat1._z),
        (2 * quat1._y * quat1._z) - (2 * quat1._w * quat1._x),
        0,

        (2 * quat1._x * quat1._z) - (2 * quat1._w * quat1._y),
        (2 * quat1._y * quat1._z) + (2 * quat1._w * quat1._x),
        1 - (2 * quat1._x * quat1._x) - (2 * quat1._y * quat1._y),
        0,

        0, 0, 0, 1
    )
}

function lerp(p_2, p_1, u) {
    let P_at_u_x = (p_2.x - p_1.x) * u + p_1.x;
    let P_at_u_y = (p_2.y - p_1.y) * u + p_1.y;
    let P_at_u_z = ((p_2.z) - (p_1.z)) * u + (p_1.z);
    //return {P_at_u_x, P_at_u_y, P_at_u_z};
    return {x: P_at_u_x, y: P_at_u_y, z: P_at_u_z};
}

// start here
function drawScene(gl, programInfo, buffers, deltaTime, passedTime, keyframesArray) {
    //We have passed time from this we calculate u
    let u = parseFloat(passedTime - keyFrame).toPrecision(4);
    if (u > 3) {
        keyFrame += 3;
        u = parseFloat(passedTime - keyFrame).toPrecision(4);
    }
    u = u / 3;
    //An attempt at de Casteljau Construction
    let p_0 = keyframesArray[keyFrame];
    let p_1 = keyframesArray[keyFrame + 1];
    let p_2 = keyframesArray[keyFrame + 2];
    let p_3 = keyframesArray[keyFrame + 3];
    let q_0 = lerp(p_1, p_0, u);
    let q_1 = lerp(p_2, p_1, u);
    let q_2 = lerp(p_3, p_2, u);
    let r_0 = lerp(q_1, q_0, u);
    let r_1 = lerp(q_2, q_1, u);
    let lerp1 = lerp(r_1, r_0, u);
    let P_at_u_x = lerp1.x;
    let P_at_u_y = lerp1.y;
    let P_at_u_z = lerp1.z;
    P_at_u_y = ((10 * P_at_u_y) / 50);
    P_at_u_x = ((10 * P_at_u_x) / 50);
    console.log(P_at_u_x);
    console.log(P_at_u_y);
    console.log(P_at_u_z);

    //This code is for Lerping
    //let {P_at_u_x, P_at_u_y, P_at_u_z} = lerp(p_2, p_1, u);

    //This is normal Slerping code
    let quat1 = p_0.quaternion.normalize();
    let quat2 = p_3.quaternion.normalize();
    quat1.slerp(quat2, deltaTime);
    console.log(passedTime);
    let rotMat = toRotnMatrix(quat1);


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

    mat4.translate(modelViewMatrix, modelViewMatrix, [P_at_u_x, P_at_u_y, P_at_u_z]);
    //mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -30.0]);
    /*mat4.scale(modelViewMatrix, modelViewMatrix, [0.25, 0.25, 0.25]);*/
    //mat4.rotate(modelViewMatrix, modelViewMatrix, degToRad(45), [0.0, 1.0, 0.0]);

    mat4.multiply(modelViewMatrix, modelViewMatrix, rotMat);
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
            x: parseFloat(values[1]),
            y: parseFloat(values[2]),
            z: (parseFloat(values[3]) - 40),
            xa: parseFloat(values[4]),
            ya: parseFloat(values[5]),
            za: parseFloat(values[6]),
            theta: parseFloat(values[7]),
        });
    }
    //Let us calculate the quaternion for each rotation
    //Then we convert it to a Unit quaternion and store it
    //for conversion
    for (let j = 0; j < keyframesArray.length - 1; j++) {
        let keyframeValue = keyframesArray[j];
        //Old incorrect code to create quaternions from Euler Angles
        /*let radX = degToRad(keyframeValue.xa * keyframeValue.theta);
        let radY = degToRad(keyframeValue.ya * keyframeValue.theta);
        let radZ = degToRad(keyframeValue.za * keyframeValue.theta);

        let cy = Math.cos(radZ * 0.5).toPrecision(3);
        let sy = Math.sin(radZ * 0.5).toPrecision(3);
        let cp = Math.cos(radY * 0.5).toPrecision(3);
        let sp = Math.sin(radY * 0.5).toPrecision(3);
        let cr = Math.cos(radX * 0.5).toPrecision(3);
        let sr = Math.sin(radX * 0.5).toPrecision(3);

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

        keyframesArray[j].unitQuaternion = [
            parseFloat((quaternion.x / delta).toPrecision(3)),
            parseFloat((quaternion.y / delta).toPrecision(3)),
            parseFloat((quaternion.z / delta).toPrecision(3)),
            parseFloat((quaternion.w / delta).toPrecision(3)),
        ];*/
        //New implementation
        let quaternion = new THREE.Quaternion();
        let axis = new THREE.Vector3(keyframeValue.xa, keyframeValue.ya, keyframeValue.za).normalize();
        let angle = degToRad(keyframeValue.theta);
        quaternion.setFromAxisAngle(
            axis,
            angle);
        keyframesArray[j].quaternion = quaternion;


    }

    const buffers = initBuffers(gl);
    //We use this for animation
    let then = 0;
    //let startTime = new Date().getTime() * 0.001;
    let passedTime = 0;

    function render(now) {
        now *= 0.001; //convert to seconds
        const deltaTime = now - then;
        passedTime += deltaTime;
        then = now;
        drawScene(gl, progInfo, buffers, deltaTime, passedTime, keyframesArray);
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