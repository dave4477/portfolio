import * as THREE from './three.module.js';
import * as TWEEN from './tween.esm.js';


export default class Particles {

	constructor(particle, obj, lifetime = 2000) {
		this.count = 0;
		this.vx = 0;
		this.vy = 0.1;
		this.displacement = 0.045;
		this.float = this.displacement / 2;
		this.obj = obj;
		this.particle = particle;
		this.newScale = 1;
		this.direction = -0.028;
		this.now = new Date();
		
		const vel = obj.getLinearVelocity();
		if ( vel.y > 0 ) {
			this.particleFrom = -1;
		} else if ( vel.y < 0 ) {
			this.particleFrom = 1;
		}
		const objWidth = obj.geometry.boundingBox.max.x - obj.geometry.boundingBox.min.x;
		const objHeight = obj.geometry.boundingBox.max.y - obj.geometry.boundingBox.min.y;
		const objDepth = obj.geometry.boundingBox.max.z - obj.geometry.boundingBox.min.z;

	
		this.particle.lifeTime = lifetime;
		particle.position.x = obj.position.x - ( objWidth / 2 ) + (Math.random() * objWidth );
		particle.position.y = obj.position.y + 3.6;
		particle.position.z = obj.position.z - ( objDepth / 2 ) + (Math.random() * objDepth );
	}
      
	update( dt ) {
		var then = this.now;
		var now = new Date() - then;
		this.count ++;

		const allParticles = this.obj.userData.particles;
		const particleLength = allParticles.length;

		if( now > this.particle.lifeTime || this.particle.userData.isDead ) {
			for ( var i = 0; i < particleLength; i++ ) {
				if ( allParticles[i] === this.particle ) {
					allParticles.splice( i, 1 ); 
					this.particle.parent.remove( this.particle );
				}
			}
			return;
		}
		
		this.particle.position.x = this.particle.position.x + ( this.vx = this.vx + (Math.random() * this.displacement - this.float ));
		this.particle.position.y += this.vy + ( Math.random() * this.displacement - this.float );
		this.particle.position.z = this.particle.position.z + ( this.vx = this.vx + (Math.random() * this.displacement - this.float ));
		this.vy *= 0.9;
		this.newScale += this.direction;
		
		this.particle.scale.set( this.newScale, this.newScale, 1 );

		if (this.newScale < 0.05) {
			this.direction *= -1;
		}

		if ( this.direction > 0.00 && this.newScale > 0.2 ) {
			this.newScale = 0.2;
			this.particle.userData.isDead = true;
		}

		//this.particle.geometry.scale( this.newScale, this.newScale, this.newScale );	
		this.particle.__dirtyScale = true;
	}
	
	sineWave() {
		//var newScale = this.particle.getWorldScale().x * Math.sin( this.start )
		//this.start += 0.5;

	}
}