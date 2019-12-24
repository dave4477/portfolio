	/*
	createParticles() {
		var geometry = new THREE.BufferGeometry();
		var vertices = [];

		var textureLoader = this.loader;

		var sprite1 = textureLoader.load( 'images/star.png' );
		var sprite2 = textureLoader.load( 'images/sparkle.png' );
		var sprite3 = textureLoader.load( 'images/star.png' );
		var sprite4 = textureLoader.load( 'images/sparkle.png' );
		var sprite5 = textureLoader.load( 'images/star.png' );

		for ( var i = 0; i < 1000; i ++ ) {

			var x = Math.random() * 4000 - 2000;
			var y = 200 - Math.random() * 175;
			var z = -1 * (Math.random() * 2000); 

			vertices.push( x, y, z );

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

		this.parameters = [
			[[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
			[[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
			[[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
			[[ 0.85, 0, 0.5 ], sprite5, 8 ],
			[[ 0.80, 0, 0.5 ], sprite4, 5 ]
		];

		for ( var i = 0; i < this.parameters.length; i ++ ) {

			var color = this.parameters[ i ][ 0 ];
			var sprite = this.parameters[ i ][ 1 ];
			var size = this.parameters[ i ][ 2 ];

			this.particleMaterials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true } );
			this.particleMaterials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

			var particles = new THREE.Points( geometry, this.particleMaterials[ i ] );

			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;
			
			particles.position.z = -100;
			this.scene.add( particles );
		}
	}
	
	
	updateParticles() {
		var time = Date.now() * 0.00005;

		for ( var i = 0; i < this.scene.children.length; i ++ ) {

			var object = this.scene.children[ i ];

			if ( object instanceof THREE.Points ) {
				object.position.x += 0.1;
			}
		}
		
		var color;
		var h;
		for ( var i = 0; i < this.particleMaterials.length; i ++ ) {
			color = this.parameters[ i ][ 0 ];
			h = ( 360 * ( color[ 0 ] + time ) % 360 ) / 360;
			this.particleMaterials[ i ].color.setHSL( h, color[ 1 ], color[ 2 ] );
		}		
	}
	*/