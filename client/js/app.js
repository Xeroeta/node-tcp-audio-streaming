
// alternative to load event
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    initApplication();
  }
}

function initApplication(){
'use strict';

var codecString = '';
/**
 *  Set to whatever codec you are using
 */

 codecString = 'audio/mp4; codecs="mp4a.67"';
// codecString = 'video/mp2t; codecs="avc1.42E01E,mp4a.40.2"';
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

    wait(1000); 
    initWS();
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
var messages_counter = 0;
var messages_log_limit = 100;
var messages_log_flag = true;
mediaSource.addEventListener('sourceopen', sourceBufferHandle);

function initWS(){
    var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port+'/channel/f7f3b8e344c07ea2a6fbb0e011326f0e78234a36694c783a5b7afa4887f20cdf?param=12345', 'echo-protocol');
    ws.binaryType = "arraybuffer";

    ws.onopen = function(){
        console.info('WebSocket connection initialized');
    };

    ws.onmessage = function (event) {
        
        messages_log_flag && console.info('Recived WS message.', event);
        
        messages_counter+=1;
        if(messages_log_limit<messages_counter)
        {
            messages_log_flag = false;
        }
        if(typeof event.data === 'object'){
            messages_log_flag && console.log('State: '+mediaSource.readyState + ' :');
            if (mediaSource.readyState != 'open' || buffer.updating || queue.length > 0) {
                messages_log_flag && console.info('Media source is not open or buffering ' + buffer.updating + ' - Pushing to Queue');
                queue.push(event.data);
            } else {
                messages_log_flag && console.info('Appending buffer');
                buffer.appendBuffer(event.data);
                messages_log_flag && console.info('Now Play audio!!!!');
                video.play();
                messages_log_flag && console.info('After Play audio!!!!');
            }
        }
    };
    
    ws.onclose = function(){
        console.info('WebSocket connection closed');
    };

}


};