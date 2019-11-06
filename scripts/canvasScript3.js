class JointNode {
    constructor() {
        this.offsets = [];
        this.name = "";
        this.channelHeads = [];
        this.channelValues = [];
        this.isEndSite = false;
        this.endSiteLength = [];
        this.children = [];
    }
}

class Hierarchy {
    constructor() {
        this.root = null;
    }
}

function processMotion(bvhArray, indexToProcess) {
    let index = indexToProcess;
    while (index < bvhArray.length()) {
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
                jointNode.offsets.push(parseInt(bvhArray[index]));
            }

            index++;
            while (bvhArray[index] !== "CHANNELS") {
                index++;
            }

            index++;
            let channelSize = parseInt(bvhArray[index]);
            for (let i = 0; i < channelSize; i++) {
                index++;
                jointNode.channelHeads.push(parseInt(bvhArray[index]));
            }

            index++;
            while (bvhArray[index] !== "}") {
                if (bvhArray[index] === "JOINT") {
                    let resultArray = processMotion(bvhArray, index);
                    index = resultArray[0];
                    jointNode.children.push(resultArray[1]);
                } else {
                    index++;
                }
            }

            return [index + 1, jointNode];
        }
        index++;
    }
}

function main() {
    let width = 500;
    let height = 500;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 500);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});

    camera.position.z = 5;


    //The skeleton creation starts here
    var bones = [];

    var hips = new THREE.Bone();
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
    bones.push(rightFoot);


    //Let us process the file
    let bvhTabArray = bvhString.replace(/\t/g, "??")
        .replace(/\n/g, "??")
        .replace(/\s/g, "??")
        .split(/[?]+/g);
    let stringIndex = 0;
    //First let us create a hierarchy object
    let hierarchy = new Hierarchy();
    while (stringIndex < bvhTabArray.length) {
        if (bvhTabArray[stringIndex] === "HIERARCHY") {
            let resultArray = processMotion(bvhTabArray, stringIndex + 1);
            stringIndex = resultArray[0];
            hierarchy.root = resultArray[1];
        }
    }

    var helper = new THREE.SkeletonHelper(bones[0]);
    helper.material.linewidth = 5;

    var boneContainer = new THREE.Group();
    boneContainer.add(bones[0]);
    scene.add(boneContainer);

    scene.add(helper);


    var animate = function () {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    };

    animate();
}

var bvhString = "" +
    "HIERARCHY\n" +
    "ROOT Hips\n" +
    "{\n" +
    "\tOFFSET\t0.00\t0.00\t0.00\n" +
    "\tCHANNELS 6 Xposition Yposition Zposition Zrotation Xrotation Yrotation\n" +
    "\tJOINT Chest\n" +
    "\t{\n" +
    "\t\tOFFSET\t 0.00\t 5.21\t 0.00\n" +
    "\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\tJOINT Neck\n" +
    "\t\t{\n" +
    "\t\t\tOFFSET\t 0.00\t 18.65\t 0.00\n" +
    "\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\tJOINT Head\n" +
    "\t\t\t{\n" +
    "\t\t\t\tOFFSET\t 0.00\t 5.45\t 0.00\n" +
    "\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\tEnd Site\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\tOFFSET\t 0.00\t 3.87\t 0.00\n" +
    "\t\t\t\t}\n" +
    "\t\t\t}\n" +
    "\t\t}\n" +
    "\t\tJOINT LeftCollar\n" +
    "\t\t{\n" +
    "\t\t\tOFFSET\t 1.12\t 16.23\t 1.87\n" +
    "\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\tJOINT LeftUpArm\n" +
    "\t\t\t{\n" +
    "\t\t\t\tOFFSET\t 5.54\t 0.00\t 0.00\n" +
    "\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\tJOINT LeftLowArm\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\tOFFSET\t 0.00\t-11.96\t 0.00\n" +
    "\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\t\tJOINT LeftHand\n" +
    "\t\t\t\t\t{\n" +
    "\t\t\t\t\t\tOFFSET\t 0.00\t-9.93\t 0.00\n" +
    "\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\t\t\tEnd Site\n" +
    "\t\t\t\t\t\t{\n" +
    "\t\t\t\t\t\t\tOFFSET\t 0.00\t-7.00\t 0.00\n" +
    "\t\t\t\t\t\t}\n" +
    "\t\t\t\t\t}\n" +
    "\t\t\t\t}\n" +
    "\t\t\t}\n" +
    "\t\t}\n" +
    "\t\tJOINT RightCollar\n" +
    "\t\t{\n" +
    "\t\t\tOFFSET\t-1.12\t 16.23\t 1.87\n" +
    "\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\tJOINT RightUpArm\n" +
    "\t\t\t{\n" +
    "\t\t\t\tOFFSET\t-6.07\t 0.00\t 0.00\n" +
    "\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\tJOINT RightLowArm\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\tOFFSET\t 0.00\t-11.82\t 0.00\n" +
    "\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\t\tJOINT RightHand\n" +
    "\t\t\t\t\t{\n" +
    "\t\t\t\t\t\tOFFSET\t 0.00\t-10.65\t 0.00\n" +
    "\t\t\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\t\t\tEnd Site\n" +
    "\t\t\t\t\t\t{\n" +
    "\t\t\t\t\t\t\tOFFSET\t 0.00\t-7.00\t 0.00\n" +
    "\t\t\t\t\t\t}\n" +
    "\t\t\t\t\t}\n" +
    "\t\t\t\t}\n" +
    "\t\t\t}\n" +
    "\t\t}\n" +
    "\t}\n" +
    "\tJOINT LeftUpLeg\n" +
    "\t{\n" +
    "\t\tOFFSET\t 3.91\t 0.00\t 0.00\n" +
    "\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\tJOINT LeftLowLeg\n" +
    "\t\t{\n" +
    "\t\t\tOFFSET\t 0.00\t-18.34\t 0.00\n" +
    "\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\tJOINT LeftFoot\n" +
    "\t\t\t{\n" +
    "\t\t\t\tOFFSET\t 0.00\t-17.37\t 0.00\n" +
    "\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\tEnd Site\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\tOFFSET\t 0.00\t-3.46\t 0.00\n" +
    "\t\t\t\t}\n" +
    "\t\t\t}\n" +
    "\t\t}\n" +
    "\t}\n" +
    "\tJOINT RightUpLeg\n" +
    "\t{\n" +
    "\t\tOFFSET\t-3.91\t 0.00\t 0.00\n" +
    "\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\tJOINT RightLowLeg\n" +
    "\t\t{\n" +
    "\t\t\tOFFSET\t 0.00\t-17.63\t 0.00\n" +
    "\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\tJOINT RightFoot\n" +
    "\t\t\t{\n" +
    "\t\t\t\tOFFSET\t 0.00\t-17.14\t 0.00\n" +
    "\t\t\t\tCHANNELS 3 Zrotation Xrotation Yrotation\n" +
    "\t\t\t\tEnd Site\n" +
    "\t\t\t\t{\n" +
    "\t\t\t\t\tOFFSET\t 0.00\t-3.75\t 0.00\n" +
    "\t\t\t\t}\n" +
    "\t\t\t}\n" +
    "\t\t}\n" +
    "\t}\n" +
    "}\n" +
    "MOTION\n" +
    "Frames:    2\n" +
    "Frame Time: 0.033333\n" +
    " 8.03\t 35.01\t 88.36\t-3.41\t 14.78\t-164.35\t 13.09\t 40.30\t-24.60\t 7.88\t 43.80\t 0.00\t-3.61\t-41.45\t 5.82\t 10.08\t 0.00\t 10.21\t 97.95\t-23.53\t-2.14\t-101.86\t-80.77\t-98.91\t 0.69\t 0.03\t 0.00\t-14.04\t 0.00\t-10.50\t-85.52\t-13.72\t-102.93\t 61.91\t-61.18\t 65.18\t-1.57\t 0.69\t 0.02\t 15.00\t 22.78\t-5.92\t 14.93\t 49.99\t 6.60\t 0.00\t-1.14\t 0.00\t-16.58\t-10.51\t-3.11\t 15.38\t 52.66\t-21.80\t 0.00\t-23.95\t 0.00\n" +
    " 7.81\t 35.10\t 86.47\t-3.78\t 12.94\t-166.97\t 12.64\t 42.57\t-22.34\t 7.67\t 43.61\t 0.00\t-4.23\t-41.41\t 4.89\t 19.10\t 0.00\t 4.16\t 93.12\t-9.69\t-9.43\t 132.67\t-81.86\t 136.80\t 0.70\t 0.37\t 0.00\t-8.62\t 0.00\t-21.82\t-87.31\t-27.57\t-100.09\t 56.17\t-61.56\t 58.72\t-1.63\t 0.95\t 0.03\t 13.16\t 15.44\t-3.56\t 7.97\t 59.29\t 4.97\t 0.00\t 1.64\t 0.00\t-17.18\t-10.02\t-3.08\t 13.56\t 53.38\t-18.07\t 0.00\t-25.93\t 0.00";

main();