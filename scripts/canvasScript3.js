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

    var shoulder = new THREE.Bone();
    var elbow = new THREE.Bone();
    var hand = new THREE.Bone();

    shoulder.add(elbow);
    elbow.add(hand);

    bones.push(shoulder);
    bones.push(elbow);
    bones.push(hand);

    shoulder.position.y = 5;
    elbow.position.y = 0;
    hand.position.y = -5;

    shoulder.position.x = -5;
    elbow.position.x = 0;
    hand.position.x = -5;

    shoulder.position.z = -10;
    elbow.position.z = -10;
    hand.position.z = -10;

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

main();