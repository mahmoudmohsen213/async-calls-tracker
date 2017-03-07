/* 
 * A node module that tracks a collection of async calls, and notify the main 
 * caller when all of them are done through a provided event handler, and forward
 * the arguments passed to the callbacks by the observed calls.
 */

const EVENT_END = 'end';

function tracker(){
	var self = this;
	self.observedCalls = [];
	self.observedCallsArguments = [];
	self.collectedCallbackArguments = [];
	self.eventHandlers = [];
	self.runningCalls = 0;
	
	// set the event handler of each event
	self.on = function(eventName, eventHandler){
		if(typeof eventName !== 'string')
			throw new TypeError('the first argument must be a string object');
		
		if(typeof eventHandler !== 'function')
			throw new TypeError('the second argument must be a function object');
		
		self.eventHandlers[eventName] = eventHandler;
		return self;
	}

	// collect the arguments passed to the callbacks from the observed async calls
	self.collectCallbackArguments = function(callbackArgsWrapper){
		self.collectedCallbackArguments[callbackArgsWrapper.callerIndex] = callbackArgsWrapper.args;
		self.runningCalls--;
		
		if((self.runningCalls === 0)&&(self.eventHandlers[EVENT_END]))
			self.eventHandlers[EVENT_END](self.collectedCallbackArguments);
	};

	// accepts the function to be observed, in addition to an arbtrary number of
	// parameters to be passed to the observed function on its invokation
	self.add = function(observedCall, ...args){
		if(self.runningCalls > 0)
			throw new Error('this tracker is already running');
		
		if(typeof observedCall !== 'function')
			throw new TypeError('the first argument must be a function object');
		
		self.observedCalls.push(observedCall);
		self.observedCallsArguments.push(args);
		self.collectedCallbackArguments.push(0);
		return self;
	};

	// invoke all async calls
	self.invoke = function(){
		if(self.runningCalls > 0)
			throw new Error('this tracker is already running');
		
		self.runningCalls = self.observedCalls.length;
		
		for(var i = 0; i < self.observedCalls.length; ++i){
			let index = i;
			self.observedCallsArguments[i].push(function(...callbackArgs){
				self.collectCallbackArguments({callerIndex:index, args:callbackArgs});
			});
			
			self.observedCalls[i](...(self.observedCallsArguments[i]));
		}
		
		return self;
	};
}

function trackerFactory(){
	return new tracker();
}

module.exports = trackerFactory;