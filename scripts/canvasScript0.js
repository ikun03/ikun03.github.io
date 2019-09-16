"use strict";
//The following framework code was taken from
//the website - https://webgl2fundamentals.org/

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec4 a_color;

// A matrix to transform the positions by
uniform mat4 u_matrix;
out vec4 v_color;
// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
  v_color=a_color;
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;

in vec4 v_color;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));  // eslint-disable-line
    gl.deleteProgram(program);
    return undefined;
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));  // eslint-disable-line
    gl.deleteShader(shader);
    return undefined;
}

// Draw the scene.


function setColors(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // Front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // Bottom
            100, 70, 150,
            100, 70, 150,
            100, 70, 150,
            100, 70, 150,
            100, 70, 150,
            100, 70, 150,

            // Right
            200, 100, 80,
            200, 100, 80,
            200, 100, 80,
            200, 100, 80,
            200, 100, 80,
            200, 100, 80,

            // Left
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // Back
            250, 50, 150,
            250, 50, 150,
            250, 50, 150,
            250, 50, 150,
            250, 50, 150,
            250, 50, 150,


            // Top
            120, 90, 200,
            120, 90, 200,
            120, 90, 200,
            120, 90, 200,
            120, 90, 200,
            120, 90, 200,
        ]),
        gl.STATIC_DRAW);
}

function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width !== displayWidth ||
        canvas.height !== displayHeight) {

        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    canvas = document.getElementById("glCanvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Use our boilerplate utils to compile the shaders and link into a program
    let program = createProgram(gl,
        vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let colorAttributeLocation = gl.getAttribLocation(program, "a_color");

    // look up uniform locations
    let colorLocation = gl.getUniformLocation(program, "u_color");
    let matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer
    let positionBuffer = gl.createBuffer();
    let colorBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    let vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Set Geometry.
    setGeometry(gl);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 3;          // 3 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    function radToDeg(r) {
        return r * 180 / Math.PI;
    }

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    // The color for each part of the model goes here
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    setColors(gl);
    gl.enableVertexAttribArray(colorAttributeLocation);

    size = 3;
    type = gl.UNSIGNED_BYTE;
    normalize = true;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);


    // First let's make some variables
    // to hold the translation,
    let translation = [-100, -100, -300];
    let rotation = [degToRad(0), degToRad(0), degToRad(0)];
    let scale = [0.25, 0.25, 0.25];
    let color = [Math.random(), Math.random(), Math.random(), 1];
    let rotationSpeed = degToRad(18);
    let translationSpeed = 5;

    //Code for the frame rate independent animation
    let then = 0;
    reqNum = requestAnimationFrame(drawScene);

    function drawScene(now) {
        //Calculation for framerate independent animation
        //Convert the time to seconds
        now *= 0.001;
        //Subtract the previous time from current time
        let deltatime = now - then;
        //Remember the current time for the next frame
        then = now;
        // translation[0] += translationSpeed * deltatime;
        // if (translation[0] > gl.canvas.clientWidth) {
        //     translation[0] = -800;
        // }
        translation[0] += translationSpeed * deltatime;
        translation[1] += translationSpeed * deltatime;
        rotation[1] += rotationSpeed * deltatime;


        //For resizing canvas
        //resize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //For proper 3D
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        // Tell WebGL how to convert from clip space to pixels


        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);

        // Set the color.
        gl.uniform4fv(colorLocation, color);

        // Compute the matrix
        // var left = 0;
        // var right = gl.canvas.clientWidth;
        // var bottom = gl.canvas.clientHeight;
        // var top = 0;
        // var near = 400;
        // var far = -400;
        // var matrix = m4.orthographic(left,right,bottom,top,near,far);

        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let fieldOfViewRadians = degToRad(50);
        let perspectiveMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        //This was the code that was used for the original 'F'. Check next code block for camera stuff
        // matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
        // matrix = m4.xRotate(matrix, rotation[0]);
        // matrix = m4.yRotate(matrix, rotation[1]);
        // matrix = m4.zRotate(matrix, rotation[2]);
        // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
        //
        // // Set the matrix.
        // gl.uniformMatrix4fv(matrixLocation, false, matrix);
        //
        // // Draw the geometry.
        // var primitiveType = gl.TRIANGLES;
        // var offset = 0;
        // var count = 16 * 6;
        // gl.drawArrays(primitiveType, offset, count);

        //Compute the position of the first F
        let fPosition = [0, 0, -500];
        //This are the changes made for the camera
        //Use the matrix math to compute a position on the circle
        let cameraMatrix = m4.yRotation(degToRad(0));
        cameraMatrix = m4.translate(cameraMatrix, 0, 0, 0);//radius * 1.5);
        let cameraPosition = [
            cameraMatrix[12],
            cameraMatrix[13],
            cameraMatrix[14],
        ];
        let up = [0, 1, 0];
        //Compute the camera's matrix using look at.
        cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);
        //Make a view matrix from the camera matrix
        let viewMatrix = m4.inverse(cameraMatrix);
        //move the projection space to view space(the space in front of the camera)
        let viewProjectionMatrix = m4.multiply(perspectiveMatrix, viewMatrix);
        //Draw 'F's in a circle
        // add in the translation for this F
        viewProjectionMatrix = m4.translate(viewProjectionMatrix, translation[0], translation[1], translation[2]);
        viewProjectionMatrix = m4.xRotate(viewProjectionMatrix, rotation[0]);
        viewProjectionMatrix = m4.yRotate(viewProjectionMatrix, rotation[1]);
        viewProjectionMatrix = m4.zRotate(viewProjectionMatrix, rotation[2]);
        viewProjectionMatrix = m4.scale(viewProjectionMatrix, scale[0], scale[1], scale[2]);
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, viewProjectionMatrix);
        // Draw the geometry.
        let primitiveType = gl.TRIANGLES;
        let offset = 0;
        let count = 16 * 6;
        gl.drawArrays(primitiveType, offset, count);
        //Drawing animation
        reqNum = requestAnimationFrame(drawScene);

    }
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]];
}

function subtractVectors(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl) {
    let fPixelArray = new Float32Array([
        //Front face
        0, 300, 0,
        0, 0, 0,
        300, 0, 0,
        300, 0, 0,
        300, 300, 0,
        0, 300, 0,

        //Right face
        300, 300, 0,
        300, 0, 0,
        300, 0, -300,
        300, 0, -300,
        300, 300, -300,
        300, 300, 0,

        //Back face
        300, 300, -300,
        300, 0, -300,
        0, 0, -300,
        0, 0, -300,
        0, 300, -300,
        300, 300, -300,

        //Left Face
        0, 300, -300,
        0, 0, -300,
        0, 0, 0,
        0, 0, 0,
        0, 300, 0,
        0, 300, -300,

        //Bottom Face
        0, 0, 0,
        0, 0, -300,
        300, 0, -300,
        300, 0, -300,
        300, 0, 0,
        0, 0, 0,

        //Top Face
        0, 300, -300,
        0, 300, 0,
        300, 300, 0,
        300, 300, 0,
        300, 300, -300,
        0, 300, -300,
    ]);

    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.

    // We could do by changing all the values above but I'm lazy.
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    var matrix = m4.xRotation(0);
    matrix = m4.translate(matrix, -150, -150, 150);

    for (var ii = 0; ii < fPixelArray.length; ii += 3) {
        var vector = m4.transformVector(matrix, [fPixelArray[ii + 0], fPixelArray[ii + 1], fPixelArray[ii + 2], 1]);
        fPixelArray[ii + 0] = vector[0];
        fPixelArray[ii + 1] = vector[1];
        fPixelArray[ii + 2] = vector[2];
    }

    gl.bufferData(
        gl.ARRAY_BUFFER,
        fPixelArray,
        gl.STATIC_DRAW);
}


var m4 = {

    perspective: function (fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    orthographic: function (left, right, bottom, top, near, far) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,

            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1,
        ];
    },

    projection: function (width, height, depth) {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },

    multiply: function (a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function (m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function (m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    inverse: function (m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02)),
        ];
    },
    transformVector: function (m, v) {
        var dst = [];
        for (var i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (var j = 0; j < 4; ++j) {
                dst[i] += v[j] * m[j * 4 + i];
            }
        }
        return dst;
    },
    lookAt: function (cameraPosition, target, up) {
        var zAxis = normalize(
            subtractVectors(cameraPosition, target));
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ];
    },
};

function updatePosition(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    };
}

function updateRotation(index) {
    return function (event, ui) {
        var angleInDegrees = ui.value;
        var angleInRadians = degToRad(angleInDegrees);
        rotation[index] = angleInRadians;
        drawScene();
    };
}

function updateScale(index) {
    return function (event, ui) {
        scale[index] = ui.value;
        drawScene();
    };
}

var canvas;
var gl;
var reqNum = 0;
main();

