'use strict';

const express = require('express');
const path = require('path');


//var express = require('express');
var app = express();
var http = require('http');
var net = require('net');
var WebSocketServer = require('websocket').server;
var firstPacket = [];

/** All ws clients */
var wsClients = [];

var options = {
    httpPort: 8081,
    tcpPort: 9090
};

// manages the express server -- the backend
class Server {
  constructor (manager, config) {
    this.app = express();

    // define view engine and endpoints
//    this.app.set('port', process.env.PORT || 8081);
//    var server = http.createServer(this.app);
//    server.listen(options.httpPort);

//    this.app.set('view engine', 'pug');
//    this.app.settings['x-powered-by'] = false;

    // serve static files to client
//    this.app.use('/static', express.static(path.join(__dirname, 'static')));

    // render index with config logo and streams
//    this.app.get('/', (request, response) => {
//      response.render('index', {
//        logo: config.logo || null,
//        streams: manager.streams || []
//      });
//    });

//    console.log(Object.keys(manager.streams)[0]);
    
//    // stream from re-encoded stream
//    this.app.get('/stream/:uid', (request, response, next) => {
//      request.on('close', next);
//
//      manager.streams[request.params.uid].connect();
      console.log("Connecting Stream");
      manager.streams[Object.keys(manager.streams)[0]].connect();
      console.log("Piping response");
//      manager.streams[1].pipe(response);
      var output_tcp_socket = new net.Socket({
                        allowHalfOpen: true,
                        readable: true,
                        writable: true
                        });
      output_tcp_socket.connect('9090', 'localhost', function (){ console.log("Connection established via tcp stream"); });
      manager.streams[Object.keys(manager.streams)[0]].pipe(output_tcp_socket);
//      manager.streams[request.params.uid].pipe(response);
//    }, (request, response) => {
//      manager.streams[request.params.uid].disconnect();
//    });
    
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
