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

export default class ItemInfo {

	constructor( data, camera ) {		
		this.data = data;
		this.loader = new THREE.TextureLoader();
		this.boxTimer = null;
		this.mouseupTimer = null;
		this.showInfoDelayTimer = null;
		this.camera = camera;
		
		this.createInfoContainer( data );		
		this.addListeners();		
	}
	
	addListeners() {
		window.addEventListener( "mousedown", this.onDocumentMouseMove.bind(this), false );
		EventBus.subscribe( "render", ( obj ) => this.render( obj ));
	}
	
	createInfoContainer( data ) {
		this.group = new THREE.Group();
		this.group.userData = data;
		this.group.add( this.showInfoIcon() );
		this.group.add( this.addProjectName( data ) );
		this.group.add( this.addLink() );	
	}
	
	destroyInfo() {	
		const children = this.group.children;
		for ( let i = children.length; i >= 0; i-- ) {
			this.group.remove( children[i] );
		}
	}
	
	destroy() {
		this.destroyInfo();
		this.group.parent.remove( this.group );
		this.group = null;
		this.infoGroup = null;
		this.loader = null;
	}
	
	addProjectName( serverResponse ) {
		for ( let i = 0; i < serverResponse.length; i++ ) {
			const data = serverResponse[i];
			const mesh = SceneHelper.createText( data.projectname, { fontSize:34, fontFace:"Arial", color:"rgba(186,188,204,1)" } );

			this.infoText = mesh;
			mesh.position.y = -1;
			mesh.position.x = 11;
			
			return mesh;
		}
	}
	
	addLink() {
		const mesh = SceneHelper.createText( "view project", { fontSize:26, fontFace:"Arial", color: "rgba(255,255,255,1)" } );
		mesh.position.x = 8;
		mesh.position.y = -2.5;
		return mesh;

	}
		
	showData() {
		this.fadeInfo( "fadeOut" );
		console.log("show data:", this.data);
	}
	
	render( obj ) {
		const camera = obj.camera;
		const dt = obj.dt;
		if ( this.info && this.group ) {
			SceneHelper.positionObject( this.group, camera, -0.95, 0.9 );
		}
		TWEEN.default.update( dt );
	};
	

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

	showInfoIcon() {
		var sprite;
		
		if ( !ItemInfo.sprites['images/info.png'] ) {
			sprite = this.loader.load( 'images/info.png' );
			ItemInfo.sprites['images/info.png'] = sprite;
		} else {
			sprite = ItemInfo.sprites['images/info.png'];
		}
		sprite.minFilter = THREE.LinearFilter;
		const threeMaterial = new THREE.MeshBasicMaterial( {map: sprite, transparent: true} );
		threeMaterial.map.wrapS = threeMaterial.map.wrapT = THREE.RepeatWrapping;
		threeMaterial.map.repeat.set( 1, 1 );
		
		var mesh = new THREE.Mesh( new THREE.PlaneGeometry(3, 3), threeMaterial );
		mesh.name = "info";

		mesh.rotation.z = 0.6;
		mesh.material.opacity = 1;
		this.info = mesh;
		return mesh;
	}
	

	onDocumentMouseMove( event ) {
		event.preventDefault();
		
		if ( selectedObject ) {
			//selectedObject.material.color.set( '#69f' );
			selectedObject = null;
		}

		try {
			var intersects = this.getIntersects( event.layerX, event.layerY );
			if ( intersects.length > 0 ) {
				var res = intersects.filter( function ( res ) {
					return res && res.object;
				} )[ 0 ];

				if ( res && res.object ) {
					selectedObject = res.object;
					//selectedObject.material.color.set( '#f00' );
					EventBus.publish( "infoButtonClicked", selectedObject.parent.userData );
				}
			}
		} catch( err ) {
			// should do something here.
		}
	}

	getIntersects( x, y ) {
		x = ( x / window.innerWidth ) * 2 - 1;
		y = - ( y / window.innerHeight ) * 2 + 1;

		mouseVector.set( x, y, 0.5 );
		raycaster.setFromCamera( mouseVector, this.camera );
		return raycaster.intersectObject( this.group, true );
	}	
}
ItemInfo.sprites = {};