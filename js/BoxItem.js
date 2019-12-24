import * as THREE from './three.module.js';
import MouseControls from './MouseControls.js';
import SceneHelper from './SceneHelper.js';
import { Reflector } from './Reflector.js';
import { Physijs } from './physi.js';
import Particles from './Particles.js';
import Particle from './Particle.js';
import Loader from './service/Loader.js';
import DataRequestController from './controller/DataRequestController.js';
import EventBus from './core/EventBus.js';

const boxParticleDurationMs = 2000;
const mouseupHideTime = 2000;

var dummyResponse = [{"id":"1","thumb":"site40.png"},{"id":"2","thumb":"site2.png"},{"id":"3","thumb":"site3.png"},{"id":"5","thumb":"site5.png"},{"id":"6","thumb":"site6.png"},{"id":"7","thumb":"site7.png"},{"id":"9","thumb":"site9.png"},{"id":"12","thumb":"site12.png"},{"id":"13","thumb":"site13.png"},{"id":"17","thumb":"site17.png"},{"id":"18","thumb":"site18.png"},{"id":"25","thumb":"site25.png"},{"id":"27","thumb":"site27.png"},{"id":"28","thumb":"site28.png"},{"id":"30","thumb":"site30.png"},{"id":"31","thumb":"site31.png"}];
var dummyProject = [{"img":".\/images\/sites\/site30.jpg|.\/images\/sites\/site30b.jpg","client":"OpenBet","projecttype":"Flash Game, slot machine","projectname":"Jungle Bucks","info":"<p>Jungle Bucks is a slot machine written in ActionScript 3. The game has several bonus games like the ostrich race, rampant rhino where a rhino bashes the reels and replaces icons, a monkey swinging by and changing the icons, free spins and more.<\/p>\r\n<p>&nbsp;<\/p>\r\n<p>This game is a conversion of the land based slot machine which can be found on the floor of some casinos, and now features on many online gambling sites.<\/p>\r\n<p>&nbsp;<\/p>\r\n<p>As lead developer I did most of the front-end as well the server integration<\/p>","url":"http:\/\/openbet.idealservers.co.uk\/pkg\/fog\/Servlet\/launch.jsp?gameName=JungleBucks","role":"ActionScript (Lead Developer)","date":"September 2012"}]

let particleTex =  new THREE.TextureLoader().load('images/sparkle2.png');

export default class BoxItem {

	constructor( userData ) {
		// Loader
		this.loader = new THREE.TextureLoader();
		this.data = userData;
		this.texture = this.data.sprite.clone();
		this.maxBoxCount = dummyResponse.length;
		this.boxTimer = null;
		this.objects = [];
		this.container = null;	
		this.particleTexture = particleTex; //this.loader.load("images/sparkle2.png");
		this.mouseupTimer = null;
		this.box = this.spawnBox();
	}
	
	spawnBox() {
		this.box_geometry = new THREE.BoxGeometry( 6, 6, 6 );
		return this.createBox();
	}
	
	createBox() {		
		const userData = this.data;
		
		console.log("userData:", userData);
		const imgPath = './images/';
		const img = userData && userData.texture;
		const id = userData && userData.id;
		const fullPath = imgPath + img;
		const material = Physijs.createMaterial(
			new THREE.MeshStandardMaterial({ map: userData.sprite, roughness: 0.46 }),
			//new THREE.MeshLambertMaterial({ map: this.loader.load( fullPath ) }),
			.3, // friction
			.6 // restitution
		);
		material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
		material.map.repeat.set( 1, 1 );

		const box = new Physijs.BoxMesh( this.box_geometry, material );
		box.name = "box";
		box.collisions = 0;
		box.receiveShadow = true;
		box.castShadow = true;		
		box.setLinearVelocity( 1, 1, 0 );
		box.position.set( Math.random() * 15 - 7.5, 75, 0 );		
		box.rotation.set( 0, 0, 0 );
		box.mass = 1;
		box.setCcdMotionThreshold( 6 );
		box.setCcdSweptSphereRadius( 2 );
		box.userData.particles = [];
		box.userData.texture = img;
		box.userData.id = id;
		box.addEventListener( 'collision', function( otherObject ) {
			EventBus.publish("collision", { object: box, otherObject: otherObject });
		}.bind(this));
		box.userData.particlesAnimating = true;
		setTimeout(() => {
			box.userData.particlesAnimating = false;
		}, boxParticleDurationMs );
		
		return box;
	}
		
	addBoxParticle( obj ) {
		var sprite = this.particleTexture.clone();
		sprite.minFilter = THREE.LinearFilter;
		sprite.needsUpdate = true;
		var particle;
		var numParticles = Math.random() * 5;
		for (var i = 0; i < numParticles; i++) {
			particle = new Particle( new THREE.PlaneGeometry(2.4, 2.4), sprite, obj );
			obj.userData.particles.push(particle);
			this.scene.add(particle);
		}
	}
	
	updateBoxParticles() {
		for (var i = 0; i < this.objects.length; i++) {
			var obj = this.objects[i];
			for (var t = 0; t < obj.userData.particles.length; t++) {
				var tObj = obj.userData.particles[t];
				tObj.userData.motionClass.update();
			}
		}			
	}
	
	resetBox( box ) {
		box.setLinearVelocity( 0, 0, 0 );		
		for ( var i = 0; i < this.objects.length; i++) {
			if (box === this.objects[i]) {
				box.particlesAnimating = false;
				// remove particles if any.
				for ( var p = 0; p < box.userData.particles.length; p++ ) {
					this.scene.remove( box.userData.particles[p] );
				}
				box.userData.particles = [];
				this.objects.splice( i, 1 );
			}
		}
		this.scene.remove(box);	
		var newBox = this.createBox( box.userData );
	}
}
