/*
Copyright (c) 2021 Seth Pendergrass. See LICENSE.
*/
"use strict";

/*
simple-peer / WebRTC
*/

const p = new SimplePeer({
  initiator: true,
  trickle: false,
});

let established = false;

p.on("signal", (offer) => {
  console.log("SIGNAL", JSON.stringify(offer));
  sendOffer(offer);
});

p.on("connect", () => {
  console.log("CONNECT");
  established = true;
});

// 1. Send offer
function sendOffer(offer) {
  fetch("http://localhost:5000/so", {
    method: "POST",
    body: JSON.stringify(offer),
  }).then((response) => {
    pollAnswer();
    response.text().then((text) => console.log(text));
  });
}

// 4. Keep polling until answer received
function pollAnswer() {
  fetch("http://localhost:5000/ga", {
    method: "POST",
  }).then((response) => {
    if (response.status == 200) {
      response.json().then((answer) => {
        console.log(answer);
        p.signal(answer);
      });
    } else {
      window.setTimeout(pollAnswer, 1000);
    }
  });
}

// 5. Send data
function send() {
  p.send(document.getElementById("send").value);
}

/*
    face-api.js
*/

let cam = document.querySelector("video");
let prev = Date.now();

run();

async function run() {
  await faceapi.loadTinyFaceDetectorModel("js/weights");
  await faceapi.loadFaceLandmarkTinyModel("js/weights");

  cam.addEventListener("playing", onPlaying, false);
  cam.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
}

async function onPlaying() {
  requestAnimationFrame(onPlaying);

  if (Date.now() - prev > 1 / 6) {
    const result = await faceapi
      .detectSingleFace(cam, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true);

    if (result) {
      const canvas = document.querySelector("canvas");
      const dims = faceapi.matchDimensions(canvas, cam, true);
      const resizedResults = faceapi.resizeResults(result, dims);
      faceapi.draw.drawDetections(canvas, resizedResults);
      faceapi.draw.drawFaceLandmarks(canvas, resizedResults);

      const aligned = result.alignedRect.box;
      const x = aligned.x + aligned.width / 2;
      const y = aligned.y + aligned.height / 2;
      const ox = cam.videoWidth / 2;
      const oy = cam.videoHeight;

      const dx = x - ox;
      const dy = y - oy;

      const nx = dx / Math.sqrt(dx * dx + dy * dy);
      const ny = dy / Math.sqrt(dx * dx + dy * dy);

      const dp = nx * 0 + ny * -1;
      let r = Math.acos(dp);
      if (dx > 0) r = -r;

      if (established) {
        p.send(r);
      }
    }

    prev = Date.now();
  }
}