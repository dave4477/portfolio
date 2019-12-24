import * as THREE from './three.module.js';
import Loader from './Loader.js';
import EventBus from './EventBus.js';

var dummyResponse = [{"id":"1","thumb":"site40.png"},{"id":"2","thumb":"site2.png"},{"id":"3","thumb":"site3.png"},{"id":"5","thumb":"site5.png"},{"id":"6","thumb":"site6.png"},{"id":"7","thumb":"site7.png"},{"id":"9","thumb":"site9.png"},{"id":"12","thumb":"site12.png"},{"id":"13","thumb":"site13.png"},{"id":"17","thumb":"site17.png"},{"id":"18","thumb":"site18.png"},{"id":"25","thumb":"site25.png"},{"id":"27","thumb":"site27.png"},{"id":"28","thumb":"site28.png"},{"id":"30","thumb":"site30.png"},{"id":"31","thumb":"site31.png"}];
var dummyProject = [{"img":".\/images\/sites\/site30.jpg|.\/images\/sites\/site30b.jpg","client":"OpenBet","projecttype":"Flash Game, slot machine","projectname":"Jungle Bucks","info":"<p>Jungle Bucks is a slot machine written in ActionScript 3. The game has several bonus games like the ostrich race, rampant rhino where a rhino bashes the reels and replaces icons, a monkey swinging by and changing the icons, free spins and more.<\/p>\r\n<p>&nbsp;<\/p>\r\n<p>This game is a conversion of the land based slot machine which can be found on the floor of some casinos, and now features on many online gambling sites.<\/p>\r\n<p>&nbsp;<\/p>\r\n<p>As lead developer I did most of the front-end as well the server integration<\/p>","url":"http:\/\/openbet.idealservers.co.uk\/pkg\/fog\/Servlet\/launch.jsp?gameName=JungleBucks","role":"ActionScript (Lead Developer)","date":"September 2012"}]

class AppController {

	constructor() {
	}
}
const appController = new AppController();

export default appController;