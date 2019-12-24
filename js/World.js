import * as THREE from './three.module.js';
import MouseControls from './MouseControls.js';
import SceneHelper from './SceneHelper.js';
import { Reflector } from './Reflector.js';
import { Physijs } from './physi.js';
import Particles from './Particles.js';
import Particle from './Particle.js';
import Loader from './service/Loader.js';
import BoxItem from './BoxItem.js';
import EventBus from './core/EventBus.js';
import ItemInfo from './ItemInfo.js';
import ProjectDescription from './ProjectDescription.js';
import AppModel from './model/AppModel.js';
import AbstractView from './view/AbstractView.js';

const SPAWN_BOX_INTERVAL = 750;
const boxParticleSize = 1.8;
const mouseupHideTime = 8000;

var lastSelected = null;

class World extends AbstractView {

	constructor() {
		super();
		Physijs.scripts.worker = './js/physijs_worker.js';
		Physijs.scripts.ammo = './ammo.js';

		this.appModel = new AppModel();
		this.renderer =  null;
		this.scene = null;
		this.camera = null;
		this.ratio = window.innerWidth / window.innerHeight;

		this.intersect_plane = new THREE.Mesh( new THREE.PlaneGeometry( 200, 100, 16, 16 ), new THREE.MeshBasicMaterial( { color: 0x00FF00, opacity: 0, transparent: true, wireframe: true } ) );;

		// Loader
		this.loader = new THREE.TextureLoader();
		
		this.data = null;
		this.currentBoxCount = 0;
		this.boxTimer = null;
		this.objects = [];
		this.itemInfoObjects = [];
		this.itemInfo = null;
		this.container = null;	
		this.particleTexture = this.loader.load("images/sparkle2.png");
		
		// Constrains
		this.constrains = null;
		
		this.mouseupTimer = null;
		this.showInfoDelayTimer = null;
				
		this.addListeners();
	}
	
	addListeners() {
		EventBus.subscribe('itemDataLoaded', ( data ) => {
			this.itemDataLoaded( data );
		});
		
		EventBus.subscribe('collision', ( otherObject ) => {
			this.onCollision( otherObject );
		});
		
		EventBus.subscribe(MouseControls.MOUSE_DOWN, ( object ) => {			
			clearTimeout( this.mouseupTimer );	
			lastSelected = object;
			EventBus.publish("getItemData", "http://www.detailed-simplicity.com/getData.php?action=project&id=" +object.userData.id);					
		});
		
		EventBus.subscribe(MouseControls.MOUSE_MOVE, ( object ) => {
			//this.camera.lookAt( object.position );
		});
		
		EventBus.subscribe(MouseControls.MOUSE_UP, ( object ) => {
			clearTimeout( this.mouseUpTimer );
			this.mouseupTimer = setTimeout(() => {
				this.itemInfo.fadeInfo( "fadeOut" );
			}, mouseupHideTime);
		});
		
		EventBus.subscribe('infoButtonClicked', ( data ) => {
			lastSelected.userData.isShowing = true;
			lastSelected.userData.follow = true;
			this.itemInfo.fadeInfo( "fadeOut" );

			setTimeout( ()=> {
				lastSelected.userData.particlesAnimating = false;
				lastSelected.userData.follow = false;
				lastSelected.userData.isShowing = false;
				
				this.camera.lookAt( new THREE.Vector3( 0, 150, 0 ) );
				this.camera.position.set( 0, 150, 75 );
				const description = new ProjectDescription( data, this.camera ).group;
				this.scene.add( description );					
			}, 2000 );
		});
	}

	itemDataLoaded( data ) {
		if ( this.itemInfo ) {
			this.itemInfo.destroy();
			this.itemInfo = null;
		}
		this.itemInfo = new ItemInfo( data, this.camera );
		this.itemInfoObjects = this.itemInfo.group;
		this.scene.add( this.itemInfo.group );		
	}
	
	onCollision(data) {
		if ( data.otherObject.name === "bottomCatcher" ) {
			this.resetBox( data.object );
		}
	}
	
	prepareWorld() {
		let loaded = 0;
		for ( let i = 0; i < this.data.length; i++ ) {
			const prefix = './images/';
			const fullPath = prefix + this.data[i].thumb;
			this.loader.load( fullPath, ( texture )=>{
				this.data[i].sprite = texture;
				loaded ++;
				if ( loaded === this.appModel.maxBoxCount ) {
					this.spawnBox( );
				}
			});
		}
	}
	
	initScene( worldData ) {
		this.data = worldData;
		this.prepareWorld();
		const fov = 45;
		const near = 1;
		const far = 200;
		
		this.container = document.getElementById( 'viewport' );
		
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMapSoft = true;
		this.container.appendChild( this.renderer.domElement );
		
		this.scene = new Physijs.Scene;
		this.scene.setGravity(new THREE.Vector3( 0, -100, 0 ));
		this.scene.addEventListener('update', () => {			
			for (var i = 0; i < this.objects.length; i++) {
				
				if ( !this.objects[i].userData.isShowing ) {
					const vel = this.objects[i].getLinearVelocity();
					vel.z = 0;
					vel.x = (isNaN(vel.x)) ? 1 : vel.x;
					vel.y = (isNaN(vel.y)) ? 1 : vel.y;
					this.objects[i].setLinearVelocity(vel);
					
					if ( this.objects[i].position.y < -100 ) { 
						this.resetBox(this.objects[i]);
					}
				} else {
					var vec3 = new THREE.Vector3(0, 150, 0);
					this.objects[i].setLinearVelocity(vec3);
					this.objects[i].userData.particlesAnimating = true;
					if ( this.objects[i].userData.follow ) {
						this.camera.lookAt( 0, lastSelected.position.y, 0 );
					} 
				}
				for ( var c = 0; c < this.constrains.length; c++ ) {
					if ( this.constrains[c].name === "left") {
						if ( this.objects[i].position.x < this.constrains[c].position.x ) {
							this.resetBox( this.objects[i] );
						}
					} else if ( this.constrains[c].name === "right" ) {
						if ( this.objects[i].position.x > this.constrains[c].position.x ) {
							this.resetBox( this.objects[i] );							
						}
					}
				}
			}
			this.mouseControls.update();
			this.scene.simulate( undefined, 1 );
		});

		// Camera
		this.camera = new THREE.PerspectiveCamera( fov, this.ratio, near, far );
		this.camera.position.set( 0, 25, 75 );
		var sceneVec3 = new THREE.Vector3( 0, 25, 0 );
		this.camera.lookAt( sceneVec3 );
		this.camera.aspect = this.ratio;
		this.scene.add( this.camera );
		
		// Raycast Click pane
		this.intersect_plane.position.y = 55;
		this.intersect_plane.position.z = 3;
		this.scene.add ( this.intersect_plane );
		
		// Light	
		this.addLights();
		// Mirror
		this.scene.add(this.addMirror());
		
		// Constraints
		this.createConstrains();

		this.prepareWorld( worldData );
				
		this.mouseControls = new MouseControls( this.objects, this.camera, this.intersect_plane, this.renderer.domElement, this.container );		
		this.renderer.domElement.addEventListener( 'mousemove', this.mouseControls.handleMouseMove.bind(this.mouseControls), false );
		this.renderer.domElement.addEventListener( 'mousedown', this.mouseControls.handleMouseDown.bind(this.mouseControls), false );		
		this.renderer.domElement.addEventListener( 'mouseup', this.mouseControls.handleMouseUp.bind(this.mouseControls), false );
		
		this.renderer.domElement.addEventListener( 'touchmove', this.mouseControls.handleMouseMove.bind(this.mouseControls), false );
		this.renderer.domElement.addEventListener( 'touchstart', this.mouseControls.handleMouseDown.bind(this.mouseControls), false );
		this.renderer.domElement.addEventListener( 'touchend', this.mouseControls.handleMouseUp.bind(this.mouseControls), false );		

		window.requestAnimationFrame(() => this.render());
		window.addEventListener( 'resize', this.handleResize.bind(this), false );
		this.scene.simulate();
	};

	addLights() {
		const ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
		this.scene.add( ambient );		
		
		const light = new THREE.DirectionalLight( 0xFFFFFF, 1 );
		light.position.set( 0, 100, 5 );
		light.castShadow = true;
		light.shadow.mapSize.width = 512;  // default
		light.shadow.mapSize.height = 512; // default
		light.shadow.camera.left = - 100;
		light.shadow.camera.right = 100;
		light.shadow.camera.near = 0.5;    // default
		light.shadow.camera.far = 500;     // default		
		this.scene.add( light );
		
		const lightLeft = new THREE.DirectionalLight(0xAAAAAA, 0.5 );
		lightLeft.position.set(-25, 50, 5 );
		this.scene.add(lightLeft);
		
		const lightRight = new THREE.DirectionalLight(0xAAAAAA, 0.5 );
		lightRight.position.set(25, 50, 5 );		
		this.scene.add(lightRight);
		
		const frontLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
		frontLight.position.set(0, 10, 100 );
		this.scene.add( frontLight );
		
		//var helper = new THREE.CameraHelper( light.shadow.camera );
		//this.scene.add( helper );		
	}
	
	addMirror() {
		var geometry = new THREE.PlaneBufferGeometry( 200, 400 );
		var mirroredPlane = new Reflector( geometry, {
			clipBias: 0.003,
			textureWidth: window.innerWidth * window.devicePixelRatio,
			textureHeight: window.innerHeight * window.devicePixelRatio,
			color: 0x555555, //889999,
			recursion: 1
		} );
		mirroredPlane.position.y = 5;
		mirroredPlane.rotateX( - Math.PI / 2 );
		return mirroredPlane;
	}
	
	spawnBox( userData ) {
		if (!userData) {
			userData = {
				texture: this.data[this.currentBoxCount].thumb,
				id: this.data[this.currentBoxCount].id,
				sprite: this.data[this.currentBoxCount].sprite
			}
		}
		const box = new BoxItem( userData ).box;		
		
		this.objects.push( box );
		this.scene.add( box );
		this.currentBoxCount ++;		
		
		if (this.currentBoxCount == this.appModel.maxBoxCount) {
			clearTimeout(this.boxTimer);			
		} else {
			this.boxTimer = setTimeout(() => this.spawnBox(), SPAWN_BOX_INTERVAL); 
		}
		
	}
	
	addBoxParticle( obj ) {
		var sprite = this.particleTexture.clone();
		sprite.minFilter = THREE.LinearFilter;
		sprite.needsUpdate = true;
		var particle;
		var numParticles = 1 + Math.random() * 5;
		for (var i = 0; i < numParticles; i++) {
			particle = new Particle( new THREE.PlaneGeometry(boxParticleSize, boxParticleSize), sprite, obj );
			obj.userData.particles.push(particle);
			this.scene.add(particle);
		}
	}
	
	updateBoxParticles( dt ) {
		for (var i = 0; i < this.objects.length; i++) {
			var obj = this.objects[i];
			for (var t = 0; t < obj.userData.particles.length; t++) {
				var tObj = obj.userData.particles[t];
				tObj.userData.motionClass.update( dt );
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
		var newData = {};
	
		for ( let j = 0; j < this.appModel.categoryData.length; j++ ) {
			if ( this.appModel.categoryData[j].id === box.userData.id ) {
				newData = this.appModel.categoryData[j];
			}
			
		}
		const newBox = new BoxItem( newData ).box;		
		this.scene.add( newBox );
		this.objects.push( newBox );
		console.log( box.userData );
		//this.spawnBox( box.userData );
	}
	
	render( dt ) {
		var objects = this.objects;
		var objLen = this.objects.length;

		for ( var i = 0; i < objLen; i++ ) {
			var obj = objects[i];
			
			// Add particles if needed.
			if ( obj.userData.particlesAnimating ) {
				this.addBoxParticle( obj );
			}
		}
		this.updateBoxParticles( dt );		
		this.positionConstrains();
		
		EventBus.publish( "render", { camera: this.camera, dt: dt } );
		
		this.renderer.render( this.scene, this.camera );
		window.requestAnimationFrame(() => this.render() );
	};

	positionConstrains() {
		for ( var i = 0; i < this.constrains.length; i++ ) {
			if ( this.constrains[i].name === "left" ) {
				SceneHelper.positionObject( this.constrains[i], this.camera, -1.09, -1 );
			}
			else if ( this.constrains[i].name === "right" ) {
				SceneHelper.positionObject( this.constrains[i], this.camera, 1, -1 );				
			}
		}
	}
	
	handleResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.renderer.setSize( window.innerWidth, window.innerHeight );		
		this.camera.updateProjectionMatrix();	
		const descriptionText = document.querySelector( '#descriptionText' );
		if ( description ) {
			descriptionText.style.top = ( window.innerHeight / 2.8 ) + 'px';
		}
	}
	
	createConstrains() {
		this.constrains = SceneHelper.createConstrains( this.camera );
		for ( var i = 0; i < this.constrains.length; i++ ) {
			this.scene.add( this.constrains[i] );
		}
	}	
}

const world = new World();
export default world;