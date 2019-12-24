import Loader from './../service/Loader.js';
import ControllerCore from './ControllerCore.js';
import AppModel from './../model/AppModel.js';
import {TextureLoader} from './../three.module.js';

export default class DataRequestController extends ControllerCore {

	constructor() {
		super();
		this.loader = new Loader();
		this.textureLoader = new TextureLoader();
		this.appModel = new AppModel();
		this.addListeners();
	}
	
	addListeners() {
		this.addListener( 'loadInitData', ( url ) => {
			this.getData( url ).then(( result ) => {
				this.appModel.categoryData = result[url];
			}, ( error) => {
				console.log( "all is messed up" );
			});
		});

		this.addListener( 'getItemData', ( url ) => {
			this.getData( url ).then(( result ) => {
				this.appModel.itemData = result[url];
			}, ( error ) => {
				console.log( "all is messed up");
			});
		});

	}
	
	async getData( url ) {
		return this.loader.loadFiles( [url] );
	}
}
