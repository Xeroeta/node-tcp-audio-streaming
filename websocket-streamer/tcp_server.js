/// Server:

var server = require('net').createServer();

function onConnection(socket) {

    /// Create the transform stream:
    var uppercase = new Transform({decodeStrings: false});

    uppercase._transform = function (chunk, encoding, done) {
        done(null, chunk.toUpperCase());
    };

    /// pipe socket
    socket.setEncoding('utf8');
    socket.pipe(uppercase).pipe(socket);
}

server.on('connection', onConnection);

server.listen(9090);