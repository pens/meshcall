'use strict';

/*
  simple-peer / WebRTC
*/

const p = new SimplePeer({
	initiator: false,
	trickle: false
});

pollOffer();

/*
	2. Keep polling until offer received
*/
function pollOffer() {
    fetch('http://localhost:5000/go', {
        method: 'POST'
    }).then(response => {
        if (response.status == 200) {
            response.json().then(offer => {
                console.log(offer);
                p.signal(offer);
            });
        } else {
            window.setTimeout(pollOffer, 1000);
        }
    });
}

/*
	3. Send answer
*/
function sendAnswer(answer) {
    fetch('http://localhost:5000/sa', {
        method: 'POST',
        body: JSON.stringify(answer)
    }).then(response => {
        console.log(response.text());
    });
}

p.on('signal', answer => {
	console.log('SIGNAL', JSON.stringify(answer));
	sendAnswer(answer);
});

p.on('connect', () => {
	console.log('CONNECT');
});

p.on('data', data => {
  console.log('data: ' + data);
  rotate(data);
});

/*
  three.js / WebGL
*/

import * as THREE from './js/three.module.js';
import { MTLLoader } from './three.js-r115/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from './three.js-r115/examples/jsm/loaders/OBJLoader.js';

var container;

var camera, scene, renderer;

var face;

init();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, 4 / 3, 1, 2000 );
	camera.position.z = 50;

	// scene

	scene = new THREE.Scene();

	var ambientLight = new THREE.AmbientLight( 0xffffff, .2 );
	scene.add( ambientLight );

	var pointLight = new THREE.PointLight( 0xffffff, .4 );
	camera.add( pointLight );
	scene.add( camera );

	// manager

	var manager = new THREE.LoadingManager();

	new MTLLoader( manager )
		.setPath( 'head/' )
		.load( 'face.mtl', function ( materials ) {

			materials.preload();

			new OBJLoader( manager )
				.setMaterials( materials )
				.setPath( 'head/' )
				.load( 'face.obj', function ( object ) {
					object.position.y -= 10;
					face = object;
					scene.add( object );

					animate();

				});

		} );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( 640, 480 );
	container.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
	camera.aspect = 4 / 3;
	camera.updateProjectionMatrix();

	renderer.setSize( 640, 480 );

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {
	renderer.render( scene, camera );

}

function rotate(data) {
  face.rotation.z = parseFloat(data);
}