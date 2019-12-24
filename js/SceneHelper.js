

import * as THREE from './three.module.js';
export default class SceneHelper {

	constructor() {

	}
	
	/**
	 * Creates a 3D object with basic material.
	 * @param BoxGeometry {THREE.BoxGeometry} The geomotry in x, y and z
	 * @param settings { Object } settings for this object:
	 * 		{
	 *			color: 0x00ff00,
	 *			transparent: false,
	 *			opacity: 1,
	 *			wireframe: false,
	 *			friction: 0.5,
	 *			restitution: 0.5
	 *		}
	 */
	static createStaticBoxMesh(boxGeom, settings) {
		const baseMaterial = Physijs.createMaterial(
			new THREE.MeshBasicMaterial( {
				color: settings.color || 0x000000, 
				side: THREE.DoubleSide, 
				transparent: settings.transparent || false, 
				opacity: settings.opacity || 1, 
				wireframe: settings.wireframe || false
			}),
			settings.friction || 0.5, 
			settings.restitution || 0.5 
		);		
		return new Physijs.BoxMesh(
			boxGeom,
			baseMaterial,
			0
		);
	}
	

	static createTextureBoxMesh(geometry, texture) {
		var threeMaterial = new THREE.MeshBasicMaterial( {map: texture, transparent: true} );

		threeMaterial.map.wrapS = threeMaterial.map.wrapT = THREE.RepeatWrapping;
		threeMaterial.map.repeat.set( 1, 1 );
		
		var mesh = new THREE.Mesh( geometry, threeMaterial );
		return mesh;
	}
	
	static createStaticGradientBoxMesh(boxGeom, settings, name = "staticObject") {
		var material = new THREE.ShaderMaterial({
		  uniforms: {
			color1: {
			  value: new THREE.Color(settings.color1)
			},
			color2: {
			  value: new THREE.Color(settings.color2)
			}
		  },
		  vertexShader: `
			varying vec2 vUv;

			void main() {
			  vUv = uv;
			  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
			}
		  `,
		  fragmentShader: `
			uniform vec3 color1;
			uniform vec3 color2;
		  
			varying vec2 vUv;
			
			void main() {
			  
			  gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
			}
		  `,
		  wireframe: false
		})
		return new Physijs.BoxMesh(
			boxGeom,
			material,
			0
		);		
	}
	
	static createConstrains( camera ) {
		const constrains = [];
		
		const bottom_catcher = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(8000, 100, 8000), { color:0xff0000 } );
		bottom_catcher.position.y = -75;
		bottom_catcher.visible = false;
		bottom_catcher.name = "bottomCatcher";

		constrains.push( bottom_catcher );
		
		const ground = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(200, 10, 150), { color:0x0000ff, opacity:0.2, friction:0.4, restitution:0.8 } );
		ground.receiveShadow = true;
		ground.name = "ground";
		ground.position.y = 0;
		ground.visible = false;

		constrains.push( ground );
		
		const gradient = SceneHelper.createStaticGradientBoxMesh( new THREE.BoxGeometry(200, 1, 100), { color1:0x8789FF, color2:0x000000 } );
		gradient.rotation.x = 90 * (Math.PI / 180);
		gradient.position.z = -10;
		gradient.position.y = 25;
		gradient.visible = true;

		constrains.push( gradient );

		// wall		
		const wall = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(200, 10, 3000), { color:0x0000ff } );
		wall.rotation.x = 90 * (Math.PI / 180);
		wall.position.z = -8;
		wall.visible = false;

		constrains.push( wall );

		const front = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(200, 10, 3000), { color:0x0000ff, wireframe:true } );
		front.rotation.x = 90 * (Math.PI / 180);
		front.position.z = 8;
		front.visible = false;

		constrains.push( front );
		
		const left = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(100, 1, 3000), { color:0x00ff00 } );
		left.rotation.x = 90 * (Math.PI / 180);
		left.rotation.z = 60 * (Math.PI / 180);	
		left.position.z = 8;
		left.position.x = -65; //-1 * (SceneHelper.visibleWidthAtZDepth( 0, camera ) / 2) -5; //-62;
		left.visible = false;
		left.name = "left";

		constrains.push( left );
		
		const right = SceneHelper.createStaticBoxMesh( new THREE.BoxGeometry(100, 1, 3000), {  } );
		right.rotation.x = 90 * (Math.PI / 180);
		right.rotation.z = 120 * (Math.PI / 180);	
		right.position.z = 8;
		right.position.x = 65; //SceneHelper.visibleWidthAtZDepth( 0, camera ) / 2 + 5;
		right.visible = false;
		right.name = "right";

		constrains.push( right );		
		
		return constrains;
	}

	static fadeIn( obj, o, speed = 0.05 ) {
		if ( obj.material.opacity < o ) {
			obj.material.opacity += speed;
		}
		if ( Math.floor( obj.material.opacity ) === o ) {
			clearTimeout( SceneHelper.fadeTimers[obj] );
			return;
		}
		SceneHelper.fadeTimers[obj] = setTimeout(() => SceneHelper.fadeIn( obj, o, speed ), 10);
	}
	
	static fadeOut( obj, o, speed = 0.05 ) {
		if ( obj.material.opacity > o ) {
			obj.material.opacity -= speed;
		}
		if ( Math.ceil( obj.material.opacity ) < o ) {
			obj.material.opacity = o;
			clearTimeout( SceneHelper.fadeTimers[obj] );
			return;
		}
		SceneHelper.fadeTimers[obj] = setTimeout(() => SceneHelper.fadeOut( obj, o, speed ), 10);
	}	
	
	static visibleHeightAtZDepth( depth, camera ) {
	  // compensate for cameras not positioned at z=0
	  const cameraOffset = camera.position.z;
	  if ( depth < cameraOffset ) depth -= cameraOffset;
	  else depth += cameraOffset;

	  // vertical fov in radians
	  const vFOV = camera.fov * Math.PI / 180; 

	  // Math.abs to ensure the result is always positive
	  return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
	};

	static visibleWidthAtZDepth( depth, camera ) {
	  const height = SceneHelper.visibleHeightAtZDepth( depth, camera );
	  return height * camera.aspect;
	};		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
	
	static positionObject( obj, camera, cornerX, cornerY ) {
		SceneHelper.corner.set( cornerX, cornerY ); // NDC of the bottom-left corner
		SceneHelper.raycaster.setFromCamera( SceneHelper.corner, camera );
		SceneHelper.raycaster.ray.intersectPlane( SceneHelper.plane, SceneHelper.cornerPoint );
		obj.position.copy( SceneHelper.cornerPoint ).add( new THREE.Vector3( 1, 0, -1 ) ); // align the position of the object
		obj.__dirtyPosition = true;
	}	
	
	static createText( text, settings = { fontSize:16, fontFace:"Arial", color:"rgba(186,188,204,1)" } ) {

		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		context1.font = settings.fontSize + "px " + settings.fontFace;
		context1.fillStyle = settings.color;
		context1.fillText(text, 0, 60);
		var metrics = context1.measureText( text );

		// canvas contents will be used for a texture
		var texture1 = new THREE.Texture(canvas1)
		texture1.needsUpdate = true;

		var material1 = new THREE.SpriteMaterial({ map: texture1, useScreenCoordinates:false });

		var sprite = new THREE.Sprite( material1 );
		sprite.scale.set(0.5 * settings.fontSize, 0.25 * settings.fontSize, 0.75 * settings.fontSize);
		sprite.userData.width = metrics.width;
		return sprite; //mesh1;
	}
	
	
	// Collision
	static getCollision( obj1, obj2 ) {
		
		var xdist = obj1.position.x - obj2.position.x;
		var ydist = obj1.position.y - obj2.position.y;
		if (Math.sqrt(xdist * xdist + ydist * ydist) < obj1.width + obj2.width) {
			// Handle collision here
		}
	}
	
	
	//
	// http://easings.net/#easeInOutQuart
	//  t: current time
	//  b: beginning value
	//  c: change in value
	//  d: duration
	//
	static easeInOutQuart( t, b, c, d ) {
	  if (( t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t + b;
	  return -c / 2 * ( (t -= 2 ) * t * t * t - 2 ) + b;
	}	
	
}
	
SceneHelper.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 1));
SceneHelper.raycaster = new THREE.Raycaster();
SceneHelper.corner = new THREE.Vector2();
SceneHelper.cornerPoint = new THREE.Vector3();
SceneHelper.fadeTimers = {};