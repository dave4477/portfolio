/**
 * The Loader class is responsible for loading files.
 * Once all files are loaded we fulfill the promise.
 */
const HTTP_STATUS_OK = 200;

export default class Loader {
	constructor() {
		this._numFiles = 0;
		this._files = {};
	}

	/**
	 * Loads a bunch of files.
	 * @param {string} url The url for the file to load.
	 */
	loadFiles(files) {
		return new Promise((resolve, reject) => {
			this._numFiles = files.length;
			files.forEach(url => {
				this.loadFile(url, resolve, reject);
			});	
		});
	}

	loadFile(url, resolve, reject) {	
		var request = new XMLHttpRequest();
		request.open("GET", url, true);
		request.responseType = "json";
		request.onreadystatechange = ((request) => {
			if (request.readyState === XMLHttpRequest.DONE) {
				if (request.status !== HTTP_STATUS_OK) {
					this._throwLoadError(url);
				}
				this._fileLoaded(url, request, resolve);
			}
		}).bind(undefined, request);
		request.send();
	}
	
	_fileLoaded(url, request, resolve) {		
		this._files[url] = request.response;
		if (Object.keys(this._files).length === this._numFiles) {
			resolve(this._files);
			this._files = {};
		}
	}
	
	_throwLoadError(url) {
		console.warn("Could not load file with url:", url);
		this._files[url] = null;
	}
}