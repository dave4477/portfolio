/**
 * subscriptions data format: 
 * { eventType: { id: callback } }
 */

const singleton = Symbol();
const eventBus = Symbol();

const subscriptions = { };
//const getNextUniqueId = getIdGenerator();

let _id = 0;
	

class EventBus {
	constructor(enforcer) {
		if (enforcer !== eventBus) {
		  throw new Error('Cannot construct singleton');
		}
	}

	static get instance() {
		if (!this[singleton]) {
		  this[singleton] = new EventBus(eventBus);
		}
		return this[singleton];
	}
 
	static subscribe(eventType, callback) {
		const id = _id++; //EventBus.getIdGenerator().getNextUniqueId(); //getNextUniqueId(); 

		if(!subscriptions[eventType])
			subscriptions[eventType] = { }

		subscriptions[eventType][id] = callback

		return { 
			unsubscribe: () => {
				delete subscriptions[eventType][id]
				if(Object.keys(subscriptions[eventType]).length === 0) delete subscriptions[eventType]
			}
		}
	} 

	static publish(eventType, arg) {
		if(!subscriptions[eventType])
			return

		Object.keys(subscriptions[eventType]).forEach(key => subscriptions[eventType][key](arg))
	}	
}

export default EventBus;
