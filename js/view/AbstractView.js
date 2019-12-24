import * as THREE from './../three.module.js';
import EventBus from './../core/EventBus.js';

let instance;

export default class AbstractView {

	constructor() {
		if ( !instance ) {
			instance = this;
		}
		return instance;		
	}

	render( dt ) {
		EventBus.publish( 'render', dt );
		
		window.requestAnimationFrame(() => this.render() );
	}
}