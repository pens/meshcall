/*
Copyright (c) 2021 Seth Pendergrass. See LICENSE.
*/
"use strict";

/*
simple-peer / WebRTC
*/

const p = new SimplePeer({
  initiator: false,
  trickle: false,
});

p.on("signal", (answer) => {
  console.log("SIGNAL", JSON.stringify(answer));
  sendAnswer(answer);
});

p.on("connect", () => {
  console.log("CONNECT");
});

p.on("data", (data) => {
  //console.log("data: " + data);
  rotate(data);
});

// 2. Keep polling until offer received
pollOffer();

function pollOffer() {
  fetch("http://localhost:5000/go", {
    method: "POST",
  }).then((response) => {
    if (response.status == 200) {
      response.json().then((offer) => {
        console.log(offer);
        p.signal(offer);
      });
    } else {
      window.setTimeout(pollOffer, 1000);
    }
  });
};

// 3. Send answer
function sendAnswer(answer) {
  fetch("http://localhost:5000/sa", {
    method: "POST",
    body: JSON.stringify(answer),
  }).then((response) => {
    response.text().then((text) => console.log(text));
  });
}

/*
  three.js / WebGL
*/

import * as THREE from "./three.module.js";
import { MTLLoader } from "./MTLLoader.js";
import { OBJLoader2 } from "./OBJLoader2.js";
import { MtlObjBridge } from "./obj2/bridge/MtlObjBridge.js";

var camera = new THREE.PerspectiveCamera(45, 4 / 3, 1, 2000);
camera.position.y = 1;
camera.position.z = 5;

var scene = new THREE.Scene();

var ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xffffff, 0.2);
camera.add(pointLight);
scene.add(camera);

var manager = new THREE.LoadingManager();
var face;
new MTLLoader(manager).load("data/suzanne.mtl", function (materials) {
  materials.preload();
  new OBJLoader2(manager)
    .addMaterials(MtlObjBridge.addMaterialsFromMtlLoader(materials))
    .load("data/suzanne.obj", function (object) {
      face = object;
      scene.add(object);

      animate();
    });
});

var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(640, 480);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = 4 / 3;
  camera.updateProjectionMatrix();
  renderer.setSize(640, 480);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function rotate(data) {
  face.rotation.z = parseFloat(data);
}
