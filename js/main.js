import DataRequestController from './controller/DataRequestController.js';
import EventBus from './core/EventBus.js';
import world from './World.js';

export default class Main {

	constructor() {
		this.dataRequestController = new DataRequestController();
		this.addListeners();
	}
	
	addListeners() {
		EventBus.subscribe('initDataLoaded', ( data ) => {
			this.initLoaded( data );
		});	
	}
	
	startApp() {
		EventBus.publish("loadInitData", "http://www.detailed-simplicity.com/getData.php?action=portfolio&category=Flash%20Games");
	}
	
	initLoaded( data ) {
		world.initScene( data );
	}
}

var main = new Main();
main.startApp();
