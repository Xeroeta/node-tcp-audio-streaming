(function(){
'use strict';

var codecString = '';
/**
 *  Set to whatever codec you are using
 */

 codecString = 'audio/mp4; codecs="mp4a.67"';
//codecString = 'video/webm; codecs="vp8"';
// codecString = 'video/webm; codecs="vp9"';



var video = document.getElementById('video');
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var buffer = null;
var queue = [];

var bufferArray = [];

function updateBuffer(){
    if (queue.length > 0 && !buffer.updating) {
        buffer.appendBuffer(queue.shift());
    }
}

/**
 * Mediasource
 */
function sourceBufferHandle(){
    buffer = mediaSource.addSourceBuffer(codecString);
    buffer.mode = 'sequence';

    console.log('adding sourceBufferHandle');
    buffer.addEventListener('update', function() { // Note: Have tried 'updateend'
        console.log('update');
        updateBuffer();
    });

    buffer.addEventListener('updateend', function() {
        console.log('updateend');
        updateBuffer();
    });

    initWS();
}

mediaSource.addEventListener('sourceopen', sourceBufferHandle)

function initWS(){
    var tcp_port = '8080';
    //window.location.port
    console.log('initialising web socket');
    var ws = new WebSocket('ws://' + window.location.hostname + ':' + tcp_port, 'echo-protocol');
    ws.binaryType = "arraybuffer";

    ws.onopen = function(){
        console.info('WebSocket : Sending ping.');
        ws.send('Ping');
        console.info('WebSocket : ping sent.');
        console.info('WebSocket connection initialized');
    };

    ws.onmessage = function (event) {
        console.info('Recived WS message.', event);

        if(typeof event.data === 'object'){
            if (buffer.updating || queue.length > 0) {
                queue.push(event.data);
            } else {
                buffer.appendBuffer(event.data);
                video.play();
            }
        }
    };
    
    ws.onclose = function(){
        console.info('WebSocket connection closed');
    };

}


})();