# async-calls-tracker
A node module that tracks a collection of async calls, and notify the main caller when all of them are done through a provided event handler, and forward the arguments passed to the callbacks by the observed calls.

## Use case:
This module works for fork-join situations, when we have a number of asynchronous functions, which will be called one after the other and executed asynchronously but we want to collect the returned values provided through callbacks from all functions, and use them all together.

## Usage:
The module exports a constructor function which can be used to create new instances of the object
```
var trackerFactory = require('async-calls-tracker');
var tracker1 = trackerFactory();
var tracker2 = trackerFactory();
```
here tracker1 and tracker2 are two distinct objects.

The tracker exposes four functions .on(), .add(), .addWithCallback() and .invoke().

#### .on(eventName, eventHandler)
Used to register event handlers, currently there are two events in use which are 'end' and 'callback' events. eventName should be a string for example 'end'. eventHandler should be a function object.

The 'end' event is triggered after every observed call has invoked its callback, which signals its return. The 'end' event handler should take one argument which is an array of arrays, the i-th array is a collection of the arguments passed to the callback by i-th observed call in the order of addition.

The 'callback' event is triggered when any of the observed functions call its callback. Note that if the observed function is added with a specific callback for it, it will also be invoked in addition to triggering this event, so we can have a specific callback for each observed call, a general callback when any of them finishes, and a final callback when all of them finish.
```
tracker1.on('callback', function(args){
	console.log('tracker callback event:');
	console.log(args);
});

tracker1.on('end', function(args){
	console.log('tracker end event:');
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
#### .addWithCallback(async_function, callback[, ...args])
It is the same as the previous function, but takes the second paramter as a callback specific to the newly added async function to be called when the newly added function call its callback.
```
function test3(param1, param2, callback){
    setTimeout(function(){
        console.log('test3: ', param1, param2);
        callback('test3 callback param1', 'test3 callback param2');
    }, 5000);
}

function test3Callback(param1, param2){
    console.log('test3Callback: ', param1, param2);
}

tracker1.addWithCallback(test3, test3Callback, 'test3param5', 'test3param6');
```
#### .invoke()
Calling this function will invoke all the added asynchronous functions. Any attempt to call .invoke() again will result in an error until all observed calls finishes and call their callbacks. After all functions call their callbacks, the 'end' event will be triggered.
```
tracker1.invoke();
```
## Full code sample:
```
var trackerFactory = require('async-calls-tracker');
var tracker = trackerFactory();

function test1(param1, param2, callback){
    setTimeout(function(){
        console.log('test1: ', param1, param2);
        callback('test1 callback ' + param1);
    }, 8000);
}
 
function test2(param1, param2, param3, callback){
    setTimeout(function(){
        console.log('test2: ', param1, param2, param3);
        callback('test2 callback');
    }, 2000);
}

function test3(param1, param2, callback){
    setTimeout(function(){
        console.log('test3: ', param1, param2);
        callback('test3 callback param1', 'test3 callback param2');
    }, 5000);
}

function test3Callback(param1, param2){
    console.log('test3Callback: ', param1, param2);
}

tracker.add(test1, 'test1param1', 'test1param2')
.add(test2, 'test2param1', 'test2param2', 'test2param3')
.add(test1, 'test1param3', 'test1param4')
.addWithCallback(test3, test3Callback, 'test3param5', 'test3param6')
.on('callback', function(args){
	console.log('tracker callback event:');
	console.log(args);
}).on('end', function(args){
	console.log('tracker end event:');
    console.log(args);
});
 
tracker.invoke();
```
