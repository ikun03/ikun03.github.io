import {bvh1} from "../framework/BvhFiles/bvh1.js";

function degToRad(number) {
    return number * Math.PI / 180;
}

class JointNode {
    constructor() {
        this.offsets = [];
        this.name = "";
        this.channelHeads = [];
        this.channelValues = [];
        this.isEndSite = false;
        this.endSiteLength = [];
        this.children = [];
        this.bonesIndex = 0;
    }
}

class Hierarchy {
    constructor() {
        this.root = null;
    }
}

function processMotion(bvhArray, indexToProcess) {
    let index = indexToProcess;
    while (index < bvhArray.length) {
        //Let us then add it a RootNode and process it
        if (bvhArray[index] === "ROOT" || bvhArray[index] === "JOINT") {
            index++;
            let jointNode = new JointNode();
            jointNode.name = bvhArray[index];

            index++;
            while (bvhArray[index] !== "OFFSET") {
                index++;
            }

            for (let i = 0; i < 3; i++) {
                index++;
                jointNode.offsets.push(parseFloat(bvhArray[index]));
            }

            index++;
            while (bvhArray[index] !== "CHANNELS") {
                index++;
            }

            index++;
            let channelSize = parseFloat(bvhArray[index]);
            for (let i = 0; i < channelSize; i++) {
                index++;
                jointNode.channelHeads.push(bvhArray[index]);
            }

            index++;
            while (bvhArray[index] !== "}") {
                if (bvhArray[index] === "JOINT") {
                    let resultArray = processMotion(bvhArray, index);
                    index = resultArray[0];
                    jointNode.children.push(resultArray[1]);
                } else if (bvhArray[index] === "End" && bvhArray[index + 1] === "Site") {
                    jointNode.isEndSite = true;
                    while (bvhArray[index] !== "OFFSET") {
                        index++;
                    }
                    for (let i = 0; i < 3; i++) {
                        index++;
                        jointNode.endSiteLength.push(parseFloat(bvhArray[index]));
                    }
                    while (bvhArray[index] !== "}") {
                        index++;
                    }
                    index++;
                } else {
                    index++;
                }
            }

            return [index + 1, jointNode];
        }
        index++;
    }
}

function processHierarchyToBoneArray(jointNode, boneIndex, bones, parentBone) {
//Now let us process the hierarchy and add it to the bones
    let jointBone = new THREE.Bone();
    jointNode.bonesIndex = boneIndex;
    bones.push(jointBone);

    if (parentBone != null) {
        parentBone.add(jointBone);
        jointBone.position.x = jointNode.offsets[0];
        jointBone.position.y = jointNode.offsets[1];
        jointBone.position.z = jointNode.offsets[2];
    }

    if (jointNode.isEndSite) {
        let newBone = new THREE.Bone();
        jointBone.add(newBone);
        newBone.position.x = jointNode.endSiteLength[0];
        newBone.position.y = jointNode.endSiteLength[1];
        newBone.position.z = jointNode.endSiteLength[2];
        return boneIndex;
    }

    for (let i = 0; i < jointNode.children.length; i++) {
        boneIndex = processHierarchyToBoneArray(jointNode.children[i], boneIndex + 1, bones, jointBone);
    }
    return boneIndex;
}

function main() {
    let width = 500;
    let height = 500;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, -1000);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 150;
    camera.position.x = 0;
    camera.position.y = 150;
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    /*var hips = new THREE.Bone();
    var chest = new THREE.Bone();
    var neck = new THREE.Bone();
    var head = new THREE.Bone();
    var leftCollar = new THREE.Bone();
    var leftUpArm = new THREE.Bone();
    var leftLowArm = new THREE.Bone();
    var leftHand = new THREE.Bone();
    var rightCollar = new THREE.Bone();
    var rightUpArm = new THREE.Bone();
    var rightLowArm = new THREE.Bone();
    var rightHand = new THREE.Bone();
    var leftUpLeg = new THREE.Bone();
    var leftLowLeg = new THREE.Bone();
    var leftFoot = new THREE.Bone();
    var rightUpLeg = new THREE.Bone();
    var rightLowLeg = new THREE.Bone();
    var rightFoot = new THREE.Bone();

    hips.add(chest);
    hips.add(leftUpLeg);
    hips.add(rightUpLeg);

    chest.add(neck);
    chest.add(leftCollar);
    chest.add(rightCollar);

    neck.add(head);

    leftCollar.add(leftUpArm);
    leftUpArm.add(leftLowArm);
    leftLowArm.add(leftHand);

    rightCollar.add(rightUpArm);
    rightUpArm.add(rightLowArm);
    rightLowArm.add(rightHand);

    leftUpLeg.add(leftLowLeg);
    leftLowLeg.add(leftFoot);

    rightUpLeg.add(rightLowLeg);
    rightLowLeg.add(rightFoot);

    bones.push(hips);
    bones.push(chest);
    bones.push(neck);
    bones.push(head);
    bones.push(leftCollar);
    bones.push(leftUpArm);
    bones.push(leftLowArm);
    bones.push(leftHand);
    bones.push(rightCollar);
    bones.push(rightUpArm);
    bones.push(rightLowArm);
    bones.push(rightHand);
    bones.push(leftUpLeg);
    bones.push(leftLowLeg);
    bones.push(leftFoot);
    bones.push(rightUpLeg);
    bones.push(rightLowLeg);
    bones.push(rightFoot);*/


    //Let us process the file
    let bvhTabArray = bvh1.replace(/\t|\n|\s/g, "??")
    //.replace(/\n/g, "??")
    //.replace(/\s/g, "??")
        .split(/[?]+/g);
    let stringIndex = 0;
    //First let us create a hierarchy object
    let hierarchy = new Hierarchy();
    while (stringIndex < bvhTabArray.length) {
        if (bvhTabArray[stringIndex] === "HIERARCHY") {
            let resultArray = processMotion(bvhTabArray, stringIndex + 1);
            stringIndex = resultArray[0];
            hierarchy.root = resultArray[1];
        } else if (bvhTabArray[stringIndex] === "MOTION") {
            break;
        } else {
            stringIndex++;
        }
    }

    //The skeleton creation starts here
    let bones = [];
    let boneIndex = 0;
    boneIndex = processHierarchyToBoneArray(hierarchy.root, boneIndex, bones, null);

    while (bvhTabArray[stringIndex] !== "Frames:") {
        stringIndex++;
    }
    stringIndex++;
    let noOfFrames = parseInt(bvhTabArray[stringIndex]);

    stringIndex++;
    while (bvhTabArray[stringIndex] !== "Time:") {
        stringIndex++;
    }

    stringIndex++;
    let frameTime = parseFloat(bvhTabArray[stringIndex]);
    stringIndex++;
    const startIndex = stringIndex;
    let totalValuesInLine = 6 + boneIndex * 3;

    var helper = new THREE.SkeletonHelper(bones[0]);
    helper.material.linewidth = 5;

    var boneContainer = new THREE.Group();
    boneContainer.add(bones[0]);
    scene.add(boneContainer);
    scene.add(helper);

    let then = 0;
    let calcTime = 0;

    function animate(now) {
        now *= 0.001;  // make it seconds
        const delta = now - then;
        then = now;
        calcTime += delta;
        if (calcTime >= frameTime) {
            bones[0].position.x = parseFloat(bvhTabArray[stringIndex]);
            stringIndex++;
            bones[0].position.y = parseFloat(bvhTabArray[stringIndex]);
            stringIndex++;
            bones[0].position.z = parseFloat(bvhTabArray[stringIndex]);
            stringIndex++;
            let counter = 0;
            while (counter < bones.length) {
                // let euler = new THREE.Euler(degToRad(parseFloat(bvhTabArray[stringIndex])),
                //     degToRad(parseFloat(bvhTabArray[stringIndex + 1])),
                //     degToRad(parseFloat(bvhTabArray[stringIndex + 2])), 'ZXY');
                // bones[counter].setRotationFromEuler(euler);
                bones[counter].rotateZ(degToRad(parseFloat(bvhTabArray[stringIndex])));
                bones[counter].rotateX(degToRad(parseFloat(bvhTabArray[stringIndex + 1])));
                bones[counter].rotateY(degToRad(parseFloat(bvhTabArray[stringIndex + 2])));
                stringIndex += 3;
                counter++;
            }
            if (stringIndex === bvhTabArray.length - 1) {
                stringIndex = startIndex;
            }
            calcTime = 0;
        }
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
}


main();