// this is a module that tracks a collection of async calls, and notify the
// main caller when all of them are done through the onDone function, and send
// the arguments passed to the callbacks of the async calls as an array of
// arguments objects
function tracker(){
	var self = this;
	self.observedCalls = [];
	self.observedCallsArguments = [];
	self.collectedCallbackArguments = [];
	self.onDone = null;
	
	// set the onDoneCallback which is called when all observed async calls return
	// the tracker pass the collected arguments in an array
	self.setOnDoneCallback = function(onDoneCallback){
		self.onDone = onDoneCallback;
	}

	// collect the arguments passed to the callbacks from the observed async calls
	self.collectCallbackArguments = function(...args){
		self.collectedCallbackArguments.push(args);
		if((self.onDone)&&
			(self.collectedCallbackArguments.length == self.observedCalls.length)){
			self.onDone(self.collectedCallbackArguments);
		}
	};

	// accepts the function to be observed, in addition to an arbtrary number of
	// parameters to be passed to the observed function on its invokation
	self.addCall = function(observedCall, ...args){
		self.observedCalls.push(observedCall);
		self.observedCallsArguments.push(args);
	};

	// invoke all async calls
	self.invokeCalls = function(){
		for(var i = 0; i < self.observedCalls.length; ++i){
			self.observedCallsArguments[i].push(self.collectCallbackArguments);
			self.observedCalls[i](...(self.observedCallsArguments[i]));
		}
	};
}

function trackerFactory(){
	return new tracker();
}

module.exports = trackerFactory;