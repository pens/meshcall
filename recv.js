'use strict';

/*
  simple-peer / WebRTC
*/

const p = new SimplePeer({
	initiator: false,
	trickle: false
});

//p.on('error', err => console.log('error', err));

p.on('signal', data => {
	console.log('SIGNAL', JSON.stringify(data));
	document.getElementById('answer').textContent = JSON.stringify(data);
});

document.querySelector('form').addEventListener('submit', ev => {
	ev.preventDefault();
	p.signal(JSON.parse(document.getElementById('offer').value));
});

p.on('connect', () => {
	console.log('CONNECT');
});

p.on('data', data => {
  console.log('data: ' + data);
  document.getElementById('recv').value = data;
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