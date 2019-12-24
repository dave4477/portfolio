import * as THREE from './three.module.js';
import SceneHelper from './SceneHelper.js';
import Loader from './service/Loader.js';
import EventBus from './core/EventBus.js';
import MouseControls from './MouseControls.js';
import * as TWEEN from './tween.esm.js';


const mouseupHideTime = 2000;

var selectedObject = null;
var raycaster = new THREE.Raycaster();
var mouseVector = new THREE.Vector3();

export default class ProjectDescription {

	constructor( data, camera ) {		
		this.data = data;
		this.loader = new THREE.TextureLoader();
		this.boxTimer = null;
		this.mouseupTimer = null;
		this.showInfoDelayTimer = null;
		this.camera = camera;
		
		this.buttonBack = null;
		this.createDescriptionContainer( data );		
		this.addListeners();		
		this.addInfoMesh( data );
	}
	
	addListeners() {
		EventBus.subscribe( "render", ( obj ) => this.render( obj ));
	}
	
	createDescriptionContainer( data ) {
		this.group = new THREE.Group();
		this.group.userData = data;
		
		this.infoGroup = new THREE.Group();
		this.description = new THREE.Group();
		
		this.group.add( this.infoGroup );
		this.group.add( this.description );
	}
		
	destroy() {
		this.group.parent.remove( this.group );
		this.group = null;
		this.infoGroup = null;
		this.loader = null;
	}
	

	addInfoMesh( serverResponse ) {
		clearTimeout( this.showInfoDelayTimer );
		
		let descriptionText;

		for ( let i = 0; i < serverResponse.length; i++ ) {
			const data = serverResponse[i];
			const imgs = data.img.split( "|" );
			
			descriptionText = data.info;
			
			for ( let j = 0; j < imgs.length; j++ ) {
				const sprite = this.loader.load( imgs[j] );
				sprite.minFilter = THREE.LinearFilter;
				const threeMaterial = new THREE.MeshBasicMaterial( {map: sprite, transparent:true} );
				threeMaterial.map.wrapS = threeMaterial.map.wrapT = THREE.RepeatWrapping;
				threeMaterial.map.repeat.set( 1, 1 );
				threeMaterial.opacity = 1;
				const infoMesh = new THREE.Mesh( new THREE.PlaneGeometry(29, 20), threeMaterial );
				this.infoGroup.add( infoMesh );
				console.log(this.camera);
				this.getSize( infoMesh );
			}
		}
		this.group.position.y = 170;
		this.group.position.x = 0;
		this.camera.lookAt( new THREE.Vector3( 0, 150, 0 ) );
		this.createDescriptionText( descriptionText );
		
		if ( this.infoGroup.children.length ) {
			this.showInfoDelayTimer = setTimeout(() => this.rotateImage( this.infoGroup ), 2000 );
		}

	}
	
	getSize( obj ) {
		var box = new THREE.Box3().setFromObject( obj );
		console.log( box.min, box.max, box.getSize() );
	}
	
	rotateImage( container ) {
		clearTimeout( this.imageTimer );
		var allMesh = container.children;
		for (var i = 0; i < allMesh.length; i++) {
			if (allMesh[i].material) {
				this.tweenObj( allMesh[i], 0 );
			}
		}
		var first = container.children.shift();
		container.children.push( first );
		this.fadeInfo( "fadeIn", first );
		
		this.imageTimer = setTimeout(() => this.rotateImage( container ), 5000 );	
	}
	
	destroyGroups( group ) {	
		const children = group.children;
		for ( let i = children.length; i >= 0; i-- ) {
			this.group.remove( children[i] );
		}
	}	

	backToWorld() {
		this.resetCamera();

		this.destroyAll();
		this.destroy();
	}
	
	destroyAll() {
		clearTimeout( this.imageTimer );		
		const descriptionText = document.getElementById( 'descriptionText' );
		document.body.removeChild( descriptionText );
		this.destroyGroups( this.group );
	}
	
	resetCamera() {
		this.camera.position.set( 0, 25, 75 );
		this.camera.lookAt( new THREE.Vector3( 0, 25, 0 ) );
		this.camera.position.x = 0;
		this.camera.position.y = 25;
		this.camera.position.z = 75;
		console.log(this.camera);
	}

	createDescriptionText( description ) {
		
		const div = document.createElement( "div" );
		div.id = "descriptionText";
		div.className = "descriptionText";
		
		this.buttonBack = document.createElement( "a" );
		this.buttonBack.innerHTML = "Back";
		this.buttonBack.setAttribute( "href", "javascript:void(0)" );
		this.buttonBack.addEventListener('click', this.backToWorld.bind( this ));
		div.innerHTML = description;
		
		div.style.top = ( window.innerHeight / 2.8 ) + 'px';
		
		div.appendChild( this.buttonBack );
		document.body.appendChild( div );
	}
		
	showData() {
		this.addInfoMesh( this.data );
	}
	
	render( obj ) {
		const camera = obj.camera;
		const dt = obj.dt;
		if ( this.info && this.group ) {
			SceneHelper.positionObject( this.group, camera, -0.95, 0.9 );
		}
		TWEEN.default.update( dt );
	}
	
	fadeInfo( direction, obj ) {
		clearTimeout( SceneHelper.fadeTimers[this.info] );
		switch( direction ) {
			case "fadeIn":
				this.tweenObj( obj, 1 );
				break;

			case "fadeOut":
				for ( var i = 0; i < this.group.children.length; i++ ) {
					var mesh = this.group.children[i];
					if (mesh.material) {
						this.tweenObj( mesh, 0 );
					}
				}
				break;

			default:
				console.warn( direction + " is unkonwn. Use fadeIn or fadeOut");
				break;
		}
	}	

	tweenObj( obj, to ) {
		const tween1 = new TWEEN.default.Tween( { opacity: obj.material.opacity } ).to( { opacity: to }, 1000 ).repeat( 0 ).yoyo( false ).onUpdate( ( object ) => {
			obj.material.opacity = object.opacity;
		}).start();						
	}	
	
	
	getScreenPos( el ) {
	}
}