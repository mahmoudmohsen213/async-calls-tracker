var trackerFactory = require('./async-calls-tracker.js');
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