/*

JavaScript Emscripten Bitcoin Miner

This code creates a Web Worker "thread" and passes along the configuration.

The MIT License (MIT)

Copyright (c) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
var ws = null;
var worker = null;

function rpc(message){
  message = JSON.stringify(message);
  console.log("Put: " + message);
  ws.send(message + "\n");
}

function stratum(event){
  console.log("Got: " + event.data);
  if(event.data instanceof Blob){
    console.warn("Ignoring a binary blob");
    return;
  }
  var message = JSON.parse(event.data);
  if(message.error != null){
    console.error(message.error);
    ws.close();
    return;
  }
  
  handle(message);
}

var job = null;

function handle(message){
  switch(message.type){
    case "job":
      // Extract the job parameters
	  var vacancy = message.params;
      // Post job template to the worker
      if(job == null){
        worker.postMessage(JSON.stringify(vacancy));
      }
      // Remember current vacancy
      job = vacancy;
      break;
    case "authed":
        console.log("Authorized");
      break;
    case "hash_accepted":
        console.log("Hash Accepted");
      break;
    case "client.reconnect":
      if(message.params[0] != null){
        configuration.host = message.params[0];
      }
      if(message.params[1] != null){
        configuration.port = message.params[1];
      }
      var wait = message.params[2];
      console.log("Server requested to reconnect");
      ws.close();
      break;
    case "client.show_message":
      console.log("Server message: " + message.params[0]);
      break;
    default:
      console.warn("I can't handle it: " + message.method);
  }
}

function opened(event){
  console.log("WS Opened");
  console.log(event);
  var parameters = {site_key:configuration.user,type:"user",user:configuration.worker}
  var message = {type:"auth", params:parameters};
  rpc(message);
}

function failed(event){
  ws.close();
  console.log("WS Error");
  console.error(event);
  setTimeout(connect, 30000);
}

function closed(event){
  ws.close();
  console.log("WS Closed");
  console.log(event);
  setTimeout(connect, 1000);
}

function connect(){
  ws = new WebSocket(configuration.ws);
  ws.onmessage = stratum;
  ws.onopen = opened;
  ws.onerror = failed;
  ws.onclose = closed;
}

function callback(event){
  if(event.data.length != 0){
    console.log("Called back with: " + event.data);
    var result = JSON.parse(event.data);
	
	var parameters = {"job_id":result.job_id,"nonce":result.nonce,"result":result.hex}
    var message = {type:"submit", params:parameters};
    rpc(message);
  }
  worker.postMessage(JSON.stringify(job));
}

// Checks if Web Workers API is supported
function works(){
  return(typeof window.Worker === "function");
}

// Creates a Web Worker "thread" if possible and pass along the configuration
function work(configuration){
  if(works()){
    this.configuration = configuration;
    worker = new Worker("/stratum/js/worker.js");
    worker.onmessage = callback;
    connect();
  }else{
    console.log("Idle (Web Workers API is not supported)");
  }
}
