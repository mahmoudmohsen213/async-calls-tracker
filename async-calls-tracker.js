// this is a module that tracks a collection of async calls, and notify the
// main caller when all of them are done through the onDone function, and send
// the arguments passed to the callbacks of the async calls as an array of
// arguments objects
var tracker = [];
tracker.observedCalls = [];
tracker.observedCallsArguments = [];
tracker.collectedCallbackArguments = [];
tracker.onDone = null;

// set the onDoneCallback which is called when all observed async calls return
// the tracker pass the collected arguments in an array
tracker.setOnDoneCallback = function(onDoneCallback){
	tracker.onDone = onDoneCallback;
}

// collect the arguments passed to the callbacks from the observed async calls
tracker.callbackArgumentsCollector = function(){
	tracker.collectedCallbackArguments.push(arguments);
	if((tracker.onDone)&&
		(tracker.collectedCallbackArguments.length == tracker.observedCalls.length)){
		tracker.onDone(tracker.collectedCallbackArguments);
	}
};

// accepts the function to be observed, in addition to an arbtrary number of
// parameters to be passed to the observed function on its invokation
tracker.addCall = function(observedCall){
	var args = Array.prototype.slice.call(arguments, 1);
	tracker.observedCalls.push(observedCall);
	tracker.observedCallsArguments.push(args);
};

// invoke all async calls
tracker.invokeCalls = function(){
	for(var i = 0; i < tracker.observedCalls.length; ++i){
		tracker.observedCallsArguments[i].push(tracker.callbackArgumentsCollector);
		tracker.observedCalls[i](...(tracker.observedCallsArguments[i]));
	}
};

module.exports = tracker;