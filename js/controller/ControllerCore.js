import EventBus from './../core/EventBus.js';

let instance;

export default class ControllerCore {

	constructor() {		
		if ( !instance ) {
			instance = this;
		}
		return instance;
	}
	
	addListener( type, fn ) {
		EventBus.subscribe( type, ( data ) => {
			fn( data );
		});	
	}	
}