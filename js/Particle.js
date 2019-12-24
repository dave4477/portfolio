import * as THREE from './three.module.js';
import Particles from './Particles.js';


export default class Particle {

	/**
	 * Adds particles to an object
	 *
	 * @param {Geometry} geom
	 * @param {Sprite) sprite
	 * @param {Object3D} Object3D
	 */
	constructor( geom, sprite, obj ) {
		this.particle = this.createTextureBoxMesh( geom, sprite );
		this.particle.userData.motionClass = new Particles( this.particle, obj, 1500 );

		return this.particle;
	}
      
	createTextureBoxMesh(geometry, texture) {
		const threeMaterial = new THREE.MeshBasicMaterial( {map: texture, transparent: true} );

		threeMaterial.map.wrapS = threeMaterial.map.wrapT = THREE.RepeatWrapping;
		threeMaterial.map.repeat.set( 1, 1 );
		
		var mesh = new THREE.Mesh( geometry, threeMaterial );
		return mesh;
	}
}