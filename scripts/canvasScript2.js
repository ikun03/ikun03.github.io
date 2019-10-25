class Ball {

    translation = new THREE.Vector3(0, 0, 0);

    constructor(ballMesh, position, mass) {
        this.ballMesh = ballMesh;
        this.ballMesh.position.set(position.x, position.y, position.z);
        this.ballMesh.quaternion.set(0, 0, 0, 0);
        this.ballVelocity = new THREE.Vector3(0, 0, 0);
        this.ballMass = mass;
        this.ballOmega = 0;
        this.ballTorque = 0;
        this.ballMomentum = new THREE.Vector3(0, 0, 0);
        this.ballAngularMomentum = new THREE.Vector3(0, 0, 0);
        this.ballRadius = this.ballMesh.geometry.parameters.radius;
        this.ballForce = new THREE.Vector3(0, 0, 0);
        this.ballPreviousPosition = new THREE.Vector3(0, 0, 0);
        this.ballPreviousDelta = 0;
    }

    move(delta) {
        this.ballPreviousDelta = delta;
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

    changeMomentum(delta) {
        this.ballMomentum.x = this.ballMomentum.x + this.ballForce.x * delta;
        this.ballMomentum.y = this.ballMomentum.y + this.ballForce.y * delta;
        this.ballMomentum.z = this.ballMomentum.z + this.ballForce.z * delta;
    }

    changeAngularMomentum(delta) {
        this.ballAngularMomentum = this.ballAngularMomentum.add(this.ballTorque.multiplyScalar(delta))
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
        let element1 = ballM.x * matrixArray[0] + ballM.y * matrixArray[3] + ballM.z * matrixArray[6];
        let element2 = ballM.x * matrixArray[1] + ballM.y * matrixArray[4] + ballM.z * matrixArray[7];
        let element3 = ballM.x * matrixArray[2] + ballM.y * matrixArray[5] + ballM.z * matrixArray[8];
        this.ballOmega = new THREE.Vector3(element1, element2, element3);
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

function main() {
    let scene = new THREE.Scene();
    let renderWidth = 700;
    let renderHeight = 700;
    let camera = new THREE.PerspectiveCamera(75, renderWidth / renderHeight, 0.01, 1000);

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
    let poolTable = getCube(billiardsTableTexture);
    let cueBall = getSphere(cueTexture);

    camera.position.z = 5;
    poolTable.position.set(0, 0, -21);

    let blueBallObject = new Ball(blueBall, new THREE.Vector3(5, -15, -20), 1);
    let redBallObject = new Ball(redBall, new THREE.Vector3(0, -10, -20), 1);
    let greenBallObject = new Ball(greenBall, new THREE.Vector3(-5, -15, -20), 1);
    let cueBallObject = new Ball(cueBall, new THREE.Vector3(0, -20, -20), 1);
    var ballArray = [cueBallObject, blueBallObject, redBallObject, greenBallObject];

    scene.add(blueBall, redBall, greenBall, poolTable, cueBall);

    //For now we are just giving the ball sample translational and rotational velocity
    ballArray[0].ballForce = new THREE.Vector3(0, 5, 0);
    ballArray[1].ballForce = new THREE.Vector3(0, 5, 0);
    ballArray[2].ballForce = new THREE.Vector3(0, 5, 0);
    ballArray[3].ballForce = new THREE.Vector3(0, 5, 0);

    let then = 0;

    function animate(now) {
        now *= 0.001;  // make it seconds
        const delta = now - then;
        then = now;

        //STEP 1
        //We will calculate the forces here

        //Calculating torque due to gravity
        for (let i = 0; i < ballArray.length; i++) {
            let gravFric = ballArray[i].ballVelocity.clone().normalize().negate()
                .multiplyScalar(ballArray[i].ballMass)
                .multiplyScalar(9.8)
                .multiplyScalar(0.4);
            let ballPointVector = new THREE.Vector3(0, 0, -0.5);
            ballArray[i].ballTorque = ballPointVector.cross(gravFric);
        }

        //STEP 2
        //Now we integrate the position of the ball
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].move(delta);
            ballArray[i].rotateInQuaternion(delta);
        }

        //perform collision detection and response here
        // for (let i = 0; i < ballArray.length; i++) {
        //     for (let j = i; j < ballArray.length; j++) {
        //         if (i !== j && getDistanceBetweenMesh(ballArray[i].ballMesh.position, ballArray[j].ballMesh.position) < 1) {
        //             let previousDelta = ballArray[i].ballPreviousDelta;
        //             let ball1 = ballArray[i].ballMesh;
        //             let ball2 = ballArray[j].ballMesh;
        //             let distance = getDistanceBetweenMesh(ball1.position, ball2.position);
        //
        //             //New Delta at which collision was detected
        //             let newDelta = delta;
        //
        //             //These are needed for the search algorithm
        //             let lDelta = previousDelta;
        //             let rDelta = newDelta;
        //             while (distance !== 1) {
        //                 let midDel = (lDelta + rDelta) / 2;
        //                 let ball1DelPos = calculatePositionFromDelta(ballArray[i], midDel);
        //                 let ball2DelPos = calculatePositionFromDelta(ballArray[j], midDel);
        //                 distance = getDistanceBetweenMesh(ball1DelPos, ball2DelPos);
        //                 if (distance < 1) {
        //                     rDelta = midDel;
        //                 } else if (distance > 1) {
        //                     lDelta = midDel;
        //                 } else {
        //                     //The actual delta of collision found
        //                     newDelta = midDel;
        //                     break;
        //                 }
        //             }
        //             //We have the delta at which the collision took place
        //             let ball1CollPos = calculatePositionFromDelta(ballArray[i], newDelta);
        //             let ball2CollPos = calculatePositionFromDelta(ballArray[j], newDelta);
        //
        //             //Find the normal of collision for the ball
        //             let ball1NormalVector = ball2CollPos.sub(ball1CollPos);
        //             let ball2NormalVector = ball1CollPos.sub(ball2CollPos);
        //             let ball1Angle = ballArray[i].ballVelocity.angleTo(ball1NormalVector);
        //             let ball2Angle = ballArray[j].ballVelocity.angleTo(ball2NormalVector);
        //
        //             //Find the velocity along the collision normal
        //             let ball1NormalVelocity = ballArray[i].ballVelocity.dot(ball1NormalVector);
        //             let ball2NormalVelocity = ballArray[j].ballVelocity.dot(ball2NormalVector);
        //             let sumOfNormalVelocitys = ball1NormalVelocity + ball2NormalVelocity;
        //             let diffOfNormalVelocitys = ball1NormalVelocity - ball2NormalVelocity;
        //             let ball2NormalAfter = (sumOfNormalVelocitys + diffOfNormalVelocitys) / 2;
        //             let ball1NormalAfter = (sumOfNormalVelocitys - diffOfNormalVelocitys) / 2;
        //
        //             //Now the new velocity calculation
        //             let ball1AfterVelocityVector = ball1NormalVector.normalize().multiplyScalar(ball1NormalAfter);
        //             let ball2AfterVelocityVector = ball2NormalVector.normalize().multiplyScalar(ball2NormalAfter);
        //             ballArray[i].ballVelocity = ballArray[i].ballVelocity + ball1AfterVelocityVector;
        //             ballArray[j].ballVelocity = ballArray[j].ballVelocity + ball2
        //
        //             AfterVelocityVector;
        //
        //
        //         }
        //     }
        // }

        //Update momentum
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].changeMomentum(delta);
            ballArray[i].changeAngularMomentum(delta);
        }

        //STEP 3
        for (let i = 0; i < ballArray.length; i++) {
            ballArray[i].updateVelocityFromMomentum();
            ballArray[i].updateAngularVelocityFromMomentum();
        }

        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate)
}

main();

function getCube(texture) {
    var geometry = new THREE.BoxGeometry(40, 40, 0.5);
    var material = new THREE.MeshBasicMaterial({map: texture});
    return new THREE.Mesh(geometry, material);
}

function getSphere(texture) {
    var geometry = new THREE.SphereGeometry(1, 20, 20);
    var material = new THREE.MeshBasicMaterial({map: texture});
    return new THREE.Mesh(geometry, material);
}