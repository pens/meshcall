'use strict';

/*
    simple-peer / WebRTC    
*/
    
const p = new SimplePeer({
    initiator: true,
    trickle: false
});

let established = false;

p.on('signal', offer => {
    console.log('SIGNAL', JSON.stringify(offer));
    sendOffer(offer);
});

let timeoutId;

/*
    1. Send offer
*/
function sendOffer(offer) {
    fetch('http://localhost:5000/so', {
        method: 'POST',
        body: JSON.stringify(offer)
    }).then(response => {
        pollAnswer();
        response.text().then(text => console.log(text));
    });
}

/*
    4. Keep polling until answer received
*/
function pollAnswer() {
    fetch('http://localhost:5000/ga', {
        method: 'POST'
    }).then(response => {
        if (response.status == 200) {
            response.json().then(answer => {
                console.log(answer);
                p.signal(answer);
            });
        } else {
            window.setTimeout(pollAnswer, 1000);
        }
    });
}

p.on('connect', () => {
    console.log('CONNECT');
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