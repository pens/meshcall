'use strict';

/*
    simple-peer / WebRTC
*/

const p = new SimplePeer({
    initiator: true,
    trickle: false
});

let established = false;

p.on('signal', data => {
    console.log('SIGNAL', JSON.stringify(data));
    document.getElementById('offer').textContent = JSON.stringify(data);
});

document.querySelector('form').addEventListener('submit', ev => {
    ev.preventDefault();
    p.signal(JSON.parse(document.getElementById('answer').value));
});

p.on('connect', () => {
    console.log('CONNECT');
    document.getElementById('send').disabled = false;
    document.getElementById('sendButton').disabled = false;

    document.getElementById('sendButton').onclick = send;
    established = true;
});

function send() {
    p.send(document.getElementById('send').value);
}

/*
    face-api.js
*/

let cam = document.getElementById('webcam');
let prev = Date.now();

async function run() {
    cam.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    
    await faceapi.nets.ssdMobilenetv1.loadFromUri('face-api.js-master/weights/');

    cam.onplaying = onPlaying;
}

async function onPlaying() {
    requestAnimationFrame(onPlaying);

    if (Date.now() - prev > 1 / 6) {
        const result = await faceapi.detectSingleFace(cam);
        
        if (result) {
            const canvas = document.getElementById('overlay')
            const dims = faceapi.matchDimensions(canvas, cam, true)
            faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims))

            const x = result.box.x + result.box.width / 2;
            const y = result.box.y + result.box.height / 2;
            const ox = 320;
            const oy = 360;

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

run();