
import * as THREE from './three.module.js';
import EventBus from './core/EventBus.js';

export default class MouseControls {
	
	constructor( objects, camera, intersectPlane, domContainer = null ) {
		this.selectedObject = null;
		this.objects = objects;
		this.camera = camera;
		this.vector = new THREE.Vector3();	
		this.intersectPlane = intersectPlane;
		this.mousePosition = new THREE.Vector3();
		this.blockOffset = new THREE.Vector3();
		this.counter = 0;
		this.myVector3 = new THREE.Vector3();
		this.container = domContainer;
	}
	
	setObjects( objects ) {
		this.objects = objects;
	}
	handleMouseDown( e ) {
		var evt;
		const touches = e.targetTouches;
		
		if (touches && touches.length) {
			evt = touches[0];
		} else {
			evt = e;
		}

		var ray;
		var intersections;

		this.vector.set(
			( evt.clientX / window.innerWidth ) * 2 - 1,
			-( evt.clientY / window.innerHeight ) * 2 + 1,
			1
		);

		this.vector.unproject( this.camera );
		
		ray = new THREE.Raycaster( this.camera.position, this.vector.sub( this.camera.position ).normalize() );
		
		intersections = ray.intersectObjects( this.objects );
		
		if ( intersections.length > 0 ) {
			
			this.selectedObject = intersections[0].object;			
			
			this.vector.set( 0, 0, 0 );
			//this.selectedObject.setAngularFactor( this.vector );
			this.selectedObject.setAngularVelocity( this.vector );
			this.selectedObject.setLinearFactor( this.vector );
			this.selectedObject.setLinearVelocity( this.vector );

			this.mousePosition.copy( intersections[0].point );
			this.blockOffset.subVectors( this.selectedObject.position, this.mousePosition );	
			EventBus.publish( MouseControls.MOUSE_DOWN, this.selectedObject );
			if ( this.container ) {
				this.container.style.cursor = "move";
			}
		}
	};
	
	handleMouseMove( e ) {

		var evt;
		const touches = e.targetTouches;
		
		if (touches && touches.length) {
			evt = touches[0];
		} else {
			evt = e;
		}
		
		var ray;
		var intersection;
		var i;
		var scalar;
		
		if ( this.selectedObject !== null ) {
			this.vector.set(
				( evt.clientX / window.innerWidth ) * 2 - 1,
				-( evt.clientY / window.innerHeight ) * 2 + 1,
				1
			);
			this.vector.unproject( this.camera );
			
			ray = new THREE.Raycaster( this.camera.position, this.vector.sub( this.camera.position ).normalize() );
			intersection = ray.intersectObject( this.intersectPlane );
			if (intersection.length) {
				this.mousePosition.copy( intersection[0].point );
			}
			EventBus.publish( MouseControls.MOUSE_MOVE, this.selectedObject );
		} 
	};
	
	handleMouseUp( e ) {

		if ( this.selectedObject !== null ) {
			this.vector.set( 1, 1, 1 );
			//this.selectedObject.setAngularFactor( this.vector );
			this.selectedObject.setLinearFactor( this.vector );

			EventBus.publish( MouseControls.MOUSE_UP, this.selectedObject );

			this.selectedObject = null;
			if (this.container) {
				this.container.style.cursor = "auto";
			}
		}		
	};
	
	update() {
		if ( this.selectedObject !== null) {
			this.myVector3.copy( this.mousePosition ).add( this.blockOffset ).sub( this.selectedObject.position ).multiplyScalar( 25 );
			this.selectedObject.setLinearVelocity( this.myVector3 );	
			// Reactivate all of the blocks
			this.myVector3.set( 0, 0, 0 );
			for ( this.counter = 0; this.counter < this.objects.length; this.counter++ ) {
				this.objects[this.counter].applyCentralImpulse( this.myVector3 );
			}
		}			
	}
}
MouseControls.MOUSE_DOWN = "itemMouseDown";
MouseControls.MOUSE_MOVE = "itemMouseMove";
MouseControls.MOUSE_UP = "itemMouseUp";