var http = require('http');
var net = require('net');
var path = require('path');
var express = require('express');
const crypto = require('crypto');

var app = express();
var WebSocketServer = require('websocket').server;

/** All Channels first  packets buffer */
var channelFirstPacket = [];

/** All Channel ws clients */
var channelWsClients = [];


// get the config
const file = path.resolve(process.argv[2]); // arg to absolute path
const config = require(file); // merge config file

// get sha256 in hex string
const hash = string => {
  const f = crypto.createHash('sha256');

  f.update(string);
  return f.digest('hex')
}

var stream_configs = config.manager.streams;

var stream_configs_hash = [];
for(let i=0;i<stream_configs.length;i++)
{
    channelWsClients[hash(stream_configs[i].source)]=[];
    channelFirstPacket[hash(stream_configs[i].source)] = [];
    stream_configs_hash.push({
        "name": stream_configs[i].name,
        "uid": hash(stream_configs[i].source)
    });
}

app.use('/static', express.static(path.join(__dirname, '../client/static')));

app.set('view engine', 'pug');
app.settings['x-powered-by'] = false;

/**
 * render and send index.pug over http
 */
app.get('/', function(req, res){
    res.render('index', {
        logo: config.server.logo || null,
        streams: stream_configs_hash || []
      });
});

/** HTTP server */
var server = http.createServer(app);
server.listen(config.server.httpPort);

var listnerTcpServer = null;
/** TCP Servers */
for(let i=0;i<stream_configs.length;i++)
{
    /** TCP server */
    listnerTcpServer = net.createServer(function(socket) {
        socket.on('data', function(data){
          if(channelFirstPacket[hash(stream_configs[i].source)].length < 3){
            channelFirstPacket[hash(stream_configs[i].source)].push(data); 
          }
          console.log('Packet of size(' + data.length + ') received on port - ' + 
                  stream_configs[i].tcpPort + ' from ' + stream_configs[i].name);

          /**
           * Send stream to all clients connected to this stream/channel
           */
          channelWsClients[hash(stream_configs[i].source)].map(function(client, index){
            client.sendBytes(data);
          });
        });
    });

    listnerTcpServer.listen(stream_configs[i].tcpPort, 'localhost');
//    console.log("Listening to stream/channel:  "+stream_configs[i].name);
}

/** Websocet */
var wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
  var connection = request.accept('echo-protocol', request.origin);
  let url = require('url').parse(request.httpRequest.url);
  let selected_channel = url.pathname.substring(9);
  
  console.log((new Date()) + ' Connection accepted for channel - ' + selected_channel);

  if(channelFirstPacket[selected_channel].length){
    /**
     * Every user will get beginnig of stream 
    **/ 
    channelFirstPacket[selected_channel].map(function(packet, index){
      connection.sendBytes(packet); 
    });
  }
  
  /**
   * Add this connection to selected channel
   */
  channelWsClients[selected_channel].push(connection);

  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});