class Ball {
    constructor(ballMesh, position, mass) {
        //Basic object properties
        this.ballMesh = ballMesh;
        this.ballRadius = this.ballMesh.geometry.parameters.radius;
        this.ballMesh.position.set(position.x, position.y, position.z);
        this.ballMesh.quaternion.set(0, 0, 0, 0);
        this.ballMass = mass;

        this.stopBallMotion();

        //For collision calculation
        this.ballPreviousPosition = new THREE.Vector3(0, 0, 0);
        this.ballPreviousTime = 0;
    }

    move(delta) {
        this.ballPreviousPosition = this.ballMesh.position;
        this.ballMesh.position.x = this.ballMesh.position.x + (this.ballVelocity.x * delta);
        this.ballMesh.position.y = this.ballMesh.position.y + (this.ballVelocity.y * delta);
        this.ballMesh.position.z = this.ballMesh.position.z + (this.ballVelocity.z * delta);
    }

    rotateInQuaternion(delta) {
        let quat = this.ballMesh.quaternion.normalize();
        let omegaQuaternion = new THREE.Quaternion(this.ballOmega.x, this.ballOmega.y, this.ballOmega.z, 0);
        omegaQuaternion = omegaQuaternion.multiply(quat);
        omegaQuaternion = new THREE.Quaternion(omegaQuaternion.x * 0.5, omegaQuaternion.y * 0.5, omegaQuaternion.z * 0.5, omegaQuaternion.w * 0.5);
        omegaQuaternion = new THREE.Quaternion(omegaQuaternion.x * delta, omegaQuaternion.y * delta, omegaQuaternion.z * delta, omegaQuaternion.w * delta);
        omegaQuaternion = new THREE.Quaternion(quat.x + omegaQuaternion.x, quat.y + omegaQuaternion.y, quat.z + omegaQuaternion.z, quat.w + omegaQuaternion.w);
        this.ballMesh.quaternion.set(omegaQuaternion.x, omegaQuaternion.y, omegaQuaternion.z, omegaQuaternion.w);
    }

    changeMomentum(delta, impulse) {
        this.ballPreviousTime += delta;
        this.ballMomentum.x = this.ballMomentum.x + this.ballForce.x * delta + impulse.x;
        this.ballMomentum.y = this.ballMomentum.y + this.ballForce.y * delta + impulse.y;
        this.ballMomentum.z = this.ballMomentum.z + this.ballForce.z * delta + impulse.z;
    }

    changeAngularMomentum(delta, impulse) {
        this.ballAngularMomentum = this.ballAngularMomentum.clone().add(impulse);
        this.ballGravAngularMomentum.add(this.ballTorque.multiplyScalar(delta))
    }

    updateVelocityFromMomentum() {
        this.ballVelocity.x = this.ballMomentum.x / this.ballMass;
        this.ballVelocity.y = this.ballMomentum.y / this.ballMass;
        this.ballVelocity.z = this.ballMomentum.z / this.ballMass;
    }

    updateAngularVelocityFromMomentum() {
        let inertiaTensorValue = (2 / 5) * this.ballMass * this.ballRadius * this.ballRadius;
        let matrix = new THREE.Matrix3();
        matrix.set(inertiaTensorValue, 0, 0,
            0, inertiaTensorValue, 0,
            0, 0, inertiaTensorValue);
        matrix.getInverse(matrix, false);
        let matrixArray = matrix.elements;
        let ballM = this.ballAngularMomentum;
        ballM = ballM.add(this.ballGravAngularMomentum);
        let element1 = ballM.x * matrixArray[0] + ballM.y * matrixArray[3] + ballM.z * matrixArray[6];
        let element2 = ballM.x * matrixArray[1] + ballM.y * matrixArray[4] + ballM.z * matrixArray[7];
        let element3 = ballM.x * matrixArray[2] + ballM.y * matrixArray[5] + ballM.z * matrixArray[8];
        this.ballOmega = new THREE.Vector3(element1, element2, element3);
    }

    stopBallMotion() {
        //Translational motion variables
        this.ballVelocity = new THREE.Vector3(0, 0, 0);
        this.ballMomentum = new THREE.Vector3(0, 0, 0);
        this.ballForce = new THREE.Vector3(0, 0, 0);

        //Rotational motion  variables
        this.ballOmega = new THREE.Vector3(0, 0, 0);
        this.ballTorque = new THREE.Vector3(0, 0, 0);
        this.ballAngularMomentum = new THREE.Vector3(0, 0, 0);
        this.ballGravAngularMomentum = new THREE.Vector3(0, 0, 0);
        this.ballInNaturalRoll = false;
    }

}


function getDistanceBetweenMesh(vector1, vector2) {
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2)
        + Math.pow(vector1.y - vector2.y, 2));
}

function calculatePositionFromDelta(ballArrayElement, midDel) {
    let positionToReturn = new THREE.Vector3(0, 0, 0);
    positionToReturn.x = ballArrayElement.ballPreviousPosition.x + (ballArrayElement.ballVelocity.x * midDel);
    positionToReturn.y = ballArrayElement.ballPreviousPosition.y + (ballArrayElement.ballVelocity.y * midDel);
    positionToReturn.z = ballArrayElement.ballPreviousPosition.z + (ballArrayElement.ballVelocity.z * midDel);
    return positionToReturn;
}

function getIMatrix(ballArrayElement) {
    let inertiaTensorValue = (2 / 5) * ballArrayElement.ballMass * ballArrayElement.ballRadius * ballArrayElement.ballRadius;
    let matrix = new THREE.Matrix3();
    matrix.set(inertiaTensorValue, 0, 0,
        0, inertiaTensorValue, 0,
        0, 0, inertiaTensorValue);
    matrix.getInverse(matrix, false);
    return matrix;
}

function mulitplyMatrixVector(inverse, vector1) {
    let matrixArray = inverse.elements;
    let element1 = vector1.x * matrixArray[0] + vector1.y * matrixArray[3] + vector1.z * matrixArray[6];
    let element2 = vector1.x * matrixArray[1] + vector1.y * matrixArray[4] + vector1.z * matrixArray[7];
    let element3 = vector1.x * matrixArray[2] + vector1.y * matrixArray[5] + vector1.z * matrixArray[8];
    return new THREE.Vector3(element1, element2, element3);
}

function main() {
    let scene = new THREE.Scene();
    let renderWidth = 700;
    let renderHeight = 700;
    //let camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 0.01, 1000);
    let camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 1, 100);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(renderWidth, renderHeight);
    document.body.appendChild(renderer.domElement);

//Geometries here

//Texture loading here
//texture credits to robinwood.com and https://www.toptal.com/designers/subtlepatterns/pool-table/
    let cueTexture = new THREE.TextureLoader().load('../images/BallCue.jpg');
    let blueBallTexture = new THREE.TextureLoader().load('../images/Ball10.jpg');
    let redBallTexture = new THREE.TextureLoader().load('../images/Ball11.jpg');
    let greenBallTexture = new THREE.TextureLoader().load('../images/Ball14.jpg');
    let billiardsTableTexture = new THREE.TextureLoader().load('../images/pool_table.png');

    let blueBall = getSphere(blueBallTexture);
    let redBall = getSphere(redBallTexture);
    let greenBall = getSphere(greenBallTexture);
    let poolTable = getCube("texture", billiardsTableTexture, 40, 80, 0.5);
    let poolTableBottomEdge = getCube("color", 0x0a6c03, 44, 2, 2);
    let poolTableRightEdge = getCube("color", 0x0a6c03, 2, 84, 2);
    let poolTableTopEdge = getCube("color", 0x0a6c03, 44, 2, 2);
    let poolTableLeftEdge = getCube("color", 0x0a6c03, 2, 84, 2);
    let cueBall = getSphere(cueTexture);

    camera.position.z = 5;
    poolTable.position.set(0, 0, -21);

    let blueBallObject = new Ball(blueBall, new THREE.Vector3(-16, -5, -20), 1);
    let redBallObject = new Ball(redBall, new THREE.Vector3(-13, -5, -20), 1);
    let greenBallObject = new Ball(greenBall, new THREE.Vector3(-5, -15, -20), 1);
    let cueBallObject = new Ball(cueBall, new THREE.Vector3(0, -20, -20), 1);
    poolTableBottomEdge.position.set(0, -41, -20);
    poolTableRightEdge.position.set(21, 0, -20);
    poolTableTopEdge.position.set(0, 41, -20);
    poolTableLeftEdge.position.set(-21, 0, -20);

    let ballArray = [cueBallObject, blueBallObject, redBallObject, greenBallObject];

    scene.add(blueBall, redBall, greenBall, poolTable, cueBall, poolTableBottomEdge, poolTableRightEdge, poolTableTopEdge, poolTableLeftEdge);

    //For now we are just giving the ball sample translational and rotational velocity
    ballArray[0].ballForce = new THREE.Vector3(-100, 100, 0);

    let then = 0;

    let coefficientOfRestitution = 0.7;

    function animate(now) {

        now *= 0.001;  // make it seconds
        const delta = now - then;
        then = now;

        let ballImpulse = [];
        let ballRotImpulse = [];
        for (let i = 0; i < ballArray.length; i++) {
            ballImpulse.push(new THREE.Vector3(0, 0, 0));
            ballRotImpulse.push(new THREE.Vector3(0, 0, 0));
            ballArray[i].ballAngularMomentum = new THREE.Vector3(0, 0, 0);
        }


        //STEP 1
        //We will calculate the forces here
        //Calculating forces due to gravity
        for (let i = 0; i < ballArray.length; i++) {
            let ballObject = ballArray[i];
            // if (!ballObject.ballInNaturalRoll) {
            //     let fricPoint = new THREE.Vector3(0, 0, -1);
            //     let gravFric = ballObject.ballVelocity.clone().normalize().negate()
            //         .multiplyScalar(ballObject.ballMass)
            //         .multiplyScalar(9.8)
            //         .multiplyScalar(1.0);
            //     ballObject.ballTorque = fricPoint.cross(gravFric);
            //     if (ballObject.ballVelocity.length() <= ballObject.ballOmega.clone().multiplyScalar(ballObject.ballRadius).length()) {
            //         ballObject.ballGravAngularMomentum = new THREE.Vector3(0, 0, 0);
            //         ballObject.ballTorque = new THREE.Vector3(0, 0, 0);
            //         ballObject.ballInNaturalRoll = true;
            //     }
            // } else {
            //     let fricPoint = new THREE.Vector3(0, 0, -1);
            //     if (ballObject.ballVelocity.length() > 0) {
            //         let rollFric = ballObject.ballVelocity.clone().normalize().negate()
            //             .multiplyScalar(ballObject.ballMass)
            //             .multiplyScalar(9.8)
            //             .multiplyScalar(0.2);
            //         ballObject.ballForce.add(rollFric);
            //     }
            //     if (ballObject.ballOmega.length() > 0) {
            //         let rollFric = ballObject.ballVelocity.clone().normalize()
            //             .multiplyScalar(ballObject.ballMass)
            //             .multiplyScalar(9.8)
            //             .multiplyScalar(0.2);
            //         ballObject.ballTorque = fricPoint.cross(rollFric);
            //     }
            //     if (ballObject.ballOmega.length() < 0) {
            //         ballObject.ballGravAngularMomentum = new THREE.Vector3(0, 0, 0);
            //         ballObject.ballTorque = new THREE.Vector3(0, 0, 0);
            //         ballObject.ballInNaturalRoll = false;
            //     }
            // }
            if (ballObject.ballVelocity.length() > 0) {
                let rollFric = ballObject.ballVelocity.clone().normalize().negate()
                    .multiplyScalar(ballObject.ballMass)
                    .multiplyScalar(9.8)
                    .multiplyScalar(0.5);
                ballObject.ballForce.add(rollFric);
            }
            ballArray[i] = ballObject;
        }

        //STEP 2
        //Now we integrate the position of the ball
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].move(delta);
            ballArray[i].rotateInQuaternion(delta);
        }

        //perform collision detection and response here
        for (let i = 0; i < ballArray.length; i++) {
            for (let j = i; j < ballArray.length; j++) {
                if (i !== j && getDistanceBetweenMesh(ballArray[i].ballMesh.position, ballArray[j].ballMesh.position) <= 2.1) {
                    let previousTime = ballArray[i].ballPreviousTime;
                    let ball1 = ballArray[i].ballMesh;
                    let ball2 = ballArray[j].ballMesh;
                    let distance = getDistanceBetweenMesh(ball1.position, ball2.position);

                    //New Delta at which collision was detected
                    let newDelta = delta;

                    //These are needed for the search algorithm
                    let lDelta = (previousTime);
                    let rDelta = (previousTime + newDelta);
                    let limit = 10;
                    let counter = 0;
                    while (lDelta < rDelta && counter < limit) {
                        let midDel = (lDelta + rDelta) / 2;
                        newDelta = midDel - previousTime;
                        let ball1DelPos = calculatePositionFromDelta(ballArray[i], midDel - previousTime);
                        let ball2DelPos = calculatePositionFromDelta(ballArray[j], midDel - previousTime);
                        distance = getDistanceBetweenMesh(ball1DelPos, ball2DelPos);
                        if (distance > 2.1) {
                            rDelta = midDel;
                            counter += 1
                        } else if (distance < 1.9) {
                            lDelta = midDel;
                            counter += 1;
                        } else {
                            //The actual delta of collision found
                            newDelta = midDel - previousTime;
                            break;
                        }
                    }
                    //We have the delta at which the collision took place
                    let ball1CollPos = calculatePositionFromDelta(ballArray[i], newDelta);
                    let ball2CollPos = calculatePositionFromDelta(ballArray[j], newDelta);
                    let collisionPoint = new THREE.Vector3(
                        (ball1CollPos.x + ball2CollPos.x) / 2,
                        (ball1CollPos.y + ball2CollPos.y) / 2,
                        (ball1CollPos.z + ball2CollPos.z) / 2);
                    let ball1CollisionRelative = collisionPoint.clone().sub(ball1CollPos);
                    let ball2CollisionRelative = collisionPoint.clone().sub(ball2CollPos);

                    //Find the normal of collision for the ball
                    let ball1NormalVector = ball2CollPos.clone().sub(ball1CollPos).normalize();
                    //let ball2NormalVector = ball1CollPos.sub(ball2CollPos);

                    // //Find the velocity along the collision normal
                    // let ball1NormalVelocity = ballArray[i].ballVelocity.dot(ball1NormalVector);
                    // let ball2NormalVelocity = ballArray[j].ballVelocity.dot(ball1NormalVector);

                    let vp1 = ballArray[i].ballVelocity.clone().add(ballArray[i].ballOmega.clone().cross(ball1CollisionRelative));
                    let vp2 = ballArray[j].ballVelocity.clone().add(ballArray[j].ballOmega.clone().cross(ball2CollisionRelative));

                    //Velocity along normal after collision
                    let J_numerator = vp2.sub(vp1)
                        .multiplyScalar(-1)
                        .multiplyScalar(2).dot(ball1NormalVector);
                    let I1 = getIMatrix(ballArray[i]);
                    let I2 = getIMatrix(ballArray[j]);
                    let vector1 = ball1CollisionRelative.clone().cross(ball1NormalVector);
                    let vector2 = ball2CollisionRelative.clone().cross(ball1NormalVector);
                    let result1 = mulitplyMatrixVector(I1.getInverse(I1, false), vector1);
                    let result2 = mulitplyMatrixVector(I2.getInverse(I2, false), vector2);
                    result1 = result1.cross(ball1CollisionRelative);
                    result2 = result2.cross(ball2CollisionRelative);
                    result1 = ball1NormalVector.dot(result1);
                    result2 = ball1NormalVector.dot(result2);
                    let J_denominator = 2 + result1 + result2;
                    let J = J_numerator / J_denominator;
                    ballImpulse[i].sub(ball1NormalVector.clone().multiplyScalar(J));
                    ballImpulse[j].add(ball1NormalVector.clone().multiplyScalar(J));
                    ballRotImpulse[i].sub(mulitplyMatrixVector(I1.getInverse(I1, false), ball1CollisionRelative.cross(ball1NormalVector)).multiplyScalar(J));
                    ballRotImpulse[j].add(mulitplyMatrixVector(I2.getInverse(I2, false), ball2CollisionRelative.cross(ball1NormalVector)).multiplyScalar(J));

                }
            }
        }

        for (let i = 0; i < ballArray.length; i++) {
            let positionVec = ballArray[i].ballMesh.position;
            if (positionVec.x > 19 || positionVec.x < (-19)) {
                let ballIMoment = ballArray[i].ballMomentum;
                ballArray[i].ballMomentum = new THREE.Vector3(ballIMoment.x * -1 * coefficientOfRestitution,
                    ballIMoment.y * coefficientOfRestitution,
                    ballIMoment.z * coefficientOfRestitution);
            }

            if (positionVec.y > 39 || positionVec.y < (-39)) {
                let ballIMoment = ballArray[i].ballMomentum;
                ballArray[i].ballMomentum = new THREE.Vector3(ballIMoment.x * coefficientOfRestitution,
                    ballIMoment.y * -1 * coefficientOfRestitution,
                    ballIMoment.z * coefficientOfRestitution);
            }
        }


        for (let i = 0; i < ballArray.length; i++) {
            //Update momentum
            ballArray[i].changeMomentum(delta, ballImpulse[i]);
            ballArray[i].changeAngularMomentum(delta, ballRotImpulse[i]);

            //STEP 3
            ballArray[i].updateVelocityFromMomentum();
            ballArray[i].updateAngularVelocityFromMomentum();
        }

        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].ballForce = new THREE.Vector3(0, 0, 0);
        }


        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate)
}

main();

function getCube(type, texture, width, height, depth) {
    if (type === "texture") {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({map: texture});
        return new THREE.Mesh(geometry, material);
    } else {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({color: texture});
        return new THREE.Mesh(geometry, material);
    }

}

function getSphere(texture) {
    const geometry = new THREE.SphereGeometry(1, 20, 20);
    const material = new THREE.MeshBasicMaterial({map: texture});
    return new THREE.Mesh(geometry, material);
}