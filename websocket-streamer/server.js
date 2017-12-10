'use strict';

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const hash = string => {
  const f = crypto.createHash('sha256');

  f.update(string);
  return f.digest('hex')
}

var app = express();
var http = require('http');
var net = require('net');
var WebSocketServer = require('websocket').server;

// manages the express server -- the backend
class Server {
  constructor (manager, config) {
    this.app = express();
      var output_tcp_socket = null;
      for(let i=0;i<manager.stream_keys.length;i++)
      {
        manager.streams[manager.stream_keys[i]].connect();
            output_tcp_socket = new net.Socket({
                          allowHalfOpen: true,
                          readable: true,
                          writable: true
                          });
        
        output_tcp_socket.connect(manager.stream_configs[manager.stream_keys[i]].tcpPort, 'localhost', function (){ /* console.log("Connection established via tcp stream"); */ });
        manager.streams[manager.stream_keys[i]].pipe(output_tcp_socket);
          
      }    
  }

  // start the server
  start () {
//    this.server = this.app.listen(this.app.get('port'), () => {
//      console.log(`Listening on :${this.app.get('port')}`);
//    });
  }

  stop () {
    this.server.close();
  }
}

module.exports = Server;
