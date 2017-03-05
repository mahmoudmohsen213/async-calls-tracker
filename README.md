# async-calls-tracker
A node module that tracks a collection of async calls, and notify the main caller when all of them are done through the 'end' event handler provided, and send the arguments passed to the callbacks of the async calls.

## Use case:
Imagine having a number of asynchronous functions, which will be called one after the other and executed asynchronously but we want to collect the returned values provided through callbacks from all functions, and use them all together.

## Usage:
The module exports a constructor function which can be used to create new instances of the object
```
var trackerFactory = require(async-calls-tracker);
var tracker1 = trackerFactory();
var tracker2 = trackerFactory();
```
here tracker1 and tracker2 are two distinct objects.

The tracker exposes three functions .on(), .add(), and .invoke().
#### .on(eventName, eventHandler)
Used to register event handlers, currently there is only one event in use which is 'end' event. eventName should be a string for example 'end'. eventHandler should be a function object. The 'end' event is triggered after every observed call has invoked its callback, which signals its return. The 'end' event handler should take one argument which is an array of arrays, the i-th array is a collection of the arguments passed to the callback by i-th observed calls in the order of addition.
```
tracker1.on('end', function(args){
	console.log(args);
});
```
#### .add(async_function[, ...args])
Used to add an asynchronous function to be observed. The other parameters are the parameters to be passed to the async_function on its invokation, except the callback. The module injects a function as a callback to collect the callback arguments, and notify the main caller through the 'end' event handler.
```
// assume test1 and test2 are two asynchronous functions
function test1(param1, param2, callback){
	// some asynchronous code
}

function test2(param1, param2, param3, callback){
	// some asynchronous code
}

tracker1.addCall(test1, 'test1param1', 'test1param2');
tracker1.addCall(test2, 'test2param1', 'test2param2', 'test2param3');
```
note that the passed function must consider its last argument as a callback. For example, setTimeout() take the callback as the first argument, to use it we need a wrapper to rearrange the arguments
```
function test3(param1, param2, callback){
	setTimeout(callback, 6000, param1, param2);
}
```
#### .invoke()
Calling this function will invoke all the added asynchronous functions. Until the 'end' event is triggered, any attempt to add a new asynchronous function, or calling .invoke() again will result in an error. After all functions call their callbacks, the 'end' event will be triggered.
```
tracker1.invoke();
```
## Full code sample:
```
var trackerFactory = require('./async-calls-tracker.js');
var tracker = trackerFactory();

function test1(param1, param2, callback){
	setTimeout(function(){
		console.log('test1: ', param1, param2);
		callback('test1 callback ' + param1);
	}, 6000);
}

function test2(param1, param2, param3, callback){
	setTimeout(function(){
		console.log('test2: ', param1, param2, param3);
		callback('test2 callback');
	}, 2000);
}

tracker.add(test1, 'test1param1', 'test1param2')
.add(test2, 'test2param1', 'test2param2', 'test2param3')
.add(test1, 'test1param3', 'test1param4')
.on('end', function(args){
	console.log(args);
});

tracker.invoke();
```
