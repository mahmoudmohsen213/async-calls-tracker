// this is a module that tracks a collection of async calls, and notify the
// main caller when all of them are done through the onDone function, and send
// the arguments passed to the callbacks of the async calls as an array of
// arguments objects
const FILE_NAME = 'async-calls-tracker';
const END_EVENT_NAME = 'end';

function tracker(){
	var self = this;
	self.observedCalls = [];
	self.observedCallsArguments = [];
	self.collectedCallbackArguments = [];
	self.eventHandlers = [];
	
	// set the event handler of each event
	self.on = function(eventName, eventHandler){
		if(typeof eventName !== 'string')
			throw new TypeError('eventName must be a string object', FILE_NAME);
		
		if(typeof eventHandler !== 'function')
			throw new TypeError('eventHandler must be a function object', FILE_NAME);
		
		self.eventHandlers[eventName] = eventHandler;
		return self;
	}

	// collect the arguments passed to the callbacks from the observed async calls
	self.collectCallbackArguments = function(...args){
		self.collectedCallbackArguments.push(args);
		if((self.eventHandlers[END_EVENT_NAME])&&
			(self.collectedCallbackArguments.length == self.observedCalls.length)){
			self.eventHandlers[END_EVENT_NAME](self.collectedCallbackArguments);
		}
	};

	// accepts the function to be observed, in addition to an arbtrary number of
	// parameters to be passed to the observed function on its invokation
	self.addCall = function(observedCall, ...args){
		if(typeof observedCall !== 'function')
			throw new TypeError('observedCall must be a function object', FILE_NAME);
		
		self.observedCalls.push(observedCall);
		self.observedCallsArguments.push(args);
		return self;
	};

	// invoke all async calls
	self.invokeCalls = function(){
		for(var i = 0; i < self.observedCalls.length; ++i){
			self.observedCallsArguments[i].push(self.collectCallbackArguments);
			self.observedCalls[i](...(self.observedCallsArguments[i]));
		}
		return self;
	};
}

function trackerFactory(){
	return new tracker();
}

module.exports = trackerFactory;