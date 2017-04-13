# async-calls-tracker
A node module that tracks a collection of async calls, and notify the main caller when all of them are done through a provided event handler, and forward the arguments passed to the callbacks by the observed calls.

## Module Release Log:
### Version 1.0.x:
Initial API. Implmenting the 'end' event, .on(), .add(), and .invoke() functions.
### Version 1.1.x:
Added 'callback' event, and .addWithCallback() function.