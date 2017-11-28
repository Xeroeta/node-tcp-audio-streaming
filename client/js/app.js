(function(){
'use strict';

var codecString = '';
/**
 *  Set to whatever codec you are using
 */

// codecString = 'audio/mp4; codecs="mp4a.67"';
 codecString = 'audio/mp4; codecs="mp4a.40.2"';
//codecString = 'video/webm; codecs="vp8"';
// codecString = 'audio/mp3';



var video = document.getElementById('audio');
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var buffer = null;
var queue = [];

var bufferArray = [];

function updateBuffer(){
    console.log("Queue Length: ");
    console.log(queue.length);
    
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
    var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port, 'echo-protocol');
    ws.binaryType = "arraybuffer";

    ws.onopen = function(){
        console.info('WebSocket connection initialized');
    };

    ws.onmessage = function (event) {
        console.info('Recived WS message.', event);

        if(typeof event.data === 'object'){
            if (buffer.updating || queue.length > 0) {
                console.info('Pushing to Queue');
                queue.push(event.data);
            } else {
                console.info('Appending buffer');
                buffer.appendBuffer(event.data);
                console.info('Now Play audio!!!!');
                video.play();
                console.info('After Play audio!!!!');
            }
        }
    };
    
    ws.onclose = function(){
        console.info('WebSocket connection closed');
    };

}


})();